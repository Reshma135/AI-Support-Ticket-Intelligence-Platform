import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

export default function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      setStatus("success");
    } catch (err) {
      setError(err.message || "Authentication failed.");
      setStatus("error");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card panel">
        {/* Platform logo / brand */}
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 4.5h9.8L19 8.7v10.8A1.5 1.5 0 0 1 17.5 21h-12A1.5 1.5 0 0 1 4 19.5V6A1.5 1.5 0 0 1 5.5 4.5H5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M14 4.5V9h4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m8 14 2.2 2.2L16 10.7"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="brand-text">
            Support Ticket <strong>Intelligence</strong>
          </div>
        </div>

        {/* Heading */}
        <div className="page-head auth-head">
          <p className="eyebrow">
            {isSignup ? "Get started" : "Welcome back"}
          </p>

          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: "0.55rem",
            }}
          >
            {isSignup ? "Create your account" : "Sign in"}
          </h1>

          <p
            className="page-lede"
            style={{
              marginBottom: "1.5rem",
              maxWidth: "420px",
            }}
          >
            {isSignup
              ? "Create an account to continue."
              :"Access your support ticket dashboard."}
          </p>
        </div>

        {/* Authentication form */}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="auth-email">Email</label>

            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="auth-password">Password</label>

            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="result-error" role="alert">
              <strong>Authentication failed.</strong>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={status === "loading"}
          >
            {status === "loading"
              ? "Please wait..."
              : isSignup
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        {/* Switch sign-in / sign-up */}
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setError("");
            setStatus("idle");
          }}
        >
          {isSignup
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
