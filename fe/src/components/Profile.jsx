// Profile.jsx
// User profile page: shows email, role, personal ID, personal info, and allows password change.

import React, { useState, useEffect, useCallback } from "react";
import AddressAutoComplete from "./AddressAutoComplete";
import { apiPost, getUserInfo } from "../utils/api";
import "../assets/styles/AuthPages.css";

const Profile = () => {
  const [userData, setUserData] = useState({
    email: "",
    roleName: "",
    personalId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [passwordFieldError, setPasswordFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const clearPasswordErrors = useCallback(() => {
    setPasswordFieldError("");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchUserData = async () => {
      const userEmail = getUserInfo().email;
      if (!userEmail) {
        if (!cancelled) {
          setLoading(false);
          setLoadError("You need to be signed in to view your profile.");
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setLoadError("");
      }

      try {
        const data = await apiPost("/getUserData", { email: userEmail });
        if (cancelled) return;
        setUserData({
          email: data.Email ?? userEmail,
          roleName: data.RoleName ?? "",
          personalId: data.Personal_id ?? "",
          firstName: data.FirstName ?? "",
          lastName: data.LastName ?? "",
          phoneNumber: data.PhoneNumber ?? "",
          address: data.StreetAddress ?? "",
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching user data:", error);
          setLoadError(error.message || "Could not load your profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUserData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;
    const t = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    clearPasswordErrors();
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };


  const validatePasswords = () => {
    const { newPassword, confirmPassword } = passwords;
    const touched = newPassword.length > 0 || confirmPassword.length > 0;
    if (!touched) return true;

    if (!newPassword || !confirmPassword) {
      setPasswordFieldError("Enter and confirm your new password, or leave both fields empty.");
      return false;
    }
    if (newPassword.length < 8) {
      setPasswordFieldError("New password must be at least 8 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFieldError("New password and confirmation do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    clearPasswordErrors();

    if (!validatePasswords()) return;

    const email = getUserInfo().email || userData.email;
    if (!email) {
      setFeedback({ type: "error", text: "You need to be signed in to update your profile." });
      return;
    }

    const payload = { ...userData, email };
    if (passwords.newPassword) payload.newPassword = passwords.newPassword;

    setSubmitting(true);
    try {
      const result = await apiPost("/updateUserData", payload);
      if (result.success) {
        setFeedback({ type: "success", text: "Profile updated successfully." });
        setPasswords({ newPassword: "", confirmPassword: "" });
      } else {
        setFeedback({
          type: "error",
          text: result.message || "Could not update your profile.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setFeedback({
        type: "error",
        text: error.message || "Could not update your profile.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const passwordMismatchOrShort =
    passwords.newPassword.length > 0 &&
    passwords.confirmPassword.length > 0 &&
    (passwords.newPassword !== passwords.confirmPassword ||
      passwords.newPassword.length < 8);

  if (loading) {
    return (
      <div className="content profile-container">
        <div className="loading-center" aria-busy="true" aria-live="polite">
          <span className="spinner spinner-lg" aria-hidden="true" />
          <span>Loading your profile…</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="content profile-container">
        <div className="empty-state" role="alert">
          <p className="empty-state-title">Something went wrong</p>
          <p className="empty-state-text">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content profile-container">
      {feedback && (
        <div
          className={`toast ${feedback.type === "success" ? "toast-success" : "toast-error"}`}
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {feedback.text}
        </div>
      )}

      <div className="form-container profile-form-container">
        <form onSubmit={handleSubmit} noValidate>
          <div className="profile-email-section">
            <div className="form-group">
              <label htmlFor="profile-email" className="form-label">
                Email
              </label>
              <input
                id="profile-email"
                type="text"
                className="form-input"
                value={userData.email}
                disabled
                autoComplete="email"
              />
            </div>
          </div>

          <div className="profile-form-content">
            <div className="profile-form-left">
              <div className="form-group">
                <label htmlFor="profile-role" className="form-label">
                  Role
                </label>
                <input
                  id="profile-role"
                  type="text"
                  className="form-input"
                  value={userData.roleName}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-personal-id" className="form-label">
                  Personal ID
                </label>
                <input
                  id="profile-personal-id"
                  type="text"
                  className="form-input"
                  value={userData.personalId}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-new-password" className="form-label">
                  New password <span className="sr-only">(optional)</span>
                </label>
                <input
                  id="profile-new-password"
                  type="password"
                  name="newPassword"
                  placeholder="Leave blank to keep current password"
                  className="form-input"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  aria-invalid={passwordMismatchOrShort || !!passwordFieldError}
                  aria-describedby={
                    passwordFieldError || passwordMismatchOrShort
                      ? "profile-password-error"
                      : "profile-password-hint"
                  }
                />
                <p
                  id="profile-password-hint"
                  style={{
                    fontSize: "1.2rem",
                    color: "var(--color-text-muted)",
                    marginTop: "0.2rem",
                  }}
                >
                  Optional. If you set a new password, use at least 8 characters.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="profile-confirm-password" className="form-label">
                  Confirm new password
                </label>
                <input
                  id="profile-confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className="form-input"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  aria-invalid={passwordMismatchOrShort || !!passwordFieldError}
                  aria-describedby={
                    passwordFieldError || passwordMismatchOrShort
                      ? "profile-password-error"
                      : undefined
                  }
                />
              </div>

              {(passwordFieldError || passwordMismatchOrShort) && (
                <p id="profile-password-error" className="form-error" role="alert">
                  {passwordFieldError ||
                    (passwords.newPassword.length < 8
                      ? "New password must be at least 8 characters."
                      : "New password and confirmation do not match.")}
                </p>
              )}
            </div>

            <div className="profile-form-right">
              <div className="form-group">
                <label htmlFor="profile-first-name" className="form-label">
                  First name
                </label>
                <input
                  id="profile-first-name"
                  type="text"
                  name="firstName"
                  className="form-input"
                  value={userData.firstName}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  autoComplete="given-name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-last-name" className="form-label">
                  Last name
                </label>
                <input
                  id="profile-last-name"
                  type="text"
                  name="lastName"
                  className="form-input"
                  value={userData.lastName}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  autoComplete="family-name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-phone" className="form-label">
                  Phone number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="10-digit number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                  value={userData.phoneNumber}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  autoComplete="tel"
                />
              </div>

              <div className="form-group" role="group" aria-labelledby="profile-address-label">
                <span id="profile-address-label" className="form-label">
                  Street address
                </span>
                <AddressAutoComplete
                  inputId="profile-address"
                  value={userData.address}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
