import React, { useState, useCallback } from "react";
import { apiPost } from "../utils/api";
import { validateDateString, sanitizeDateInput } from "../utils/dateValidation";
import "../assets/styles/Report.css";

const TABS = [
  { id: "revenue", label: "Revenue" },
  { id: "expenses", label: "Expenses" },
  { id: "customers", label: "Customers" },
  { id: "workers", label: "Staff" },
  { id: "orders", label: "Orders" },
];

const currency = (n) =>
  parseFloat(n || 0).toLocaleString("he-IL", { style: "currency", currency: "ILS" });

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const PRESETS = [
  { label: "This month", get: () => { const n = new Date(); return { from: toDateStr(new Date(n.getFullYear(), n.getMonth(), 1)), to: toDateStr(n) }; } },
  { label: "Last month", get: () => { const n = new Date(); const s = new Date(n.getFullYear(), n.getMonth() - 1, 1); const e = new Date(n.getFullYear(), n.getMonth(), 0); return { from: toDateStr(s), to: toDateStr(e) }; } },
  { label: "Last 90 days", get: () => { const n = new Date(); const s = new Date(n); s.setDate(n.getDate() - 90); return { from: toDateStr(s), to: toDateStr(n) }; } },
  { label: "This year", get: () => { const n = new Date(); return { from: `${n.getFullYear()}-01-01`, to: toDateStr(n) }; } },
];

const Reports = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");
  const [toast, setToast] = useState(null);

  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [productItemsExpenses, setProductItemsExpenses] = useState([]);
  const [totalWorkerCost, setTotalWorkerCost] = useState(0);
  const [customerReports, setCustomerReports] = useState([]);
  const [workerReports, setWorkerReports] = useState([]);
  const [orderReports, setOrderReports] = useState([]);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const applyPreset = (preset) => {
    const { from, to } = preset.get();
    setFromDate(from);
    setToDate(to);
  };

  const handleFromDateChange = (e) => {
    const sanitized = sanitizeDateInput(e.target.value);
    if (!sanitized) { setFromDate(""); return; }
    const check = validateDateString(sanitized);
    if (!check.valid) { showToast("error", check.message); return; }
    setFromDate(sanitized);
  };

  const handleToDateChange = (e) => {
    const sanitized = sanitizeDateInput(e.target.value);
    if (!sanitized) { setToDate(""); return; }
    const check = validateDateString(sanitized);
    if (!check.valid) { showToast("error", check.message); return; }
    setToDate(sanitized);
  };

  const generateReport = async () => {
    if (!fromDate || !toDate) { showToast("error", "Select a date range."); return; }
    const fromCheck = validateDateString(fromDate);
    const toCheck = validateDateString(toDate);
    if (!fromCheck.valid) { showToast("error", fromCheck.message); return; }
    if (!toCheck.valid) { showToast("error", toCheck.message); return; }
    if (fromCheck.date > toCheck.date) { showToast("error", "Start date must be before end date."); return; }

    setLoading(true);
    try {
      const [revRes, expRes, custRes, wrkRes, ordRes] = await Promise.all([
        apiPost("/getRevenue", { fromDate, toDate }),
        apiPost("/getExpenses", { fromDate, toDate }),
        apiPost("/getCustomerReport", { fromDate, toDate }),
        apiPost("/getWorkerReport", { fromDate, toDate }),
        apiPost("/getOrderReport", { fromDate, toDate }),
      ]);
      setTotalRevenue(parseFloat(revRes.totalRevenue || 0));
      setOrders(Array.isArray(revRes.orders) ? revRes.orders : []);
      setProductItemsExpenses(Array.isArray(expRes.items) ? expRes.items : []);
      setTotalWorkerCost(parseFloat(expRes.totalWorkerCost || 0));
      setCustomerReports(Array.isArray(custRes.customers) ? custRes.customers : []);
      setWorkerReports(Array.isArray(wrkRes.workerReports) ? wrkRes.workerReports : []);
      setOrderReports(Array.isArray(ordRes.orderReports) ? ordRes.orderReports : []);
      setGenerated(true);
      setActiveTab("revenue");
    } catch (e) { showToast("error", e.message || "Error generating reports"); }
    finally { setLoading(false); }
  };

  const netProfit = totalRevenue - totalWorkerCost;

  return (
    <div className="reports-page">
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      {/* Date range card */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "1.2rem", color: "var(--color-secondary)" }}>
          Date Range
        </h3>

        <div className="d-flex f-wrap g-1" style={{ marginBottom: "1.2rem" }}>
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="d-flex f-wrap g-2 ai-c">
          <div className="form-group" style={{ minWidth: "14rem", flex: 1, maxWidth: "20rem" }}>
            <label className="form-label" htmlFor="report-from">From</label>
            <input id="report-from" type="date" className="form-input" value={fromDate} onChange={handleFromDateChange} />
          </div>
          <div className="form-group" style={{ minWidth: "14rem", flex: 1, maxWidth: "20rem" }}>
            <label className="form-label" htmlFor="report-to">To</label>
            <input id="report-to" type="date" className="form-input" value={toDate} min={fromDate || undefined} onChange={handleToDateChange} />
          </div>
          <button type="button" className="btn btn-primary" onClick={generateReport} disabled={loading} aria-busy={loading}
            style={{ alignSelf: "flex-end", minWidth: "16rem" }}>
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-center" role="status"><span className="spinner spinner-lg" aria-hidden="true" /><span>Generating reports...</span></div>
      )}

      {generated && !loading && (
        <>
          {/* Summary cards */}
          <div className="reports-summary">
            <div className="reports-summary-card">
              <div className="summary-value">{currency(totalRevenue)}</div>
              <div className="summary-label">Total Revenue</div>
            </div>
            <div className="reports-summary-card">
              <div className="summary-value" style={{ color: "var(--color-danger)" }}>{currency(totalWorkerCost)}</div>
              <div className="summary-label">Staff Costs</div>
            </div>
            <div className="reports-summary-card">
              <div className="summary-value" style={{ color: netProfit >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>{currency(netProfit)}</div>
              <div className="summary-label">Net Profit</div>
            </div>
            <div className="reports-summary-card">
              <div className="summary-value">{orderReports.length}</div>
              <div className="summary-label">Total Orders</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="reports-tabs" role="tablist" aria-label="Report sections">
            {TABS.map((tab) => (
              <button key={tab.id} type="button" id={`report-tab-${tab.id}`} role="tab"
                aria-selected={activeTab === tab.id} aria-controls={`report-panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`report-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Revenue */}
          {activeTab === "revenue" && (
            <div id="report-panel-revenue" role="tabpanel" aria-labelledby="report-tab-revenue" className="card" style={{ marginTop: "1.6rem" }}>
              {orders.length === 0 ? (
                <div className="empty-state"><p className="empty-state-title">No revenue data</p><p className="empty-state-text">Try a wider date range.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead><tr><th scope="col">Order #</th><th scope="col">Order Date</th><th scope="col">Amount</th></tr></thead>
                    <tbody>
                      {orders.map((o) => (<tr key={o.OrderNumber}><td>{o.OrderNumber}</td><td>{o.OrderDate}</td><td>{currency(o.TotalPrice)}</td></tr>))}
                      <tr style={{ fontWeight: 600 }}><td>Total</td><td></td><td>{currency(totalRevenue)}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Expenses */}
          {activeTab === "expenses" && (
            <div id="report-panel-expenses" role="tabpanel" aria-labelledby="report-tab-expenses" className="card" style={{ marginTop: "1.6rem" }}>
              {productItemsExpenses.length === 0 ? (
                <div className="empty-state"><p className="empty-state-title">No expense data</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead><tr><th scope="col">Product</th><th scope="col">Client Price</th><th scope="col">Staff Cost</th><th scope="col">Profit</th><th scope="col">Qty</th></tr></thead>
                    <tbody>
                      {productItemsExpenses.map((item, i) => (
                        <tr key={`${item.product}-${i}`}>
                          <td>{item.product}</td><td>{currency(item.totalClientPrice)}</td><td>{currency(item.totalWorkerCost)}</td><td>{currency(item.managerProfit)}</td><td>{item.quantity}</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: 600 }}>
                        <td>Totals</td>
                        <td>{currency(productItemsExpenses.reduce((s, i) => s + parseFloat(i.totalClientPrice || 0), 0))}</td>
                        <td>{currency(productItemsExpenses.reduce((s, i) => s + parseFloat(i.totalWorkerCost || 0), 0))}</td>
                        <td>{currency(productItemsExpenses.reduce((s, i) => s + parseFloat(i.managerProfit || 0), 0))}</td>
                        <td>{productItemsExpenses.reduce((s, i) => s + (i.quantity || 0), 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Customers */}
          {activeTab === "customers" && (
            <div id="report-panel-customers" role="tabpanel" aria-labelledby="report-tab-customers" className="card" style={{ marginTop: "1.6rem" }}>
              {customerReports.length === 0 ? (
                <div className="empty-state"><p className="empty-state-title">No customer data</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Orders</th><th scope="col">Total Spent</th></tr></thead>
                    <tbody>
                      {customerReports.map((c, i) => (<tr key={`${c.email}-${i}`}><td>{c.name}</td><td>{c.email}</td><td>{c.orders_list}</td><td>{currency(c.total_expenses)}</td></tr>))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Staff */}
          {activeTab === "workers" && (
            <div id="report-panel-workers" role="tabpanel" aria-labelledby="report-tab-workers" className="card" style={{ marginTop: "1.6rem" }}>
              {workerReports.length === 0 ? (
                <div className="empty-state"><p className="empty-state-title">No staff data</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead><tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Events</th><th scope="col">Stills Earnings</th><th scope="col">Video Earnings</th></tr></thead>
                    <tbody>
                      {workerReports.map((w, i) => (
                        <tr key={`${w.email}-${i}`}><td>{w.name}</td><td>{w.role}</td><td>{w.event_count}</td><td>{currency(w.stills_earnings)}</td><td>{currency(w.video_earnings)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div id="report-panel-orders" role="tabpanel" aria-labelledby="report-tab-orders" className="card" style={{ marginTop: "1.6rem" }}>
              {orderReports.length === 0 ? (
                <div className="empty-state"><p className="empty-state-title">No orders in range</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead><tr><th scope="col">#</th><th scope="col">Event</th><th scope="col">Location</th><th scope="col">Total</th><th scope="col">Customer</th><th scope="col">Event Date</th></tr></thead>
                    <tbody>
                      {orderReports.map((o, i) => (
                        <tr key={`${o.orderNumber}-${i}`}><td>{o.orderNumber}</td><td>{o.eventName}</td><td>{o.eventPlace}</td><td>{currency(o.totalPrice)}</td><td>{o.email}</td><td>{o.eventDate}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!generated && !loading && (
        <div className="empty-state" style={{ marginTop: "2rem" }}>
          <span className="empty-state-icon" aria-hidden="true">📊</span>
          <p className="empty-state-title">Select a date range to begin</p>
          <p className="empty-state-text">Use the presets above or pick custom dates, then click Generate Report.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
