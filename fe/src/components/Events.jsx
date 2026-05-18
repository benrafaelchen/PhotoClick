import React, { useState, useEffect, useMemo, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import OrderStatusBadge from "./OrderStatusBadge";
import { apiPost, getUserInfo } from "../utils/api";
import "../assets/styles/MyEvent.css";

const formatDate = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCurrency = (n) =>
  Number(n || 0).toLocaleString("he-IL", { style: "currency", currency: "ILS" });

const Events = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchDate, setSearchDate] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchEvents = useCallback(async (userId) => {
    if (!userId) { setOrders([]); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const data = await apiPost("/getOrdersForWorker", { userId });
      if (data.success && Array.isArray(data.data)) { setOrders(data.data); setCurrentIndex(0); }
      else setOrders([]);
    } catch (e) { setError(e.message || "Could not load events"); setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const { userId } = getUserInfo();
    if (userId) fetchEvents(userId); else { setLoading(false); setOrders([]); }
  }, [fetchEvents]);

  const filtered = useMemo(() => {
    const base = searchDate == null ? orders
      : orders.filter((o) => formatDate(o.dateOfEvent) === formatDate(searchDate));
    return base.slice().sort((a, b) => new Date(b.dateOfEvent) - new Date(a.dateOfEvent));
  }, [orders, searchDate]);

  useEffect(() => {
    if (currentIndex >= filtered.length && filtered.length > 0) setCurrentIndex(filtered.length - 1);
    if (filtered.length === 0) setCurrentIndex(0);
  }, [filtered.length, currentIndex]);

  const eventDates = useMemo(() => orders.map((o) => new Date(o.dateOfEvent)), [orders]);

  const upcomingCount = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return orders.filter((o) => new Date(o.dateOfEvent) >= now).length;
  }, [orders]);

  const prev = () => setCurrentIndex((p) => (p > 0 ? p - 1 : filtered.length - 1));
  const next = () => setCurrentIndex((p) => (p < filtered.length - 1 ? p + 1 : 0));

  if (loading) {
    return <div className="events-page"><div className="loading-center" aria-busy="true"><span className="spinner spinner-lg" aria-hidden="true" /><span>Loading your assignments...</span></div></div>;
  }

  if (error) {
    return (
      <div className="events-page">
        <div className="empty-state" role="alert">
          <span className="empty-state-icon" aria-hidden="true">&#9888;&#65039;</span>
          <p className="empty-state-title">Something went wrong</p>
          <p className="empty-state-text">{error}</p>
          <button type="button" className="btn btn-secondary btn-sm mt-1" onClick={() => { const { userId } = getUserInfo(); if (userId) fetchEvents(userId); }}>Retry</button>
        </div>
      </div>
    );
  }

  const current = filtered[currentIndex];

  return (
    <div className="events-page">
      {/* Stats bar */}
      <div className="events-stats-bar">
        <div className="events-stat-card">
          <span className="events-stat-value">{orders.length}</span>
          <span className="events-stat-label">Total Assignments</span>
        </div>
        <div className="events-stat-card">
          <span className="events-stat-value" style={{ color: "var(--color-success)" }}>{upcomingCount}</span>
          <span className="events-stat-label">Upcoming</span>
        </div>
        <div className="events-stat-card">
          <span className="events-stat-value">{orders.length - upcomingCount}</span>
          <span className="events-stat-label">Completed</span>
        </div>
      </div>

      {/* Filter */}
      <div className="events-filter-bar">
        <div className="form-group" style={{ minWidth: "18rem", flex: "0 1 24rem" }}>
          <label className="form-label" htmlFor="events-filter-date">Filter by date</label>
          <DatePicker id="events-filter-date" selected={searchDate}
            onChange={(d) => { setSearchDate(d); setCurrentIndex(0); }}
            highlightDates={eventDates} placeholderText="All dates" dateFormat="dd/MM/yyyy"
            isClearable className="form-input datepicker-input"
          />
        </div>
        <span style={{ fontSize: "1.3rem", color: "var(--color-text-muted)" }}>
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}{searchDate ? " matched" : ""}
        </span>
      </div>

      {/* Event card */}
      {current ? (
        <article className="events-card" aria-label={`Event ${current.orderNumber}: ${current.eventName}`}>
          <div className="events-card-header">
            <div className="d-flex ai-c g-1 f-wrap">
              <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--color-secondary)", margin: 0 }}>
                {current.eventName}
              </h3>
              <OrderStatusBadge status={current.status || "Approved"} />
            </div>
            <span style={{ fontSize: "1.3rem", color: "var(--color-text-muted)" }}>
              Order #{current.orderNumber}
            </span>
          </div>

          <dl className="events-detail-dl">
            <dt>Location</dt><dd>{current.eventPlace}</dd>
            <dt>Date</dt><dd>{formatDate(current.dateOfEvent)}</dd>
            <dt>Time</dt><dd>{current.hourOfEvent || "—"}</dd>
            <dt>Event Value</dt><dd>{formatCurrency(current.totalPrice)}</dd>
          </dl>

          {filtered.length > 1 && (
            <div className="events-carousel-nav">
              <button type="button" className="btn btn-secondary btn-sm" onClick={prev} aria-label="Previous event">&lsaquo; Previous</button>
              <span style={{ fontSize: "1.3rem", color: "var(--color-text-muted)", minWidth: "5rem", textAlign: "center" }}>{currentIndex + 1} / {filtered.length}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={next} aria-label="Next event">Next &rsaquo;</button>
            </div>
          )}
        </article>
      ) : (
        <div className="empty-state" role="status">
          <span className="empty-state-icon" aria-hidden="true">&#128247;</span>
          <p className="empty-state-title">{searchDate ? "No events on this date" : "No assignments yet"}</p>
          <p className="empty-state-text">{searchDate ? "Clear the filter to see all events." : "Once you're assigned to an event, it will appear here."}</p>
        </div>
      )}
    </div>
  );
};

export default Events;
