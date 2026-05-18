import React, { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, getUserInfo } from "../utils/api";
import "../assets/styles/FAQ.css";

function FAQ({ isAdmin }) {
  const { token } = getUserInfo();
  const showAdminTools = Boolean(isAdmin && token);

  const [faqArr, setFAQArr] = useState([]);
  const [openIds, setOpenIds] = useState(() => new Set());
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ title: false, content: false });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [toast, setToast] = useState({ type: "", message: "" });
  const [saving, setSaving] = useState(false);

  const fetchFAQData = useCallback(async () => {
    setFetchError("");
    setLoading(true);
    try {
      const res = await apiGet("/faqData");
      setFAQArr(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching FAQ:", err);
      setFetchError(err.message || "Could not load FAQs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQData();
  }, [fetchFAQData]);

  useEffect(() => {
    if (!toast.message) return undefined;
    const id = setTimeout(() => setToast({ type: "", message: "" }), 3500);
    return () => clearTimeout(id);
  }, [toast.message]);

  const toggleItem = (faqId) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(faqId)) next.delete(faqId);
      else next.add(faqId);
      return next;
    });
  };

  const addFaq = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      setFieldErrors({ title: !newTitle.trim(), content: !newContent.trim() });
      const missing = [];
      if (!newTitle.trim()) missing.push("Title");
      if (!newContent.trim()) missing.push("Content");
      setErrorMessage(`Missing fields: ${missing.join(", ")}`);
      setTimeout(() => {
        setErrorMessage("");
        setFieldErrors({ title: false, content: false });
      }, 4000);
      return;
    }

    setSaving(true);
    try {
      const data = await apiPost("/addFaq", {
        data: { faq_title: newTitle.trim(), faq_content: newContent.trim() },
      });
      if (data.success) {
        setFAQArr((prev) => [
          ...prev,
          {
            faq_id: data.faq_id,
            faq_title: newTitle.trim(),
            faq_content: newContent.trim(),
          },
        ]);
        setNewTitle("");
        setNewContent("");
        setToast({ type: "success", message: "FAQ added successfully." });
      }
    } catch (err) {
      console.error("Error adding FAQ:", err);
      setToast({ type: "error", message: err.message || "Could not add FAQ." });
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (faq_id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this FAQ?\nThis action cannot be undone."
    );
    if (!ok) return;

    try {
      const data = await apiPost("/deleteFaq", { data: faq_id });
      if (data.success) {
        setFAQArr((prev) => prev.filter((item) => item.faq_id !== faq_id));
        setOpenIds((prev) => {
          const next = new Set(prev);
          next.delete(faq_id);
          return next;
        });
        setToast({ type: "success", message: "FAQ deleted." });
      }
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      setToast({ type: "error", message: err.message || "Could not delete FAQ." });
    }
  };

  return (
    <div className="faq-container">
      <style>
        {`
          .faq-accordion-list { display: flex; flex-direction: column; gap: 0.8rem; }
          .faq-item.card { padding: 0; overflow: hidden; }
          .faq-item-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.8rem;
            width: 100%;
            text-align: left;
            padding: 1.2rem 1.6rem;
            background: transparent;
            border: none;
            font: inherit;
            cursor: pointer;
            color: var(--color-text, inherit);
          }
          .faq-item-header:hover { background: var(--color-bg, rgba(0,0,0,0.03)); }
          .faq-item-title { font-weight: 600; font-size: 1.5rem; flex: 1; }
          .faq-chevron { font-size: 1.2rem; opacity: 0.7; }
          .faq-panel-inner { padding: 0 1.6rem 1.6rem; font-size: 1.4rem; line-height: 1.6; }
          .faq-admin-row { display: flex; justify-content: flex-end; padding: 0 1.6rem 1.2rem; }
        `}
      </style>

      {toast.message && (
        <div
          className={`toast ${toast.type === "success" ? "toast-success" : ""} ${toast.type === "error" ? "toast-error" : ""}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {fetchError && (
        <div className="empty-state" role="alert">
          <p className="empty-state-title">Could not load FAQs</p>
          <p className="empty-state-text">{fetchError}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchFAQData}>
            Try again
          </button>
        </div>
      )}

      {!fetchError && loading && (
        <div className="loading-center" aria-busy="true" aria-live="polite">
          <span className="spinner spinner-lg" aria-hidden />
          <span>Loading FAQs…</span>
        </div>
      )}

      {!fetchError && !loading && faqArr.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden>
            ❓
          </div>
          <p className="empty-state-title">No FAQs yet</p>
          <p className="empty-state-text">Check back later for answers to common questions.</p>
        </div>
      )}

      {!fetchError && !loading && faqArr.length > 0 && (
        <div className="faq-accordion-list">
          {faqArr.map((item) => {
            const isOpen = openIds.has(item.faq_id);
            const headingId = `faq-heading-${item.faq_id}`;
            const panelId = `faq-panel-${item.faq_id}`;
            return (
              <div key={item.faq_id} className="faq-item card">
                <button
                  type="button"
                  id={headingId}
                  className="faq-item-header"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.faq_id)}
                >
                  <span className="faq-item-title">{item.faq_title}</span>
                  <span className="faq-chevron" aria-hidden>
                    {isOpen ? "▾" : "▸"}
                  </span>
                </button>
                <div
                  role="region"
                  id={panelId}
                  aria-labelledby={headingId}
                  hidden={!isOpen}
                >
                  <div className="faq-panel-inner">{item.faq_content}</div>
                  {showAdminTools && (
                    <div className="faq-admin-row">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteFaq(item.faq_id)}
                        aria-label={`Delete FAQ: ${item.faq_title}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdminTools && (
        <div className="card" style={{ marginTop: "2rem" }}>
          <h3 className="form-label" style={{ marginBottom: "1.2rem" }}>
            Add FAQ
          </h3>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" htmlFor="faq-new-title">
              Title
            </label>
            <input
              id="faq-new-title"
              type="text"
              className="form-input"
              placeholder="Question"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              aria-invalid={fieldErrors.title}
              aria-describedby={fieldErrors.title ? "faq-title-err" : undefined}
              disabled={saving}
            />
            {fieldErrors.title && (
              <span id="faq-title-err" className="form-error">
                Title is required
              </span>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" htmlFor="faq-new-content">
              Content
            </label>
            <textarea
              id="faq-new-content"
              className="form-textarea"
              rows={4}
              placeholder="Answer"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              aria-invalid={fieldErrors.content}
              aria-describedby={fieldErrors.content ? "faq-content-err" : undefined}
              disabled={saving}
            />
            {fieldErrors.content && (
              <span id="faq-content-err" className="form-error">
                Content is required
              </span>
            )}
          </div>
          {errorMessage && (
            <p className="form-error" role="alert" style={{ marginBottom: "0.8rem" }}>
              {errorMessage}
            </p>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={addFaq}
            disabled={saving}
            aria-label="Add new FAQ entry"
          >
            {saving ? "Saving…" : "Add FAQ"}
          </button>
        </div>
      )}
    </div>
  );
}

export default FAQ;
