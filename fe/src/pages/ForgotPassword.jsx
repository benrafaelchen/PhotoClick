import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost } from "../utils/api";
import "../assets/styles/AuthPages.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!email.trim()) {
      setMessage({ text: "Please enter your email address.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const data = await apiPost("/forgotpassword", { userEmail: email.trim() });
      setMessage({ text: data.message || "Check your email for instructions.", type: "success" });
    } catch (err) {
      setMessage({ text: err.message || "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container" role="main">
      <div className="auth-card" role="region" aria-label="Reset your password">
        <h1 className="auth-logo">PhotoClick</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you instructions to reset your password.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="forgot-email" className="sr-only">Email address</label>
            <input
              id="forgot-email"
              type="email"
              className="form-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        {message.text && (
          <p className={`auth-message ${message.type}`} role="alert">
            {message.text}
          </p>
        )}

        <Link to="/signin" className="auth-link">
          Back to Sign In
        </Link>
      </div>
    </main>
  );
};

export default ForgotPassword;
