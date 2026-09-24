import { useEffect, useState } from "react";
import "./App.css";
import Papa from "papaparse";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import AuthPage from "./AuthPage";
import HistoryPage from "./HistoryPage";
import { auth, db } from "./firebase";

// Configure this in a .env file at your project root:
// VITE_API_URL=http://127.0.0.1:8000
// Falls back to the local FastAPI server for local prediction.
const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const CLUSTERS = [
  {
    id: 1,
    name: "Purchase & Order Requests",
    description:
      "Tickets about buying, ordering, or requesting new hardware, software, or licences.",
  },
  {
    id: 2,
    name: "General Support & Issue Requests",
    description:
      "Broad troubleshooting tickets that don't fit a narrower category.",
  },
  {
    id: 3,
    name: "Access & General Support Requests",
    description:
      "Login, permissions, and account-access issues raised alongside general support.",
  },
  {
    id: 4,
    name: "New Starter & Account Setup",
    description:
      "Onboarding tickets: new accounts, equipment, and first-day setup.",
  },
];

function NavBar({ page, setPage, onLogout }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "history", label: "History" },
    { id: "contact", label: "Contact Us" },
  ];
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button
          className="brand"
          onClick={() => setPage("home")}
          aria-label="Go to home"
        >
          <span className="brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7.5A2.5 2.5 0 0 1 6.5 5H14l5.5 5.5v6A2.5 2.5 0 0 1 17 19H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M8.7 12.6l2.1 2.1 4.3-4.7"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="brand-text">
            Support Ticket <strong>Intelligence</strong>
          </span>
        </button>
        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <button
              key={link.id}
              className={`nav-link ${page === link.id ? "is-active" : ""}`}
              onClick={() => setPage(link.id)}
              aria-current={page === link.id ? "page" : undefined}
            >
              {link.label}
            </button>
          ))}
          <button className="nav-link" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

function HomePage({ setPage }) {
  return (
    <div className="page">
      <section className="hero-band">
        <div className="hero">
          <p className="eyebrow">Machine Learning Platform</p>
          <h1>
            AI Support Ticket
            <br />
            Intelligence Platform
          </h1>
          <p className="hero-copy">
            A machine learning system that reads incoming support tickets,
            predicts what kind of request they are, and groups historical
            tickets into meaningful clusters &mdash; so support teams can
            triage faster and spot patterns across their queue.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => setPage("predict")}>
              Try ticket prediction
            </button>
            <button className="btn btn-ghost" onClick={() => setPage("cluster")}>
              Explore clusters
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="preview-card">
            <div className="preview-card-head">
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-dot" />
            </div>
            <div className="preview-field">
              <span className="preview-label">Ticket title</span>
              <span className="preview-value">Unable to access email</span>
            </div>
            <div className="preview-field">
              <span className="preview-label">Ticket body</span>
              <span className="preview-value preview-value-muted">
                I cannot login to my email account.
              </span>
            </div>
            <div className="preview-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4v14m0 0 6-6m-6 6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>TF-IDF &rarr; LinearSVC</span>
            </div>
            <div className="preview-result">
              <span className="preview-label">Prediction</span>
              <span className="preview-result-value">ticket_type</span>
            </div>
          </div>
        </div>
      </section>

      <section className="module-grid">
        <article className="module-card dashboard-model-card">
          <span className="module-icon icon-purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h10M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="module-tag tag-purple">Classification</span>
          <h3>Ticket Type Prediction</h3>
          <p>
            A tuned Linear SVM classifies each ticket from its title and
            body, combined and vectorised with TF-IDF, into its ticket type.
          </p>
          <ul className="module-meta">
            <li>Model: Tuned LinearSVC</li>
            <li>Input: title + body</li>
            <li>Served via POST /predict</li>
          </ul>
          <button className="card-link" onClick={() => setPage("predict")}>
            Open prediction tool &rarr;
          </button>
        </article>

        <article className="module-card dashboard-model-card">
          <span className="module-icon icon-teal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="6" r="2.6" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="6" r="2.6" stroke="currentColor" strokeWidth="2" />
              <circle cx="6" cy="18" r="2.6" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="18" r="2.6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="module-tag tag-teal">Clustering</span>
          <h3>Support Ticket Clustering</h3>
          <p>
            K-Means groups the ticket archive into four clusters using the
            same TF-IDF representation, surfacing recurring ticket themes.
          </p>
          <ul className="module-meta">
            <li>Algorithm: K-Means, k = 4</li>
            <li>Input: title + body</li>
            <li>Unsupervised learning</li>
          </ul>
          <button className="card-link" onClick={() => setPage("cluster")}>
            Browse clusters &rarr;
          </button>
        </article>
      </section>

      <section className="tech-strip">
        <h2>Built with</h2>
        <div className="tech-tags">
          <span>Python</span>
          <span>scikit-learn</span>
          <span>TF-IDF</span>
          <span>LinearSVC</span>
          <span>K-Means</span>
          <span>FastAPI</span>
          <span>React</span>
        </div>
      </section>
    </div>
  );
}

function PredictPage({ currentUser }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = title.trim() !== "" && body.trim() !== "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });

      if (!response.ok) {
        let detail = "";

        try {
          const errorBody = await response.text();
          detail = errorBody ? `: ${errorBody}` : "";
        } catch {
          // Keep the status message if the response body cannot be read.
        }

        throw new Error(
          `Prediction request failed with status ${response.status}${detail}`
        );
      }

      const data = await response.json();
      setResult(data);

      if (currentUser) {
        try {
          await addDoc(collection(db, "predictions"), {
            userId: currentUser.uid,
            modelId: "ticket_type_prediction",
            modelName: "Tuned LinearSVC",
            inputData: {
              title: title.trim(),
              body: body.trim(),
            },
            outputData: {
              prediction: String(data.prediction),
            },
            status: "success",
            createdAt: serverTimestamp(),
          });
        } catch (historyError) {
          console.error(
            "Prediction history could not be saved:",
            historyError
          );
        }
      }

      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err.message || "Could not reach the prediction API. Is it running?"
      );
      setStatus("error");
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">Classification</p>
        <h1>Ticket Type Prediction</h1>
        <p className="page-lede">
          Enter a ticket title and body. They&rsquo;ll be combined and sent to
          the tuned Linear SVM model for a ticket type prediction.
        </p>
      </div>

      <div className="predict-layout">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="ticket-title">Ticket title</label>
            <input
              id="ticket-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unable to access email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="ticket-body">Ticket body</label>
            <textarea
              id="ticket-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={7}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={!canSubmit || status === "loading"}
          >
            {status === "loading" ? "Predicting..." : "Predict ticket type"}
          </button>

          {!API_URL && (
            <p className="hint">
              VITE_API_URL isn&rsquo;t set, so requests will go to a relative
              /predict path. Set it in your .env file to point at the FastAPI
              server.
            </p>
          )}
        </form>

        <div className="panel result-panel">
          <h3>Result</h3>

          {status === "idle" && (
            <p className="result-empty">
              Submit a ticket to see the model&rsquo;s prediction here.
            </p>
          )}

          {status === "loading" && (
            <div className="result-loading">
              <span className="spinner" aria-hidden="true" />
              <span>Calling the prediction model&hellip;</span>
            </div>
          )}

          {status === "error" && (
            <div className="result-error" role="alert">
              <strong>Prediction failed.</strong>
              <p>{errorMessage}</p>
            </div>
          )}

          {status === "success" && result && (
            <div className="result-success">
              <span className="result-label">Predicted ticket type</span>
              <span className="result-value">{String(result.prediction)}</span>
              <span className="result-decoded">
                {String(result.prediction) === "0"
                  ? "Incident"
                  : String(result.prediction) === "1"
                  ? "Request"
                  : "Prediction received"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClusterPage() {
  const [selected, setSelected] = useState(CLUSTERS[0].id);
  const [tickets, setTickets] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Papa.parse("/endava_tickets_final_clustered.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => setTickets(results.data || []),
      error: (error) => {
        setLoadError(error?.message || "Could not load clustered CSV.");
      },
    });
  }, []);

  const activeCluster =
    CLUSTERS.find((cluster) => cluster.id === selected) || CLUSTERS[0];

  // UI uses 1-4; the CSV stores K-Means clusters as 0-3.
  const csvClusterId = selected - 1;

  const clusterTickets = tickets.filter(
    (ticket) => Number(ticket.cluster) === csvClusterId
  );

  const countByField = (rows, field) => {
    const counts = {};

    rows.forEach((row) => {
      const value = String(row[field] ?? "").trim();
      if (value) counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => Number(a[0]) - Number(b[0])
    );
  };

  const ticketTypeCounts = countByField(clusterTickets, "ticket_type");
  const urgencyCounts = countByField(clusterTickets, "urgency");
  const impactCounts = countByField(clusterTickets, "impact");

  const maxCount = (pairs) =>
    Math.max(...pairs.map(([, count]) => count), 1);

  const maxType = maxCount(ticketTypeCounts);
  const maxUrgency = maxCount(urgencyCounts);
  const maxImpact = maxCount(impactCounts);

  const typeUrgencyRows = [];
  ticketTypeCounts.forEach(([type]) => {
    urgencyCounts.forEach(([urgency]) => {
      const count = clusterTickets.filter(
        (ticket) =>
          String(ticket.ticket_type).trim() === String(type) &&
          String(ticket.urgency).trim() === String(urgency)
      ).length;

      if (count > 0) {
        typeUrgencyRows.push({ type, urgency, count });
      }
    });
  });

  const stopWords = new Set([
    "the", "and", "for", "with", "from", "this", "that", "please",
    "have", "has", "need", "needs", "unable", "issue", "help", "hello",
    "thanks", "thank", "ticket", "request", "problem", "not", "can",
    "cannot", "into", "about", "would", "could", "should", "are", "is",
    "my", "our", "you", "your", "they", "their", "there", "here", "was",
    "were", "to", "of", "in", "on", "a", "an", "i", "it", "we", "be",
  ]);

  const wordCounts = {};

  clusterTickets.forEach((ticket) => {
    const text = `${ticket.title || ""} ${ticket.body || ""}`
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ");

    text
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !stopWords.has(word))
      .forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
  });

  const importantWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (loadError) {
    return (
      <div className="page">
        <div className="page-head">
          <p className="eyebrow">Clustering</p>
          <h1>Support Ticket Clustering</h1>
        </div>
        <div className="panel result-error">
          <strong>Could not load clustered CSV.</strong>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">Clustering</p>
        <h1>Support Ticket Clustering</h1>
        <p className="page-lede">
          K-Means groups the ticket archive into four clusters from TF-IDF
          vectors of each ticket&rsquo;s title and body.
        </p>
      </div>

      <div className="cluster-select" role="tablist" aria-label="Ticket clusters">
        {CLUSTERS.map((cluster) => (
          <button
            key={cluster.id}
            role="tab"
            aria-selected={selected === cluster.id}
            className={`cluster-chip ${selected === cluster.id ? "is-active" : ""}`}
            onClick={() => setSelected(cluster.id)}
          >
            <span className="cluster-chip-index">{cluster.id}</span>
            {cluster.name}
          </button>
        ))}
      </div>

      <div className="panel cluster-summary">
        <h3>{activeCluster.name}</h3>
        <p>{activeCluster.description}</p>
      </div>

      <div className="cluster-grid">
        <div className="panel data-panel">
          <div className="data-panel-head">
            <h4>Number of tickets</h4>
            <span className="pending-pill">Live data</span>
          </div>
          <div className="metric-placeholder">
            <span className="metric-placeholder-value">
              {clusterTickets.length.toLocaleString()}
            </span>
            <span className="metric-placeholder-caption">
              Tickets assigned to this cluster
            </span>
          </div>
        </div>

        <div className="panel data-panel">
          <div className="data-panel-head">
            <h4>Ticket type distribution</h4>
            <span className="pending-pill">Live data</span>
          </div>
          <div className="bar-skeleton" aria-hidden="true">
            {ticketTypeCounts.map(([type, count]) => (
              <span
                key={type}
                title={`Class ${type}: ${count}`}
                style={{ height: `${Math.max((count / maxType) * 100, 10)}%`, opacity: 0.55 }}
              />
            ))}
          </div>
          <p className="panel-footnote">
            {ticketTypeCounts.map(([type, count]) => `Class ${type}: ${count}`).join("  |  ")}
          </p>
        </div>

        <div className="panel data-panel">
          <div className="data-panel-head">
            <h4>Urgency distribution</h4>
            <span className="pending-pill">Live data</span>
          </div>
          <div className="bar-skeleton" aria-hidden="true">
            {urgencyCounts.map(([urgency, count]) => (
              <span
                key={urgency}
                title={`Urgency ${urgency}: ${count}`}
                style={{ height: `${Math.max((count / maxUrgency) * 100, 10)}%`, opacity: 0.55 }}
              />
            ))}
          </div>
          <p className="panel-footnote">
            {urgencyCounts.map(([value, count]) => `Level ${value}: ${count}`).join("  |  ")}
          </p>
        </div>

        <div className="panel data-panel">
          <div className="data-panel-head">
            <h4>Impact distribution</h4>
            <span className="pending-pill">Live data</span>
          </div>
          <div className="bar-skeleton" aria-hidden="true">
            {impactCounts.map(([impact, count]) => (
              <span
                key={impact}
                title={`Impact ${impact}: ${count}`}
                style={{ height: `${Math.max((count / maxImpact) * 100, 10)}%`, opacity: 0.55 }}
              />
            ))}
          </div>
          <p className="panel-footnote">
            {impactCounts.map(([value, count]) => `Level ${value}: ${count}`).join("  |  ")}
          </p>
        </div>

        <div className="panel data-panel">
          <div className="data-panel-head">
            <h4>Ticket type vs urgency</h4>
            <span className="pending-pill">Live data</span>
          </div>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Urgency</th>
                  <th>Tickets</th>
                </tr>
              </thead>
              <tbody>
                {typeUrgencyRows.map((row) => (
                  <tr key={`${row.type}-${row.urgency}`}>
                    <td>Class {row.type}</td>
                    <td>{row.urgency}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel data-panel">
          <div className="data-panel-head">
            <h4>Important words</h4>
            <span className="pending-pill">Live data</span>
          </div>
          <div className="word-skeleton">
            {importantWords.map(([word]) => (
              <span key={word} className="word-pill">
                {word}
              </span>
            ))}
          </div>
          <p className="panel-footnote">
            Most frequent useful words in this cluster.
          </p>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="data-panel-head">
          <h4>Tickets in this cluster</h4>
          <span className="pending-pill">
            Showing {Math.min(clusterTickets.length, 10)} of {clusterTickets.length}
          </span>
        </div>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Ticket type</th>
                <th>Urgency</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {clusterTickets.slice(0, 10).map((ticket, index) => (
                <tr key={ticket.ticket_id || index}>
                  <td>{ticket.title || "Untitled ticket"}</td>
                  <td>{ticket.ticket_type}</td>
                  <td>{ticket.urgency}</td>
                  <td>{ticket.impact}</td>
                </tr>
              ))}
              {clusterTickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="table-empty">
                    No tickets found for this cluster.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page about-page">
      <div className="page-head">
        <p className="eyebrow">About the application</p>
        <h1>About Support Ticket Intelligence</h1>
        <p className="page-lede">
          A simple web application that helps support teams understand and
          organize IT support tickets more efficiently.
        </p>
      </div>

      <div className="about-hero panel">
        <div>
          <span className="about-kicker">AI Support Ticket Intelligence Platform</span>
          <h2>Making support ticket handling easier</h2>
          <p>
            The application provides a single place to work with support
            tickets, view ticket type predictions, explore ticket groups, and
            check previous prediction results.
          </p>
        </div>
      </div>

      <div className="about-section-title">
        <p className="eyebrow">Application features</p>
        <h2>What you can do here</h2>
      </div>

      <div className="about-feature-grid">
        <div className="panel about-feature-card">
          <span className="feature-number">01</span>
          <h3>Ticket Type Prediction</h3>
          <p>
            Enter a ticket title and description to get a predicted ticket
            type such as Incident or Request.
          </p>
        </div>

        <div className="panel about-feature-card">
          <span className="feature-number">02</span>
          <h3>Ticket Clustering</h3>
          <p>
            Explore groups of similar support tickets and understand common
            patterns in the ticket data.
          </p>
        </div>

        <div className="panel about-feature-card">
          <span className="feature-number">03</span>
          <h3>Prediction History</h3>
          <p>
            View previous ticket predictions saved for the signed-in user.
          </p>
        </div>

        <div className="panel about-feature-card">
          <span className="feature-number">04</span>
          <h3>Simple Navigation</h3>
          <p>
            Use Home, About, History, and Contact Us to move around the
            application easily.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("loading");

    try {
      await addDoc(collection(db, "contact_messages"), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      });

      setName("");
      setEmail("");
      setMessage("");
      setStatus("success");
    } catch (error) {
      console.error("Contact message could not be saved:", error);
      setStatus("error");
    }
  };

  return (
    <div className="page">
      <div
        className="page-head"
        style={{
          maxWidth: "780px",
          margin: "0 auto 34px",
          textAlign: "center",
        }}
      >
        <p className="eyebrow">Contact Us</p>
        <h1 style={{ marginBottom: "12px" }}>Get in touch with us</h1>
        <p
          className="page-lede"
          style={{
            maxWidth: "650px",
            margin: "0 auto",
          }}
        >
          Have a question, suggestion, or feedback about the Support Ticket
          Intelligence Platform? Send us a message and we will receive it
          through the application.
        </p>
      </div>

      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          gap: "28px",
          alignItems: "stretch",
        }}
      >
        <section
          className="panel"
          style={{
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f1eafe",
                color: "#5b21b6",
                marginBottom: "22px",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              ✦
            </div>

            <p className="eyebrow">Support</p>
            <h2 style={{ marginTop: "8px", marginBottom: "14px" }}>
              We are here to help
            </h2>
            <p style={{ lineHeight: 1.75, marginBottom: "26px" }}>
              Use this form to share your questions, suggestions, or feedback
              about the application.
            </p>
          </div>

          <div style={{ display: "grid", gap: "14px", marginTop: "24px" }}>
            <div
              style={{
                padding: "15px 16px",
                borderRadius: "12px",
                background: "#f8f7fc",
                border: "1px solid #ece8f5",
              }}
            >
              <strong style={{ display: "block", marginBottom: "5px" }}>
                Application
              </strong>
              <span>AI Support Ticket Intelligence Platform</span>
            </div>

            <div
              style={{
                padding: "15px 16px",
                borderRadius: "12px",
                background: "#f8f7fc",
                border: "1px solid #ece8f5",
              }}
            >
              <strong style={{ display: "block", marginBottom: "5px" }}>
                Purpose
              </strong>
              <span>IT Support Ticket Management</span>
            </div>
          </div>
        </section>

        <form
          className="panel"
          onSubmit={handleSubmit}
          style={{ padding: "36px" }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ marginBottom: "7px" }}>Send us a message</h2>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Fill in the details below and submit your message.
            </p>
          </div>

          <div className="field">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setStatus("idle");
              }}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus("idle");
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setStatus("idle");
              }}
              placeholder="Write your message here..."
              rows={7}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>

          {status === "success" && (
            <div
              style={{
                marginTop: "16px",
                padding: "13px 15px",
                borderRadius: "10px",
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                textAlign: "center",
              }}
            >
              <strong>Message sent successfully.</strong>
              <p style={{ margin: "4px 0 0" }}>
                Your message has been saved successfully.
              </p>
            </div>
          )}

          {status === "error" && (
            <div
              className="result-error"
              style={{ marginTop: "16px" }}
              role="alert"
            >
              <strong>Message could not be sent.</strong>
              <p>Please try again.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (!user) {
        setPage("home");
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="auth-shell">
        <div className="auth-card panel">
          <p className="eyebrow">Support Ticket Intelligence</p>
          <h1>Loading...</h1>
          <p className="page-lede">Checking your sign-in status.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="app-shell">
      <NavBar page={page} setPage={setPage} onLogout={handleLogout} />
      <main>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "predict" && <PredictPage currentUser={currentUser} />}
        {page === "cluster" && <ClusterPage />}
        {page === "history" && <HistoryPage />}
        {page === "about" && <AboutPage />}
        {page === "contact" && <ContactPage />}
      </main>
      <footer className="app-footer">
        <p>AI Support Ticket Intelligence Platform &mdash; Student ML Project</p>
      </footer>
    </div>
  );
}
