import React from "react";

/**
 * Plain text address input (no Google Maps / Places).
 */
const AddressAutoComplete = ({
  value = "",
  onChange,
  inputId = "signup-address",
  name = "street-address",
  placeholder = "Street Address, City",
  className = "form-input",
}) => (
  <input
    id={inputId}
    name={name}
    type="text"
    className={className}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    aria-label="Address"
    autoComplete="street-address"
  />
);

export default AddressAutoComplete;
