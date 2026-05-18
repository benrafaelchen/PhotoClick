import React from "react";

const steps = [
  { key: "pending", label: "Order Placed" },
  { key: "approved", label: "Approved" },
  { key: "completed", label: "Completed" },
];

const OrderProgressStepper = ({ status }) => {
  const current = (status || "pending").toLowerCase();
  const isRejected = current === "rejected";

  const getStepIndex = () => {
    if (current === "pending") return 0;
    if (current === "approved") return 1;
    if (current === "completed") return 2;
    return -1;
  };

  const activeIndex = getStepIndex();

  return (
    <div
      role="status"
      aria-label={isRejected ? "Order rejected" : `Order progress: ${steps[activeIndex]?.label || current}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0",
        padding: "1.2rem 0",
      }}
    >
      {isRejected ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          color: "var(--color-danger)",
          fontWeight: 600,
          fontSize: "1.3rem",
        }}>
          <span style={{
            width: "2.4rem",
            height: "2.4rem",
            borderRadius: "50%",
            background: "var(--color-danger-light)",
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            fontWeight: 700,
          }}>
            ✕
          </span>
          Order Rejected
        </div>
      ) : (
        steps.map((step, i) => {
          const isCompleted = i <= activeIndex;
          const isActive = i === activeIndex;

          return (
            <React.Fragment key={step.key}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
                flex: "0 0 auto",
              }}>
                <div style={{
                  width: "2.4rem",
                  height: "2.4rem",
                  borderRadius: "50%",
                  background: isCompleted ? "var(--color-primary)" : "var(--color-border)",
                  color: isCompleted ? "#fff" : "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  transition: "all 0.2s",
                  boxShadow: isActive ? "0 0 0 3px var(--color-primary-light)" : "none",
                }}>
                  {isCompleted ? "✓" : i + 1}
                </div>
                <span style={{
                  fontSize: "1.1rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isCompleted ? "var(--color-text)" : "var(--color-text-muted)",
                  whiteSpace: "nowrap",
                }}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: "1",
                  height: "2px",
                  minWidth: "2rem",
                  background: i < activeIndex ? "var(--color-primary)" : "var(--color-border)",
                  margin: "0 0.4rem",
                  marginBottom: "2rem",
                  transition: "background 0.2s",
                }} />
              )}
            </React.Fragment>
          );
        })
      )}
    </div>
  );
};

export default OrderProgressStepper;
