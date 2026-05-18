import React, { useEffect, useState, useMemo } from "react";
import { apiGet } from "../utils/api";
import "../assets/styles/displayWorkers.css";

const TAB_STAFF = "staff";
const TAB_CUSTOMERS = "customers";

function DisplayWorkers() {
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_STAFF);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [w, c] = await Promise.all([apiGet("/getWorkers"), apiGet("/getCustomers")]);
        if (!cancelled) {
          setStaff(Array.isArray(w) ? w : []);
          setCustomers(Array.isArray(c) ? c : []);
        }
      } catch (e) {
        if (!cancelled) { setError(e.message || "Failed to load data"); setStaff([]); setCustomers([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const people = activeTab === TAB_CUSTOMERS ? customers : staff;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      const hay = [p.FirstName, p.LastName, p.PhoneNumber, p.Personal_id, p.Email, p.StreetAddress]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [people, search]);

  const tabIds = { staff: "tab-staff", customers: "tab-customers" };
  const panelId = activeTab === TAB_CUSTOMERS ? "panel-customers" : "panel-staff";
  const countLabel = `${filtered.length} ${activeTab === TAB_CUSTOMERS ? "customer" : "team member"}${filtered.length !== 1 ? "s" : ""}`;

  return (
    <div className="display-workers-page">
      <div className="display-workers-tabs" role="tablist" aria-label="View team or customers">
        <button type="button" id={tabIds.staff} role="tab"
          aria-selected={activeTab === TAB_STAFF} aria-controls="panel-staff"
          tabIndex={activeTab === TAB_STAFF ? 0 : -1}
          className={`report-tab${activeTab === TAB_STAFF ? " active" : ""}`}
          onClick={() => setActiveTab(TAB_STAFF)}>
          Team Members
        </button>
        <button type="button" id={tabIds.customers} role="tab"
          aria-selected={activeTab === TAB_CUSTOMERS} aria-controls="panel-customers"
          tabIndex={activeTab === TAB_CUSTOMERS ? 0 : -1}
          className={`report-tab${activeTab === TAB_CUSTOMERS ? " active" : ""}`}
          onClick={() => setActiveTab(TAB_CUSTOMERS)}>
          Customers
        </button>
      </div>

      <div className="d-flex jc-sb ai-c f-wrap g-2 mt-2" style={{ marginBottom: "1.2rem" }}>
        <div className="form-group" style={{ maxWidth: "36rem", flex: 1 }}>
          <label className="form-label" htmlFor="people-search">Search</label>
          <input id="people-search" type="search" className="form-input"
            placeholder="Name, phone, email, ID..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter by keyword"
          />
        </div>
        {!loading && <span style={{ fontSize: "1.3rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{countLabel}</span>}
      </div>

      {error && (
        <p className="toast toast-error" style={{ position: "static", transform: "none", marginBottom: "1rem" }} role="alert">{error}</p>
      )}

      {loading ? (
        <div className="loading-center" role="status" aria-busy="true">
          <span className="spinner spinner-lg" aria-hidden="true" />
          <span>Loading...</span>
        </div>
      ) : (
        <div id={panelId} role="tabpanel" aria-labelledby={tabIds[activeTab]}>
          {filtered.length === 0 ? (
            <div className="empty-state" role="status">
              <span className="empty-state-icon" aria-hidden="true">👥</span>
              <p className="empty-state-title">No results</p>
              <p className="empty-state-text">
                {search.trim() ? "Try a different search term." : `No ${activeTab === TAB_CUSTOMERS ? "customers" : "team members"} found.`}
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Email</th>
                    <th scope="col">ID</th>
                    <th scope="col">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={`${p.Personal_id ?? p.Email ?? i}`}>
                      <td style={{ fontWeight: 500 }}>{p.FirstName} {p.LastName}</td>
                      <td>{p.PhoneNumber}</td>
                      <td><a href={`mailto:${p.Email}`}>{p.Email}</a></td>
                      <td>{p.Personal_id}</td>
                      <td>{p.StreetAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DisplayWorkers;
