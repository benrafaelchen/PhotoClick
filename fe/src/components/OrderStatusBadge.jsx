import React from "react";
import { MdSchedule, MdCheckCircle, MdCancel } from "react-icons/md";

const statusConfig = {
  pending: { icon: MdSchedule, className: "badge-pending", label: "Pending" },
  approved: { icon: MdCheckCircle, className: "badge-approved", label: "Approved" },
  rejected: { icon: MdCancel, className: "badge-rejected", label: "Rejected" },
};

const OrderStatusBadge = ({ status, compact = false }) => {
  const key = (status || "pending").toLowerCase();
  const config = statusConfig[key] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`badge ${config.className}`}
      title={`Status: ${config.label}`}
      role="status"
    >
      <Icon aria-hidden="true" style={{ fontSize: "1.4rem" }} />
      {!compact && <span>{config.label}</span>}
    </span>
  );
};

export default OrderStatusBadge;
