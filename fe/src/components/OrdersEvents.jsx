import React, { useState, useEffect, useCallback } from "react";
import CalendarComponent from "../components/CalendarComponent.jsx";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderProgressStepper from "./OrderProgressStepper";
import { apiPost } from "../utils/api";
import "../assets/styles/ordersDate.css";
import "../assets/styles/Calendar.css";

function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return "badge-approved";
  if (s === "rejected") return "badge-rejected";
  return "badge-pending";
}

function normalizeOrderFromDb(row) {
  if (!row) return null;
  return {
    orderNumber: row.OrderNumber ?? row.orderNumber,
    eventName: row.EventName ?? row.eventName ?? "",
    eventPlace: row.EventPlace ?? row.eventPlace ?? "",
    totalPrice: row.TotalPrice ?? row.totalPrice,
    orderDate: row.OrderDate ?? row.orderDate,
    orderHour: row.OrderHour ?? row.orderHour,
    dateOfEvent: row.DateOfEvent ?? row.dateOfEvent,
    hourOfEvent: row.HourOfEvent ?? row.hourOfEvent,
    email: row.Email ?? row.email,
    status: row.Status ?? row.status ?? "Pending",
    orderDescription: row.OrderDescription ?? row.orderDescription ?? "",
  };
}

function extractPhotographersCount(description) {
  if (!description) return { maxStills: 0, maxVideos: 0 };
  const stillsMatches = description.matchAll(/(\d+)\s*Photographers Stills/g);
  const videosMatches = description.matchAll(/(\d+)\s*Photographers Video/g);
  const maxStills = [...stillsMatches].reduce((s, m) => s + parseInt(m[1], 10), 0);
  const maxVideos = [...videosMatches].reduce((s, m) => s + parseInt(m[1], 10), 0);
  return { maxStills, maxVideos };
}

function mergeCalendarOrders(prev, newOrders) {
  const map = new Map();
  for (const o of prev) map.set(`${o.orderNumber}-${o.dateOfEvent}`, o);
  for (const o of newOrders) map.set(`${o.orderNumber}-${o.dateOfEvent}`, { orderNumber: o.orderNumber, dateOfEvent: o.dateOfEvent });
  return [...map.values()];
}

const formatPrice = (p) =>
  Number(p || 0).toLocaleString("he-IL", { style: "currency", currency: "ILS" });

const OrdersEvents = () => {
  const [calendarOrders, setCalendarOrders] = useState([]);
  const [ordersAtDate, setOrdersAtDate] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loadingDate, setLoadingDate] = useState(false);
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [assignedOrdersList, setAssignedOrdersList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStills, setSelectedStills] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [stillsPhotographers, setStillsPhotographers] = useState([]);
  const [videoPhotographers, setVideoPhotographers] = useState([]);
  const [maxStills, setMaxStills] = useState(0);
  const [maxVideos, setMaxVideos] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (!selectedOrder?.orderDescription) { setMaxStills(0); setMaxVideos(0); setSelectedStills([]); setSelectedVideos([]); return; }
    const { maxStills: ms, maxVideos: mv } = extractPhotographersCount(selectedOrder.orderDescription);
    setMaxStills(ms); setMaxVideos(mv); setSelectedStills([]); setSelectedVideos([]);
  }, [selectedOrder?.orderNumber, selectedOrder?.orderDescription]);

  const refreshWorkersForOrder = useCallback(async (order, allAssignedWorkers) => {
    const dateStr = order?.dateOfEvent;
    if (!dateStr) return;
    try {
      const res = await apiPost("/getAvailableWorkers", { data: dateStr });
      if (!res.success || !Array.isArray(res.data)) return;
      const assigned = allAssignedWorkers ?? assignedWorkers;
      const notAssigned = (w) => !assigned.some((a) => a.personalId === w.personalId);
      setStillsPhotographers(res.data.filter((w) => w.roleId === 3).filter(notAssigned));
      setVideoPhotographers(res.data.filter((w) => w.roleId === 4).filter(notAssigned));
    } catch (e) { showToast("error", e.message || "Could not load available staff"); }
  }, [assignedWorkers, showToast]);

  const loadDateData = async (formattedDate) => {
    setLoadingDate(true);
    try {
      const ordersRes = await apiPost("/getOrdersAtDate", { data: formattedDate });
      const list = ordersRes.success && Array.isArray(ordersRes.data) ? ordersRes.data : [];
      setOrdersAtDate(list);
      setCalendarOrders((prev) => mergeCalendarOrders(prev, list));
      const assignedRes = await apiPost("/getAssignedOrders", { data: formattedDate });
      const assigned = assignedRes.success && Array.isArray(assignedRes.data) ? assignedRes.data : [];
      setAssignedOrdersList(assigned);
      if (assigned.length > 0) {
        const workersRes = await apiPost("/getAssignedWorkersForAssignedOrders", { ordersList: assigned });
        setAssignedWorkers(workersRes.success && Array.isArray(workersRes.data) ? workersRes.data : []);
      } else { setAssignedWorkers([]); }
    } catch (e) { setOrdersAtDate([]); showToast("error", e.message || "Failed to load orders"); }
    finally { setLoadingDate(false); }
  };

  const handleDateChange = (date) => {
    const f = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setSelectedDate(f); setSelectedOrder(null); loadDateData(f);
  };

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    try {
      let fullAssigned = [];
      if (assignedOrdersList.length > 0) {
        const wr = await apiPost("/getAssignedWorkersForAssignedOrders", { ordersList: assignedOrdersList });
        if (wr.success && Array.isArray(wr.data)) fullAssigned = wr.data;
      }
      setAssignedWorkers(fullAssigned);
      await refreshWorkersForOrder(order, fullAssigned);
    } catch (e) { showToast("error", e.message || "Failed to load assignment data"); }
  };

  const toggleSelection = (personalId, worker, type) => {
    const setter = type === "stills" ? setSelectedStills : setSelectedVideos;
    setter((prev) => prev.some((s) => s.personalId === personalId) ? prev.filter((s) => s.personalId !== personalId) : [...prev, worker]);
  };

  const isPastEvent = (d) => { const t = new Date(); t.setHours(0,0,0,0); return new Date(d + "T12:00:00") < t; };
  const isAssigned = selectedOrder && assignedOrdersList.includes(selectedOrder.orderNumber);
  const workersForSelected = selectedOrder ? assignedWorkers.filter((w) => w.orderNumber === selectedOrder.orderNumber) : [];

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      const data = await apiPost("/rejectOrder", { orderId: selectedOrder.orderNumber });
      if (!data.success) { showToast("error", data.message || "Failed to reject order"); return; }
      const n = normalizeOrderFromDb(data.order);
      setOrdersAtDate((prev) => prev.map((o) => o.orderNumber === n.orderNumber ? { ...o, ...n } : o));
      setSelectedOrder((prev) => prev && prev.orderNumber === n.orderNumber ? { ...prev, ...n } : prev);
      showToast("success", "Order rejected.");
    } catch (e) { showToast("error", e.message || "Error rejecting order"); }
    finally { setSubmitting(false); }
  };

  const handleAssignAndApprove = async () => {
    if (!selectedOrder) return;
    if (maxStills === 0 && maxVideos === 0) {
      setSubmitting(true);
      try {
        const r = await apiPost("/approveOrder", { orderId: selectedOrder.orderNumber });
        if (!r.success) { showToast("error", r.message || "Approval failed"); return; }
        setAssignedOrdersList((p) => p.includes(selectedOrder.orderNumber) ? p : [...p, selectedOrder.orderNumber]);
        setOrdersAtDate((p) => p.map((o) => o.orderNumber === selectedOrder.orderNumber ? { ...o, status: "Approved" } : o));
        setSelectedOrder((p) => p ? { ...p, status: "Approved" } : p);
        showToast("success", "Order approved.");
        await loadDateData(selectedDate);
      } catch (e) { showToast("error", e.message || "Approval failed"); }
      finally { setSubmitting(false); }
      return;
    }
    if (selectedStills.length < maxStills || selectedVideos.length < maxVideos) {
      showToast("error", `Select ${maxStills} stills and ${maxVideos} video photographer(s).`);
      return;
    }
    setSubmitting(true);
    try {
      const payload = [...selectedStills, ...selectedVideos].map((w) => ({ personalId: w.personalId }));
      await apiPost("/assignWorkers", { orderId: selectedOrder.orderNumber, workers: payload });
      const r = await apiPost("/approveOrder", { orderId: selectedOrder.orderNumber });
      if (!r.success) { showToast("error", r.message || "Approval failed"); return; }
      setAssignedOrdersList((p) => p.includes(selectedOrder.orderNumber) ? p : [...p, selectedOrder.orderNumber]);
      const newA = [...selectedStills, ...selectedVideos].map((w) => ({ firstName: w.firstName, lastName: w.lastName, orderNumber: selectedOrder.orderNumber, personalId: w.personalId, phoneNumber: w.phoneNumber, roleName: w.roleName }));
      const merged = [...assignedWorkers, ...newA];
      setAssignedWorkers(merged);
      setOrdersAtDate((p) => p.map((o) => o.orderNumber === selectedOrder.orderNumber ? { ...o, status: "Approved" } : o));
      setSelectedOrder((p) => p ? { ...p, status: "Approved" } : p);
      setSelectedStills([]); setSelectedVideos([]);
      showToast("success", "Staff assigned and order approved.");
      await refreshWorkersForOrder({ ...selectedOrder, status: "Approved" }, merged);
    } catch (e) { showToast("error", e.message || "Assignment or approval failed"); }
    finally { setSubmitting(false); }
  };

  const formatDate = (d) => {
    if (!d) return "";
    try { return new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="orders-events-outer">
      {toast && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      <div className="orders-events-layout">
        {/* LEFT: Calendar + order list */}
        <div className="orders-events-left">
          <CalendarComponent handleDateChange={handleDateChange} selectedDate={selectedDate} orders={calendarOrders} />

          <div className="calendar-legend">
            <span><span className="calendar-legend-dot" style={{ background: "var(--color-success)" }} /> Upcoming events</span>
            <span><span className="calendar-legend-dot" style={{ background: "var(--color-text-muted)" }} /> Past events</span>
          </div>

          {loadingDate && (
            <div className="loading-center" role="status" aria-busy="true">
              <span className="spinner" aria-hidden="true" />
              <span>Loading orders...</span>
            </div>
          )}

          {!loadingDate && selectedDate && ordersAtDate.length === 0 && (
            <div className="empty-state" role="status">
              <p className="empty-state-title">No orders on {formatDate(selectedDate)}</p>
              <p className="empty-state-text">Select another date to view orders.</p>
            </div>
          )}

          {!loadingDate && ordersAtDate.length > 0 && (
            <section aria-label="Orders for selected date">
              <h2 className="orders-date-heading">
                {ordersAtDate.length} order{ordersAtDate.length !== 1 ? "s" : ""} on {formatDate(selectedDate)}
              </h2>
              <div className="orders-date-cards">
                {ordersAtDate.map((order) => {
                  const sel = selectedOrder?.orderNumber === order.orderNumber;
                  return (
                    <button
                      key={order.orderNumber}
                      type="button"
                      className={`order-list-card${sel ? " card--selected" : ""}`}
                      onClick={() => handleSelectOrder(order)}
                      aria-pressed={sel}
                      aria-label={`Order ${order.orderNumber}: ${order.eventName}, ${order.status || "Pending"}`}
                    >
                      <div className="d-flex jc-sb ai-c f-wrap g-1" style={{ marginBottom: "0.6rem" }}>
                        <strong style={{ fontSize: "1.5rem", color: "var(--color-secondary)" }}>{order.eventName}</strong>
                        <span className={`badge ${statusBadgeClass(order.status)}`}>{order.status || "Pending"}</span>
                      </div>
                      <p><strong>Location:</strong> {order.eventPlace}</p>
                      <p><strong>Time:</strong> {order.hourOfEvent || "—"} &middot; <strong>Price:</strong> {formatPrice(order.totalPrice)}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT: Detail + actions */}
        {selectedOrder && (
          <div className="orders-events-right">
            <div className="order-detail-panel">
              <div className="d-flex jc-sb ai-c f-wrap g-1" style={{ marginBottom: "1.2rem" }}>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--color-secondary)", margin: 0 }}>
                  Order #{selectedOrder.orderNumber}
                </h3>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>

              <OrderProgressStepper status={selectedOrder.status} />

              <dl className="order-detail-dl" style={{ marginTop: "1.2rem" }}>
                <dt>Event</dt><dd>{selectedOrder.eventName}</dd>
                <dt>Location</dt><dd>{selectedOrder.eventPlace}</dd>
                <dt>Price</dt><dd>{formatPrice(selectedOrder.totalPrice)}</dd>
                <dt>Event date</dt><dd>{formatDate(selectedOrder.dateOfEvent)}</dd>
                <dt>Time</dt><dd>{selectedOrder.hourOfEvent || "—"}</dd>
                <dt>Customer</dt><dd><a href={`mailto:${selectedOrder.email}`}>{selectedOrder.email}</a></dd>
                <dt>Description</dt><dd>{selectedOrder.orderDescription || "—"}</dd>
              </dl>
            </div>

            <div className="workers-panel" role="region" aria-label="Staff assignment">
              {selectedOrder.status?.toLowerCase() === "rejected" ? (
                <p className="messagesReject" role="alert">This order has been rejected.</p>
              ) : isAssigned ? (
                <div>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "1rem" }}>Assigned Staff</h3>
                  {workersForSelected.length === 0 ? (
                    <p className="empty-state-text">No staff assigned to this order.</p>
                  ) : (
                    <ul className="assigned-workers-list">
                      {workersForSelected.map((w) => (
                        <li key={`${w.personalId}-${w.orderNumber}`} className="worker-item">
                          <strong>{w.firstName} {w.lastName}</strong> — {w.roleName} — {w.phoneNumber}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : isPastEvent(selectedOrder.dateOfEvent) ? (
                <div className="past-event-warning" role="alert">This event date has passed. Staff cannot be assigned retroactively.</div>
              ) : (
                <div className="d-flex f-column g-2">
                  <h3 style={{ fontSize: "1.6rem", fontWeight: 600, margin: 0 }}>Assign Staff</h3>

                  {stillsPhotographers.length > 0 && (
                    <fieldset className="form-group">
                      <legend className="form-label">Stills photographers ({selectedStills.length}/{maxStills})</legend>
                      {stillsPhotographers.map((w) => {
                        const checked = selectedStills.some((s) => s.personalId === w.personalId);
                        const id = `stills-${w.personalId}`;
                        return (
                          <label key={w.personalId} htmlFor={id} className="d-flex ai-c g-1" style={{ padding: "0.4rem 0", cursor: "pointer", fontSize: "1.3rem" }}>
                            <input id={id} type="checkbox" checked={checked}
                              onChange={() => toggleSelection(w.personalId, w, "stills")}
                              disabled={maxStills > 0 && selectedStills.length >= maxStills && !checked}
                              style={{ width: "1.6rem", height: "1.6rem", accentColor: "var(--color-primary)" }}
                            />
                            {w.firstName} {w.lastName} — {w.phoneNumber}
                          </label>
                        );
                      })}
                    </fieldset>
                  )}

                  {videoPhotographers.length > 0 && (
                    <fieldset className="form-group">
                      <legend className="form-label">Video photographers ({selectedVideos.length}/{maxVideos})</legend>
                      {videoPhotographers.map((w) => {
                        const checked = selectedVideos.some((s) => s.personalId === w.personalId);
                        const id = `video-${w.personalId}`;
                        return (
                          <label key={w.personalId} htmlFor={id} className="d-flex ai-c g-1" style={{ padding: "0.4rem 0", cursor: "pointer", fontSize: "1.3rem" }}>
                            <input id={id} type="checkbox" checked={checked}
                              onChange={() => toggleSelection(w.personalId, w, "videos")}
                              disabled={maxVideos > 0 && selectedVideos.length >= maxVideos && !checked}
                              style={{ width: "1.6rem", height: "1.6rem", accentColor: "var(--color-primary)" }}
                            />
                            {w.firstName} {w.lastName} — {w.phoneNumber}
                          </label>
                        );
                      })}
                    </fieldset>
                  )}

                  <div className="d-flex f-column g-1 mt-1">
                    <button type="button" className="btn btn-primary btn-block" onClick={handleAssignAndApprove}
                      disabled={submitting || (maxStills > 0 && selectedStills.length < maxStills) || (maxVideos > 0 && selectedVideos.length < maxVideos)}>
                      {maxStills === 0 && maxVideos === 0 ? "Approve Order" : "Assign Staff & Approve"}
                    </button>
                    <button type="button" className="btn btn-danger btn-block" onClick={handleRejectOrder} disabled={submitting}>
                      Reject Order
                    </button>
                  </div>

                  {(stillsPhotographers.length < maxStills || videoPhotographers.length < maxVideos) && (
                    <p style={{ fontSize: "1.3rem", color: "var(--color-warning)", marginTop: "0.4rem" }} role="note">
                      Not enough available staff for this date. Consider adjusting your team or rejecting the order.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersEvents;
