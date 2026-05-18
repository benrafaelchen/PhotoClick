// CreateNewOrder.jsx
/** The CreateNewOrder page lets users create a new event order by selecting event details, a package, and optional add-ons. It calculates the total price automatically and submits the order to the server. */
import React, { useState, useEffect, useCallback, useRef } from "react";
import "../assets/styles/CreateNewOrder.css";
import { apiGet, apiPost, getUserInfo } from "../utils/api";
import {
  validateEventDate,
  getEventDateBounds,
  getIsraelLocalIsoDate,
  sanitizeDateInput,
} from "../utils/dateValidation";

const packSerialMap = {
  bronze: 201,
  silver: 202,
  gold: 203,
  custom: 0,
};

const BOOKING_SUCCESS_MESSAGE =
  "Your booking request was submitted successfully and is now pending approval.";

const CreateNewOrder = () => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [eventLocation, setEventLocation] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [prices, setPrices] = useState({});
  const [packStyles, setPackStyles] = useState({});
  const [formInputs, setFormInputs] = useState({
    eventType: "",
    packStyle: "",
    eventDate: "",
    eventTime: "",
  });
  const [quantities, setQuantities] = useState({});
  const [dynamicDescription, setDynamicDescription] = useState("");
  const [baseDescription, setBaseDescription] = useState("");
  const [additionalIncludes, setAdditionalIncludes] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusVariant, setStatusVariant] = useState("error");
  const [dateError, setDateError] = useState("");

  const [photographerOriginalLimits, setPhotographerOriginalLimits] = useState(
    {}
  );
  const [photographerAvailableLimits, setPhotographerAvailableLimits] =
    useState({});

  const messageRef = useRef(null);
  const eventTypeRef = useRef(null);
  const packStyleRef = useRef(null);
  const eventDateRef = useRef(null);
  const eventTimeRef = useRef(null);

  const parseIncludedPhotographers = (description) => {
    const result = { "Photographer-Stills": 0, "Photographer-Video": 0 };
    if (!description) return result;
    const stillsMatch = description.match(/(\d+)\s*Photographers?\s*Stills/i);
    const videoMatch = description.match(/(\d+)\s*Photographers?\s*Video/i);
    if (stillsMatch)
      result["Photographer-Stills"] = parseInt(stillsMatch[1], 10);
    if (videoMatch) result["Photographer-Video"] = parseInt(videoMatch[1], 10);
    return result;
  };

  const computeAvailableLimits = useCallback(
    (originalLimits, packStyleKey) => {
      if (!packStyleKey || !packStyles[packStyleKey]) {
        return { ...originalLimits };
      }
      const description = packStyles[packStyleKey].description || "";
      const includedPhotographers = parseIncludedPhotographers(description);
      const updated = { ...originalLimits };
      Object.keys(includedPhotographers).forEach((roleName) => {
        if (updated[roleName] !== undefined) {
          updated[roleName] = Math.max(
            updated[roleName] - includedPhotographers[roleName],
            0
          );
        }
      });
      return updated;
    },
    [packStyles]
  );

  const calculateTotalPrice = useCallback(() => {
    if (!formInputs.packStyle || !packStyles[formInputs.packStyle]) return 0;

    const pack = packStyles[formInputs.packStyle];
    const basePrice = Number(pack.basePrice || 0);

    const additionalCost = Object.keys(quantities).reduce(
      (total, product) =>
        total + (quantities[product] || 0) * (prices[product] || 0),
      0
    );

    let total = basePrice + additionalCost;

    if (pack.discount) total = total * (1 - Number(pack.discount));
    if (total < 0) total = 0;

    return total;
  }, [formInputs.packStyle, packStyles, quantities, prices]);

  const updateDescription = useCallback(
    (baseDescriptionText) => {
      setBaseDescription(baseDescriptionText);

      let additionalDescription = "";
      const updatedDescription = Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([product, quantity]) => `${quantity} ${product}`)
        .join(", ");

      if (updatedDescription)
        additionalDescription = `Additional Includes: ${updatedDescription}.`;

      setAdditionalIncludes(additionalDescription);
      setDynamicDescription(
        `${baseDescriptionText} ${additionalDescription}`.trim()
      );
    },
    [quantities]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [pricesRes, typesRes, packsRes] = await Promise.all([
          apiGet("/getPrices"),
          apiGet("/getEventTypes"),
          apiGet("/getPackStyles"),
        ]);
        if (cancelled) return;
        if (pricesRes.success) setPrices(pricesRes.data);
        if (typesRes.success) setEventTypes(typesRes.data);
        if (packsRes.success) setPackStyles(packsRes.data);
      } catch (error) {
        console.error("Error loading order form data:", error);
        if (!cancelled) {
          setStatusVariant("error");
          setStatusMessage(
            error.message || "Could not load form data. Please refresh."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const endpoint = formInputs.eventDate
          ? `/getPhotographerLimits?eventDate=${encodeURIComponent(
              formInputs.eventDate
            )}`
          : "/getPhotographerLimits";
        const data = await apiGet(endpoint);
        if (cancelled || !data.success || !data.caps) return;
        const original = {
          "Photographer-Stills": data.caps.maxStills ?? 0,
          "Photographer-Video": data.caps.maxVideo ?? 0,
        };
        setPhotographerOriginalLimits(original);
      } catch (error) {
        console.error("Error fetching photographer limits:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formInputs.eventDate]);

  useEffect(() => {
    if (
      photographerOriginalLimits["Photographer-Stills"] === undefined &&
      photographerOriginalLimits["Photographer-Video"] === undefined
    ) {
      return;
    }
    setPhotographerAvailableLimits(
      computeAvailableLimits(
        photographerOriginalLimits,
        formInputs.packStyle
      )
    );
  }, [
    photographerOriginalLimits,
    formInputs.packStyle,
    computeAvailableLimits,
  ]);

  useEffect(() => {
    if (!formInputs.packStyle || loading || !packStyles[formInputs.packStyle]) {
      setTotalPrice(0);
      setBaseDescription("");
      setAdditionalIncludes("");
      setDynamicDescription("");
      return;
    }

    const total = calculateTotalPrice();
    setTotalPrice(total);
    updateDescription(packStyles[formInputs.packStyle]?.description || "");
  }, [
    formInputs.packStyle,
    quantities,
    prices,
    packStyles,
    loading,
    calculateTotalPrice,
    updateDescription,
  ]);

  const showTimedMessage = (message, variant, ms) => {
    setStatusVariant(variant);
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(""), ms);
  };

  const handleQuantityChange = (product, value) => {
    if (!formInputs.packStyle) {
      showTimedMessage(
        "Please select a package before adding products.",
        "error",
        4000
      );
      return;
    }

    const numericValue = Math.max(parseInt(value, 10) || 0, 0);

    const isStills = product.toLowerCase().includes("stills");
    const isVideo = product.toLowerCase().includes("video");

    let roleName = null;
    if (isStills) roleName = "Photographer-Stills";
    else if (isVideo) roleName = "Photographer-Video";

    if (roleName) {
      const totalCurrentlyAddedOfRole = Object.entries(quantities)
        .filter(([p]) => {
          const pl = p.toLowerCase();
          if (isStills) return pl.includes("stills");
          if (isVideo) return pl.includes("video");
          return false;
        })
        .reduce((acc, [p, q]) => acc + (p === product ? 0 : q || 0), 0);

      const originalAvailable = photographerAvailableLimits[roleName] ?? 0;
      const allowedMax = Math.max(
        originalAvailable - totalCurrentlyAddedOfRole,
        0
      );

      if (numericValue > allowedMax) {
        showTimedMessage(
          `You can’t add ${numericValue} ${product}. Available ${
            isStills ? "stills" : "video"
          } photographers left: ${allowedMax}.`,
          "error",
          4000
        );
        return;
      }
    }

    setQuantities((prev) => ({ ...prev, [product]: numericValue }));
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "eventDate") {
      const sanitized = sanitizeDateInput(value);
      if (!sanitized) {
        setDateError("");
        setFormInputs((prev) => ({ ...prev, eventDate: "" }));
        return;
      }
      const check = validateEventDate(sanitized);
      if (!check.valid) {
        setDateError(check.message);
        setFormInputs((prev) => ({ ...prev, eventDate: sanitized }));
        return;
      }
      setDateError("");
      setFormInputs((prev) => ({ ...prev, eventDate: sanitized }));
      return;
    }

    if (name === "eventTime") {
      const todayIsrael = getIsraelLocalIsoDate();
      const selectedDate = new Date(formInputs.eventDate + "T" + value);
      if (formInputs.eventDate === todayIsrael && selectedDate < new Date()) {
        showTimedMessage(
          "You cannot select a time that has already passed.",
          "error",
          4000
        );
        return;
      }
    }

    setFormInputs((prev) => ({ ...prev, [name]: value }));

    if (name === "packStyle" && value && packStyles[value]) {
      setQuantities({});
    }
  };

  const handleClearProducts = () => {
    setQuantities({});
  };

  const handleClearAll = ({ keepStatusMessage = false } = {}) => {
    handleClearProducts();
    setFormInputs({
      eventType: "",
      packStyle: "",
      eventDate: "",
      eventTime: "",
    });
    setEventLocation("");
    setDateError("");
    setDynamicDescription("");
    setPhotographerAvailableLimits(photographerOriginalLimits);
    if (!keepStatusMessage) setStatusMessage("");
  };

  const validateEventDateTime = () => {
    const dateCheck = validateEventDate(formInputs.eventDate);
    if (!dateCheck.valid) {
      setDateError(dateCheck.message);
      showTimedMessage(dateCheck.message, "error", 5000);
      eventDateRef.current?.focus();
      return false;
    }
    setDateError("");

    if (!formInputs.eventTime) {
      showTimedMessage("Please select an event time.", "error", 4000);
      eventTimeRef.current?.focus();
      return false;
    }

    const eventStart = new Date(
      `${formInputs.eventDate}T${formInputs.eventTime}`
    );
    const now = new Date();
    if (Number.isNaN(eventStart.getTime()) || eventStart <= now) {
      showTimedMessage(
        "Event date and time must be in the future.",
        "error",
        5000
      );
      eventDateRef.current?.focus();
      return false;
    }
    return true;
  };

  const focusFirstMissing = (missingFields) => {
    const order = [
      { label: "Event type", ref: eventTypeRef },
      { label: "Package style", ref: packStyleRef },
      { label: "Event date", ref: eventDateRef },
      { label: "Event time", ref: eventTimeRef },
    ];
    for (const { label, ref } of order) {
      if (missingFields.includes(label)) {
        ref.current?.focus();
        return;
      }
    }
    if (missingFields.includes("Event location")) {
      document.querySelector('input[name="event-location"]')?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dynamicDesc =
      `${baseDescription} ${additionalIncludes}`.trim() || dynamicDescription;
    if (!dynamicDesc && !formInputs.packStyle) {
      showTimedMessage("Select a package to build an order description.", "error", 5000);
      packStyleRef.current?.focus();
      return;
    }
    if (!dynamicDesc) {
      showTimedMessage("Dynamic description is missing.", "error", 5000);
      return;
    }

    const missingFields = [];
    if (!formInputs.eventType) missingFields.push("Event type");
    if (!formInputs.packStyle) missingFields.push("Package style");
    if (!formInputs.eventDate) missingFields.push("Event date");
    if (!formInputs.eventTime) missingFields.push("Event time");
    if (!eventLocation.trim()) missingFields.push("Event location");

    if (missingFields.length > 0) {
      setStatusVariant("error");
      setStatusMessage(
        `Please fill out the following required fields: ${missingFields.join(
          ", "
        )}.`
      );
      focusFirstMissing(missingFields);
      setTimeout(() => setStatusMessage(""), 6000);
      return;
    }

    if (!validateEventDateTime()) return;

    const email = getUserInfo().email;
    if (!email) {
      showTimedMessage(
        "You must be signed in with a valid email to create an order.",
        "error",
        5000
      );
      return;
    }

    setStatusMessage("");

    const orderDetails = {
      ...formInputs,
      serialPack: packSerialMap[formInputs.packStyle] ?? 0,
      eventPrice: totalPrice,
      place: { name: eventLocation.trim() },
      quantities,
      email,
      dynamicDescription: dynamicDesc,
    };

    try {
      const data = await apiPost("/createOrder", orderDetails);

      if (data?.success === false) {
        throw new Error(
          data.message || "An error occurred while creating the order."
        );
      }

      handleClearAll({ keepStatusMessage: true });
      setStatusVariant("success");
      setStatusMessage(BOOKING_SUCCESS_MESSAGE);

      requestAnimationFrame(() => {
        messageRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        messageRef.current?.focus();
      });
      setTimeout(() => setStatusMessage(""), 6000);
    } catch (error) {
      console.error("Error creating order:", error);
      setStatusVariant("error");
      setStatusMessage(error.message || "An error occurred while creating the order.");
      messageRef.current?.focus();
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  const { min: minEventDate, max: maxEventDate } = getEventDateBounds();
  const todayStr = minEventDate;
  const timeMin =
    formInputs.eventDate === todayStr
      ? new Date().toTimeString().slice(0, 5)
      : "00:00";

  if (loading) {
    return (
      <div className="create-new-order" aria-busy="true">
        <div className="loading-center">
          <div className="spinner spinner-lg" aria-hidden="true" />
          <p>Loading order form…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-new-order">
      {statusMessage ? (
        <div
          ref={messageRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className={`create-new-order__message ${
            statusVariant === "success"
              ? "create-new-order__message--success"
              : "create-new-order__message--error"
          }`}
        >
          {statusMessage}
        </div>
      ) : null}

      <form
        className="create-new-order__grid"
        onSubmit={handleSubmit}
        noValidate
      >
        <section className="card" aria-labelledby="create-order-event-heading">
          <h2 id="create-order-event-heading" className="create-new-order__card-title">
            Event Details
          </h2>

          <div className="form-group">
            <label className="form-label" htmlFor="create-order-event-type">
              Event type <span className="create-new-order__sr-only">(required)</span>
            </label>
            <select
              ref={eventTypeRef}
              id="create-order-event-type"
              name="eventType"
              className="form-select"
              value={formInputs.eventType}
              onChange={handleFormInputChange}
              aria-required="true"
              required
            >
              <option value="" disabled>
                Select event type
              </option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="create-order-pack-style">
              Package style <span className="create-new-order__sr-only">(required)</span>
            </label>
            <select
              ref={packStyleRef}
              id="create-order-pack-style"
              name="packStyle"
              className="form-select"
              value={formInputs.packStyle}
              onChange={handleFormInputChange}
              aria-required="true"
              required
            >
              <option value="" disabled>
                Select pack style
              </option>
              {Object.keys(packStyles).map((key) => (
                <option key={key} value={key}>
                  {packStyles[key].name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-group event-location-field"
            role="group"
            aria-labelledby="create-order-location-label"
          >
            <label
              id="create-order-location-label"
              className="form-label"
              htmlFor="event-location"
            >
              Event location <span aria-hidden="true">*</span>
            </label>
            <input
              id="event-location"
              name="event-location"
              type="text"
              className="form-input"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Enter event location (venue or address)"
              aria-required="true"
              autoComplete="street-address"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="create-order-event-date">
              Event date <span className="create-new-order__sr-only">(required)</span>
            </label>
            <input
              ref={eventDateRef}
              id="create-order-event-date"
              type="date"
              name="eventDate"
              className={`form-input${dateError ? " input-error" : ""}`}
              value={formInputs.eventDate}
              onChange={handleFormInputChange}
              min={minEventDate}
              max={maxEventDate}
              aria-required="true"
              aria-invalid={dateError ? "true" : "false"}
              aria-describedby={dateError ? "create-order-date-error" : undefined}
              required
            />
            {dateError && (
              <span id="create-order-date-error" className="form-error" role="alert">
                {dateError}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="create-order-event-time">
              Event time <span className="create-new-order__sr-only">(required)</span>
            </label>
            <input
              ref={eventTimeRef}
              id="create-order-event-time"
              type="time"
              name="eventTime"
              className="form-input"
              value={formInputs.eventTime}
              onChange={handleFormInputChange}
              min={timeMin}
              aria-required="true"
              required
            />
          </div>

          <div
            className="create-new-order__total"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="create-new-order__total-label">Total price</span>
            <span className="create-new-order__total-amount">
              {totalPrice.toFixed(2)}₪
            </span>
          </div>

          <div className="create-new-order__actions create-new-order__actions--row">
            <button type="submit" className="btn btn-primary btn-block">
              Submit order
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={handleClearProducts}
              disabled={!formInputs.packStyle}
            >
              Clear products
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={handleClearAll}
            >
              Clear all
            </button>
          </div>
        </section>

        <section className="card" aria-labelledby="create-order-products-heading">
          <h2 id="create-order-products-heading" className="create-new-order__card-title">
            Products
          </h2>
          {Object.keys(prices).length === 0 ? (
            <div className="empty-state" role="status">
              <p className="empty-state-text">No add-on products available.</p>
            </div>
          ) : (
            Object.keys(prices).map((product) => {
              const isStills = product.toLowerCase().includes("stills");
              const isVideo = product.toLowerCase().includes("video");
              const maxLimit = isStills
                ? photographerAvailableLimits["Photographer-Stills"]
                : isVideo
                  ? photographerAvailableLimits["Photographer-Video"]
                  : null;

              const qty = quantities[product] || 0;
              const unitPrice = Number(prices[product] || 0);

              return (
                <div className="create-new-order__product-row" key={product}>
                  <div>
                    <span className="form-label" style={{ marginBottom: 0 }}>
                      {product}
                    </span>{" "}
                    <span className="badge badge-pending">
                      {unitPrice.toFixed(2)}₪
                    </span>
                    {maxLimit !== null ? (
                      <span className="create-new-order__sr-only">
                        {" "}
                        Up to {maxLimit} available for this role after package
                        includes.
                      </span>
                    ) : null}
                  </div>
                  <div
                    className="create-new-order__quantity-controls"
                    role="group"
                    aria-label={`Quantity for ${product}`}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm btn-qty"
                      onClick={() => handleQuantityChange(product, qty - 1)}
                      disabled={!formInputs.packStyle || qty <= 0}
                      aria-label={`Decrease ${product} quantity`}
                    >
                      −
                    </button>
                    <span className="create-new-order__qty-value" aria-live="polite">
                      {qty}
                      {maxLimit !== null ? ` / ${maxLimit}` : ""}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm btn-qty"
                      onClick={() => handleQuantityChange(product, qty + 1)}
                      disabled={!formInputs.packStyle}
                      aria-label={`Increase ${product} quantity`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section
          className="card"
          aria-labelledby="create-order-description-heading"
        >
          <h2
            id="create-order-description-heading"
            className="create-new-order__card-title"
          >
            Package description
          </h2>
          <div
            className="create-new-order__package-text"
            role="region"
            aria-label="Package and add-on summary"
          >
            {formInputs.packStyle
              ? `${packStyles[formInputs.packStyle].name}: ${baseDescription} ${additionalIncludes}`.trim()
              : Object.keys(packStyles)
                  .map(
                    (key, index) =>
                      `${index + 1}. ${packStyles[key].name}: ${packStyles[key].description}`
                  )
                  .join("\n\n")}
          </div>
        </section>
      </form>
    </div>
  );
};

export default CreateNewOrder;
