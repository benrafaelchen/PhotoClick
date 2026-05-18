import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../utils/api";
import AddressAutoComplete from "../components/AddressAutoComplete";
import "../assets/styles/AuthPages.css";

const SignUpPage = () => {
  const [form, setForm] = useState({
    email: "", password: "", phoneNumber: "", firstName: "",
    lastName: "", personalId: "", userType: "", photographerOption: "",
  });
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "userType" && value !== "photographer") {
      setForm((prev) => ({ ...prev, photographerOption: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";

    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Must be at least 8 characters";
    else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password)) errs.password = "Must include uppercase letter and number";

    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.personalId.trim()) errs.personalId = "ID number is required";

    if (!form.phoneNumber) errs.phoneNumber = "Phone is required";
    else if (!/^[0-9]{10}$/.test(form.phoneNumber)) errs.phoneNumber = "Must be 10 digits";

    if (!address) errs.address = "Address is required";
    if (!form.userType) errs.userType = "Please select account type";
    if (form.userType === "photographer" && !form.photographerOption) {
      errs.photographerOption = "Please choose Stills or Video";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    if (!validate()) return;

    setLoading(true);

    const roleID = form.userType === "customer" ? 2 : form.photographerOption === "stills" ? 3 : 4;
    const roleName = form.userType === "customer" ? "Customer"
      : form.photographerOption === "stills" ? "Photographer-Stills" : "Photographer-Video";

    try {
      const data = await apiPost("/signup", {
        email: form.email.trim(),
        personalId: form.personalId.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber,
        address: address.trim(),
        roleID,
        roleName,
      });

      setMessage({ text: data.message || "Account created! Redirecting to sign in...", type: "success" });
      setTimeout(() => navigate("/signin"), 2000);
    } catch (error) {
      setMessage({ text: error.message || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name, type, placeholder, extra = {}) => (
    <div className="form-group">
      <label htmlFor={`signup-${name}`} className="sr-only">{placeholder}</label>
      <input
        id={`signup-${name}`}
        type={type}
        name={name}
        className={`form-input${errors[name] ? " input-error" : ""}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        aria-required="true"
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        {...extra}
      />
      {errors[name] && <span id={`${name}-error`} className="form-error" role="alert">{errors[name]}</span>}
    </div>
  );

  return (
    <main className="auth-container" role="main">
      <div className="auth-card" role="region" aria-label="Create a PhotoClick account">
        <h1 className="auth-logo">PhotoClick</h1>
        <p className="auth-subtitle">Create your account to get started.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {renderField("email", "email", "Email address", { autoComplete: "email" })}
          {renderField("password", "password", "Password (min 8 chars, uppercase, number)", { autoComplete: "new-password" })}
          <p className="password-hint">Min 8 characters with uppercase and number</p>
          {renderField("phoneNumber", "tel", "Phone number (10 digits)")}
          {renderField("firstName", "text", "First name")}
          {renderField("lastName", "text", "Last name")}
          {renderField("personalId", "text", "ID number")}

          <div className="form-group">
            <label htmlFor="signup-address" className="sr-only">Address</label>
            <AddressAutoComplete
              inputId="signup-address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
              }}
            />
            {errors.address && <span className="form-error" role="alert">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="signup-userType" className="sr-only">Account type</label>
            <select
              id="signup-userType"
              name="userType"
              className={`form-input${errors.userType ? " input-error" : ""}`}
              value={form.userType}
              onChange={handleChange}
              aria-required="true"
            >
              <option value="" disabled>Select Account Type</option>
              <option value="customer">Customer</option>
              <option value="photographer">Photographer</option>
            </select>
            {errors.userType && <span className="form-error" role="alert">{errors.userType}</span>}
          </div>

          {form.userType === "photographer" && (
            <div className="form-group">
              <div className="photographer-options" role="radiogroup" aria-label="Photographer type">
                {["stills", "video"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={form.photographerOption === opt}
                    className={`option-button${form.photographerOption === opt ? " selected" : ""}`}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, photographerOption: opt }));
                      if (errors.photographerOption) setErrors((prev) => ({ ...prev, photographerOption: "" }));
                    }}
                  >
                    {opt === "stills" ? "Stills" : "Video"}
                  </button>
                ))}
              </div>
              {errors.photographerOption && <span className="form-error" role="alert">{errors.photographerOption}</span>}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {message.text && (
          <p className={`auth-message ${message.type}`} role="alert">{message.text}</p>
        )}

        <Link to="/signin" className="auth-link">
          Already have an account? Sign in
        </Link>
      </div>
    </main>
  );
};

export default SignUpPage;
