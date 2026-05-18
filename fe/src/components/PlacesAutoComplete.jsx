import React from "react";

/**
 * Plain text event location input (no Google Maps / Places).
 */
const PlacesAutoComplete = ({
  value = "",
  onChange,
  id = "event-location",
  name = "event-location",
  placeholder = "Enter event location (venue or address)",
  className = "form-input",
}) => (
  <input
    id={id}
    name={name}
    type="text"
    className={className}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    aria-label="Event location"
    autoComplete="street-address"
  />
);

export default PlacesAutoComplete;
