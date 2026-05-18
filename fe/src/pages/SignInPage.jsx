import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost, setUserSession } from "../utils/api";
import "../assets/styles/AuthPages.css";

let GoogleLogin;
try {
  GoogleLogin = require("@react-oauth/google").GoogleLogin;
} catch (e) {
  GoogleLogin = null;
}

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!email.trim() || !password) {
      setMessage({ text: "Please enter your email and password.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const data = await apiPost("/signin", {
        userEmail: email.trim(),
        userPassword: password,
      });

      setUserSession(data);
      setMessage({ text: "Welcome back! Redirecting...", type: "success" });

      setTimeout(() => {
        if (data.roleID === 2) navigate("/customer");
        else if (data.roleID === 1) navigate("/admin");
        else if (data.roleID === 3 || data.roleID === 4) navigate("/photographer");
      }, 800);
    } catch (error) {
      setMessage({ text: error.message || "Login failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container" role="main">
      <div className="auth-card" role="region" aria-label="Sign in to PhotoClick">
        <h1 className="auth-logo">PhotoClick</h1>
        <p className="auth-subtitle">Welcome back! Sign in to continue.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="signin-email" className="sr-only">Email address</label>
            <input
              id="signin-email"
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

          <div className="form-group">
            <label htmlFor="signin-password" className="sr-only">Password</label>
            <input
              id="signin-password"
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              aria-required="true"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message.text && (
          <p className={`auth-message ${message.type}`} role="alert">
            {message.text}
          </p>
        )}

        {GOOGLE_CLIENT_ID && GoogleLogin && (
          <>
            <div className="auth-divider">or</div>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                setMessage({ text: "", type: "" });
                try {
                  const data = await apiPost("/google-signin", {
                    credential: credentialResponse.credential,
                  });
                  if (data.isNewUser) {
                    setMessage({ text: data.message, type: "error" });
                  } else {
                    setUserSession(data);
                    setMessage({ text: "Welcome back! Redirecting...", type: "success" });
                    setTimeout(() => {
                      if (data.roleID === 2) navigate("/customer");
                      else if (data.roleID === 1) navigate("/admin");
                      else if (data.roleID === 3 || data.roleID === 4) navigate("/photographer");
                    }, 800);
                  }
                } catch (error) {
                  setMessage({ text: error.message || "Google sign-in failed", type: "error" });
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                setMessage({ text: "Google sign-in failed. Please try again.", type: "error" });
              }}
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </>
        )}

        <Link to="/forgotpassword" className="auth-link">
          Forgot your password?
        </Link>
        <Link to="/signup" className="auth-link">
          Don't have an account? Create one
        </Link>
      </div>
    </main>
  );
};

export default SignInPage;
