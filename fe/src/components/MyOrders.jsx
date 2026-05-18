import React, { useState, useEffect, useCallback, useRef } from "react";
import "../assets/styles/MyOrders.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderProgressStepper from "./OrderProgressStepper";
import { apiPost, getUserInfo } from "../utils/api";

const formatDate = (dateInput) => {
  if (!dateInput) return "";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCurrency = (n) =>
  Number(n || 0).toLocaleString("he-IL", { style: "currency", currency: "ILS" });

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchDate, setSearchDate] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    const userEmail = getUserInfo().email;
    if (!userEmail) { if (mountedRef.current) { setOrders([]); setLoading(false); } return; }
    try {
      const data = await apiPost("/getUserOrders", { email: userEmail });
      if (!mountedRef.current) return;
      setOrders(data.success ? (data.orders || []) : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (mountedRef.current) setOrders([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders();
    const id = window.setInterval(() => { if (mountedRef.current) fetchOrders(); }, 8000);
    return () => { mountedRef.current = false; window.clearInterval(id); };
  }, [fetchOrders]);

  const filteredOrders = orders
    .filter((o) => {
      if (!searchDate) return true;
      return formatDate(o.DateOfEvent) === formatDate(searchDate);
    })
    .sort((a, b) => new Date(b.DateOfEvent) - new Date(a.DateOfEvent));

  useEffect(() => {
    setCurrentIndex((prev) => (prev >= filteredOrders.length ? 0 : prev));
  }, [filteredOrders.length]);

  const total = filteredOrders.length;
  const current = filteredOrders[currentIndex] || null;

  const goPrev = () => setCurrentIndex((p) => (p > 0 ? p - 1 : p));
  const goNext = () => setCurrentIndex((p) => (p < total - 1 ? p + 1 : p));

  const safeFormatItem = (item) => {
    const desc = item.ItemDescription || "Item";
    const price = Number(item.ItemPrice || 0);
    const qty = Number(item.Quantity || 0);
    return `${desc} x ${qty} = ${formatCurrency(price * qty)}`;
  };

  if (loading) {
    return (
      <div className="my-orders-wrapper">
        <div className="loading-center" aria-busy="true"><span className="spinner spinner-lg" aria-hidden="true" /><span>Loading your orders...</span></div>
      </div>
    );
  }

  return (
    <div className="my-orders-wrapper">
      {/* Filter bar - always visible */}
      <div className="my-orders-filter-bar">
        <div className="d-flex ai-c g-2 f-wrap" style={{ flex: 1 }}>
          <div className="form-group" style={{ minWidth: "18rem", flex: "0 1 24rem" }}>
            <label className="form-label" htmlFor="my-orders-search-date">Filter by event date</label>
            <DatePicker
              id="my-orders-search-date"
              selected={searchDate}
              onChange={(d) => { setSearchDate(d || null); setCurrentIndex(0); }}
              placeholderText="All dates"
              highlightDates={orders.map((o) => new Date(o.DateOfEvent))}
              dateFormat="dd/MM/yyyy"
              isClearable
              className="form-input datepicker-input"
            />
          </div>
          <span className="my-orders-count">
            {total} order{total !== 1 ? "s" : ""}{searchDate ? " matched" : ""}
          </span>
        </div>
      </div>

      {/* Current order */}
      {current ? (
        <div className="my-orders-content">
          <div className="my-orders-card-header">
            <div className="d-flex ai-c g-1 f-wrap">
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--color-secondary)", margin: 0 }}>
                Order #{current.OrderNumber}
              </h2>
              <OrderStatusBadge status={current.Status} />
            </div>
            {total > 1 && (
              <div className="d-flex ai-c g-1">
                <button type="button" className="btn btn-secondary btn-sm" onClick={goPrev} disabled={currentIndex === 0} aria-label="Previous order">&lsaquo; Prev</button>
                <span style={{ fontSize: "1.3rem", color: "var(--color-text-muted)", minWidth: "5rem", textAlign: "center" }}>{currentIndex + 1} / {total}</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={goNext} disabled={currentIndex === total - 1} aria-label="Next order">Next &rsaquo;</button>
              </div>
            )}
          </div>

          <OrderProgressStepper status={current.Status} />

          {current.Status?.toLowerCase() === "rejected" ? (
            <div className="card" style={{ background: "var(--color-danger-light)", borderColor: "var(--color-danger)", marginTop: "1.2rem" }}>
              <p style={{ color: "var(--color-danger)", fontWeight: 500, fontSize: "1.4rem", margin: 0 }}>
                This order has been declined. The event on {formatDate(current.DateOfEvent)} could not be accommodated due to staff availability. Please contact us or create a new order for alternative dates.
              </p>
            </div>
          ) : (
            <div className="my-orders-detail-grid">
              <div className="card">
                <h3 className="my-orders-section-title">Event Details</h3>
                <dl className="my-orders-dl">
                  <dt>Event</dt><dd>{current.EventName}</dd>
                  <dt>Location</dt><dd>{current.EventPlace}</dd>
                  <dt>Event Date</dt><dd>{formatDate(current.DateOfEvent)}</dd>
                  <dt>Event Time</dt><dd>{current.HourOfEvent || "—"}</dd>
                  <dt>Total Price</dt><dd style={{ fontWeight: 600, color: "var(--color-primary)" }}>{formatCurrency(current.TotalPrice)}</dd>
                </dl>
              </div>

              <div className="card">
                <h3 className="my-orders-section-title">Order Summary</h3>
                <dl className="my-orders-dl">
                  <dt>Ordered</dt><dd>{formatDate(current.OrderDate)}</dd>
                  <dt>Description</dt><dd>{current.OrderDescription || "—"}</dd>
                </dl>
                {(current.Items || []).length > 0 && (
                  <div style={{ marginTop: "1.2rem" }}>
                    <h4 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.6rem" }}>Items</h4>
                    <ul className="my-orders-items-list">
                      {current.Items.map((item, i) => (
                        <li key={i}>{safeFormatItem(item)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <span className="empty-state-icon" aria-hidden="true">📋</span>
          <p className="empty-state-title">{searchDate ? "No orders on this date" : "No orders yet"}</p>
          <p className="empty-state-text">{searchDate ? "Try clearing the date filter or pick another date." : "Once you place an order, it will appear here."}</p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
