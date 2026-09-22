import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setHistory([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "predictions"),
          where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(q);

        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        records.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setHistory(records);
        setError("");
      } catch (err) {
        console.error("History error:", err);
        setError(err.message || "Could not load prediction history.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="page-head">
          <p className="eyebrow">Prediction History</p>
          <h1>Your History</h1>
          <p className="page-lede">Loading your predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">Prediction History</p>
        <h1>Your History</h1>
        <p className="page-lede">
          Previous ticket predictions submitted from your account.
        </p>
      </div>

      {error && (
        <div className="panel">
          <h3>History could not be loaded</h3>
          <p>{error}</p>
        </div>
      )}

      {!error && history.length === 0 && (
        <div className="panel">
          <h3>No prediction history found</h3>
          <p>
            Your prediction was saved, but no matching record was found for
            the currently logged-in user.
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="panel">
          <div className="history-list">
            {history.map((item) => {
              const prediction = String(item.outputData?.prediction ?? "");
              const readablePrediction =
                prediction === "0"
                  ? "Incident"
                  : prediction === "1"
                  ? "Request"
                  : prediction;

              const date = item.createdAt?.toDate
                ? item.createdAt.toDate().toLocaleString()
                : "Date unavailable";

              return (
                <div className="history-item" key={item.id}>
                  <div className="history-content">
                    <h3>{item.inputData?.title || "Untitled ticket"}</h3>
                    <p>
                      {item.inputData?.body ||
                        "No ticket description available."}
                    </p>
                    <small>
                      Model: {item.modelName || "—"} | Status: {item.status || "—"} | {date}
                    </small>
                  </div>

                  <div className="history-result">
                    <span>Prediction</span>
                    <strong>{readablePrediction}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
