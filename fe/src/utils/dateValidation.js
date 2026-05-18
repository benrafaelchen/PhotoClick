const ISRAEL_TZ = "Asia/Jerusalem";

const REPORT_MIN_YEAR = 2000;
const REPORT_MAX_YEAR = 2100;

const MSG_EVENT_REQUIRED = "Please select a valid future event date.";
const MSG_EVENT_PAST = "Event date must be today or a future date.";
const MSG_EVENT_TOO_FAR = "Please select a valid future event date.";
const MSG_EVENT_INVALID = "Please select a valid future event date.";

/**
 * Calendar date parts in Israel (YYYY, MM, DD as strings).
 */
export function getIsraelLocalDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISRAEL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const pick = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return { year: pick("year"), month: pick("month"), day: pick("day") };
}

/** YYYY-MM-DD for the given instant in Israel. */
export function getIsraelLocalIsoDate(date = new Date()) {
  const { year, month, day } = getIsraelLocalDateParts(date);
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a local Date if the calendar date is valid.
 * @returns {Date|null}
 */
export function parseIsoDateString(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function toIsoDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Sanitize partial date input: keep digits and dashes, cap year at 4 digits.
 */
export function sanitizeDateInput(value) {
  if (value == null) return "";
  let s = String(value).replace(/[^\d-]/g, "");
  const parts = s.split("-");
  if (parts[0]) {
    parts[0] = parts[0].slice(0, 4);
  }
  return parts.join("-");
}

/**
 * Generic date validation (reports, etc.) — may use year range messages.
 */
export function validateDateString(value, options = {}) {
  const {
    minDate,
    maxDate,
    minYear = REPORT_MIN_YEAR,
    maxYear = REPORT_MAX_YEAR,
  } = options;

  if (!value || !String(value).trim()) {
    return { valid: false, message: "Date is required." };
  }

  const trimmed = String(value).trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return {
      valid: false,
      message: "Enter a valid date (YYYY-MM-DD).",
    };
  }

  const year = parseInt(trimmed.slice(0, 4), 10);
  if (year < minYear || year > maxYear) {
    return {
      valid: false,
      message: `Year must be between ${minYear} and ${maxYear}.`,
    };
  }

  const parsed = parseIsoDateString(trimmed);
  if (!parsed) {
    return {
      valid: false,
      message: "This date is not valid. Check the day and month.",
    };
  }

  if (minDate && trimmed < minDate) {
    return {
      valid: false,
      message: "Date cannot be in the past.",
    };
  }

  if (maxDate && trimmed > maxDate) {
    return {
      valid: false,
      message: "Date is too far in the future.",
    };
  }

  return { valid: true, message: "", date: parsed };
}

/** Israel today through +10 years (calendar strings, comparable as YYYY-MM-DD). */
export function getEventDateBounds() {
  const min = getIsraelLocalIsoDate();
  const { year, month, day } = getIsraelLocalDateParts();
  const maxYear = parseInt(year, 10) + 10;
  let max = `${maxYear}-${month}-${day}`;
  if (!parseIsoDateString(max)) {
    max = `${maxYear}-12-31`;
  }
  return { min, max };
}

/**
 * Booking / event date only — no generic year-range message.
 */
export function validateEventDate(value) {
  const trimmed = (value || "").trim();

  if (!trimmed) {
    return { valid: false, message: MSG_EVENT_REQUIRED };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { valid: false, message: MSG_EVENT_INVALID };
  }

  const parsed = parseIsoDateString(trimmed);
  if (!parsed) {
    return { valid: false, message: MSG_EVENT_INVALID };
  }

  const { min, max } = getEventDateBounds();

  if (trimmed < min) {
    return { valid: false, message: MSG_EVENT_PAST };
  }

  if (trimmed > max) {
    return { valid: false, message: MSG_EVENT_TOO_FAR };
  }

  return { valid: true, message: "", date: parsed };
}
