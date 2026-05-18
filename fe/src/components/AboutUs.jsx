/**
 * About Us: main content and contact info; admins can edit via toggle.
 */
import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, getUserInfo } from "../utils/api";
import "../assets/styles/AboutUs.css";

const emptyAbout = { page_content: "", page_info: "", page_title: "", page_name: "AboutUs" };

function AboutUs({ isAdmin, onSuccess }) {
  const { token } = getUserInfo();
  const showAdminTools = Boolean(isAdmin && token);

  const [aboutData, setAboutData] = useState(emptyAbout);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  const fetchAboutUsData = useCallback(async () => {
    setFetchError("");
    setLoading(true);
    try {
      const result = await apiGet("/aboutUsData");
      if (result?.data) {
        setAboutData({
          page_content: result.data.page_content ?? "",
          page_info: result.data.page_info ?? "",
          page_title: result.data.page_title ?? "",
          page_name: result.data.page_name ?? "AboutUs",
        });
      }
    } catch (err) {
      console.error("Error fetching About Us data:", err);
      setFetchError(err.message || "Could not load this page.");
      setAboutData(emptyAbout);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutUsData();
  }, [fetchAboutUsData]);

  useEffect(() => {
    if (!toast.message) return undefined;
    const id = setTimeout(() => setToast({ type: "", message: "" }), 4000);
    return () => clearTimeout(id);
  }, [toast.message]);

  const prettyContent = (content) => {
    if (!content) return null;
    return content
      .split(/(?<=[.:])/g)
      .filter(Boolean)
      .map((s, i) => (
        <p key={i}>{s.trim()}</p>
      ));
  };

  const prettyInfo = (info) => {
    if (!info) return null;
    return info
      .split("\n")
      .filter(Boolean)
      .map((line, index) => (
        <p key={index} className="contact-line">
          {line.trim()}
        </p>
      ));
  };

  const cancelEdit = () => {
    setShowEdit(false);
    setSaveError("");
    fetchAboutUsData();
  };

  const updateData = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const result = await apiPost("/editPageContent", {
        page_content: aboutData.page_content,
        page_info: aboutData.page_info,
      });
      if (result.success) {
        setShowEdit(false);
        setToast({ type: "success", message: "About Us updated successfully." });
        onSuccess?.();
        await fetchAboutUsData();
      } else {
        setSaveError("Update did not apply. Please try again.");
        setToast({ type: "error", message: "Could not save changes." });
      }
    } catch (err) {
      console.error("Error updating About Us data:", err);
      setSaveError(err.message || "Could not save changes.");
      setToast({ type: "error", message: err.message || "Could not save changes." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="about-us">
      <style>
        {`
          .about-us-two-col {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            align-items: start;
          }
          @media (min-width: 900px) {
            .about-us-two-col { grid-template-columns: 1fr minmax(280px, 340px); }
          }
          .about-main-content { min-width: 0; }
          .about-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.8rem;
            margin-top: 1.6rem;
          }
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
          <p className="empty-state-title">Could not load About Us</p>
          <p className="empty-state-text">{fetchError}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchAboutUsData}>
            Try again
          </button>
        </div>
      )}

      {!fetchError && loading && (
        <div className="loading-center" aria-busy="true" aria-live="polite">
          <span className="spinner spinner-lg" aria-hidden />
          <span>Loading…</span>
        </div>
      )}

      {!fetchError && !loading && (
        <>
          <div className="about-us-two-col">
            <div className="about-main-content card">
              {aboutData.page_title && (
                <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>{aboutData.page_title}</h2>
              )}
              {!showEdit && (
                <div className={showAdminTools ? "pageContent adminView" : "pageContent"}>
                  {prettyContent(aboutData.page_content) || (
                    <p className="empty-state-text" style={{ padding: 0 }}>
                      No content yet.
                    </p>
                  )}
                </div>
              )}
              {showAdminTools && showEdit && (
                <form id="about-edit-form" onSubmit={updateData}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="about-page-content">
                      Page content
                    </label>
                    <textarea
                      id="about-page-content"
                      className="form-textarea"
                      rows={12}
                      value={aboutData.page_content}
                      onChange={(e) =>
                        setAboutData((prev) => ({ ...prev, page_content: e.target.value }))
                      }
                      aria-label="Edit about page main content"
                      disabled={saving}
                    />
                  </div>
                </form>
              )}
            </div>

            <aside className="card contact-card" aria-label="Contact information">
              <h3 className="form-label" style={{ marginTop: 0, marginBottom: "1rem" }}>
                Contact
              </h3>
              {!showEdit && (
                <div className="contact-info">
                  {prettyInfo(aboutData.page_info) || (
                    <p className="empty-state-text" style={{ padding: 0 }}>
                      No contact details yet.
                    </p>
                  )}
                </div>
              )}
              {showAdminTools && showEdit && (
                <div className="form-group">
                  <label className="form-label" htmlFor="about-page-info">
                    Contact info
                  </label>
                  <textarea
                    id="about-page-info"
                    className="form-textarea"
                    rows={8}
                    value={aboutData.page_info}
                    onChange={(e) =>
                      setAboutData((prev) => ({ ...prev, page_info: e.target.value }))
                    }
                    placeholder="One line per contact detail"
                    aria-label="Edit contact information"
                    disabled={saving}
                  />
                </div>
              )}
            </aside>
          </div>

          {showAdminTools && (
            <div className="about-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => (showEdit ? cancelEdit() : setShowEdit(true))}
                aria-expanded={showEdit}
                aria-controls={showEdit ? "about-edit-form about-page-info" : undefined}
                disabled={saving}
              >
                {showEdit ? "Cancel" : "Edit content"}
              </button>
              {showEdit && (
                <button
                  type="submit"
                  form="about-edit-form"
                  className="btn btn-primary"
                  disabled={saving}
                  aria-label="Save about page and contact changes"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              )}
            </div>
          )}

          {saveError && (
            <p className="form-error" role="alert" style={{ marginTop: "1rem" }}>
              {saveError}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default AboutUs;
