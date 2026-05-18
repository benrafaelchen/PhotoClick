import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarComponent = ({ selectedDate, orders, handleDateChange }) => {
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const hasOrder = orders.some((o) => o.dateOfEvent === formatted);

    if (!hasOrder) return "";

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return formatted < todayStr ? "past-order" : "future-order";
  };

  return (
    <div className="calendar-page">
      <div className="calendar-wrapper">
        <Calendar
          tileClassName={tileClassName}
          onChange={handleDateChange}
          value={selectedDate ? new Date(selectedDate + "T12:00:00") : new Date()}
          locale="en-US"
        />
      </div>
    </div>
  );
};

export default CalendarComponent;
