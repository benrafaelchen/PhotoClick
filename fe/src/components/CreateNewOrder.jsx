import React, { useState, useEffect } from "react";
import "../assets/styles/CreateNewOrder.css";
import PlacesAutoComplete from "./PlacesAutoComplete";

const CreateNewOrder = () => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [place, setPlace] = useState({});
  const [formInputs, setFormInputs] = useState({
    eventType: "",
    packStyle: "",
    eventDate: "",
    eventTime: "",
  });
  const [quantities, setQuantities] = useState({
    stills: 0,
    video: 0,
    album30x80: 0,
    album40x60: 0,
    magnets10x12: 0,
    magnets20x24: 0,
    canvas50x70: 0,
    canvas60x90: 0,
  });

  const [clearInput, setClearInput] = useState(false);

  const prices = {
    stills: 800,
    video: 1200,
    album30x80: 250,
    album40x60: 300,
    magnets10x12: 1,
    magnets20x24: 2,
    canvas50x70: 350,
    canvas60x90: 400,
  };

  const eventTypes = [
    "Wedding Party",
    "Henna Party",
    "Save The Date",
    "Bar Mitzvah Party",
    "Bat Mitzvah Party",
    "Birth Daughter Party",
    "Birth Son Party",
    "Birthday Party",
  ];

  const packStyles = {
    custom: {
      basePrice: 0,
      discount: 0,
      name: "Custom (No Discount)",
      description: "Choose Your Own Products (No Discount)",
    },
    bronze: {
      basePrice: 3000,
      discount: 0.05,
      name: "Bronze Simply = 3000.00₪ + 5% Discount",
      description:
        "Includes: 1 Stills Photographer, 1 Video Photographer, 2 Albums 30X80 CM, 500 Magnets 10X12.",
      included: {
        stills: 1,
        video: 1,
        album30x80: 2,
        magnets10x12: 500,
      },
    },
    silver: {
      basePrice: 4950,
      discount: 0.1,
      name: "Silver Plus = 4950.00₪ + 10% Discount",
      description:
        "Includes: 2 Stills Photographers, 1 Video Photographer, 2 Albums 30X80 CM, 1 Album 40X60, 1000 Magnets 10X12 CM, 1 Canvas 50X70.",
      included: {
        stills: 2,
        video: 1,
        album30x80: 2,
        album40x60: 1,
        magnets10x12: 1000,
        canvas50x70: 1,
      },
    },
    gold: {
      basePrice: 9250,
      discount: 0.15,
      name: "Gold Premium = 9250.00₪ + 15% Discount",
      description:
        "Includes: 3 Stills Photographers, 2 Video Photographers, 3 Albums 30X80, 2 Albums 40X60 CM, 1000 Magnets 10X12, 500 Magnets 20X24, 2 Canvas 50X70, 1 Canvas 60X90 CM.",
      included: {
        stills: 3,
        video: 2,
        album30x80: 3,
        album40x60: 2,
        magnets10x12: 1000,
        magnets20x24: 500,
        canvas50x70: 2,
        canvas60x90: 1,
      },
    },
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [formInputs.packStyle, quantities]);

  const calculateTotalPrice = () => {
    const packStyle = packStyles[formInputs.packStyle] || packStyles.custom;
    const additionalProductsPrice = Object.keys(quantities).reduce(
      (total, product) => total + quantities[product] * prices[product],
      0
    );

    const discount = packStyle.basePrice * packStyle.discount;
    const finalPrice = packStyle.basePrice - discount + additionalProductsPrice;

    setTotalPrice(finalPrice);
  };

  const handleQuantityChange = (product, amount) => {
    setQuantities((prevQuantities) => {
      const newQuantity = Math.max(prevQuantities[product] + amount, 0);
      const priceDifference =
        (newQuantity - prevQuantities[product]) * prices[product];
      setTotalPrice((prevTotal) => prevTotal + priceDifference);
      return { ...prevQuantities, [product]: newQuantity };
    });
  };

  const handlePlaceSelect = (selectedPlace) => {
    setPlace(selectedPlace);
    console.log("Selected place:", selectedPlace);
  };

  const handleInputChange = (product, value) => {
    const newQuantity = Math.max(parseInt(value) || 0, 0);
    const priceDifference =
      (newQuantity - quantities[product]) * prices[product];
    setTotalPrice((prevTotal) => prevTotal + priceDifference);
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [product]: newQuantity,
    }));
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleClearProducts = () => {
    setQuantities({
      stills: 0,
      video: 0,
      album30x80: 0,
      album40x60: 0,
      magnets10x12: 0,
      magnets20x24: 0,
      canvas50x70: 0,
      canvas60x90: 0,
    });
    setTotalPrice(0);
  };

  const handleClearAll = () => {
    handleClearProducts();
    setFormInputs({
      eventType: "",
      packStyle: "custom",
      eventDate: "",
      eventTime: "",
    });
    setPlace({});
    setClearInput(true);
    setTimeout(() => setClearInput(false), 100);
  };

  const handleSubmit = async () => {
    const orderDetails = {
      eventType: formInputs.eventType,
      packStyle: formInputs.packStyle,
      eventDate: formInputs.eventDate,
      eventTime: formInputs.eventTime,
      place,
      quantities,
      email: localStorage.getItem("userEmail"), // Get the email from localStorage
    };

    try {
      const response = await fetch("http://localhost:8801/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });
      console.log(orderDetails);

      const data = await response.json();

      if (response.ok) {
        alert("Order created successfully!");
      } else {
        alert(`Error creating order: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    }
  };

  return (
    <div className="create-new-order">
      <div className="form-content">
        <div className="products-to-add">
          <h3>Products To Add</h3>
          {Object.keys(prices).map((product) => (
            <div className="product-item" key={product}>
              <label>
                {product.charAt(0).toUpperCase() + product.slice(1)} ={" "}
                {prices[product].toFixed(2)}₪
              </label>
              <div className="quantity-controls">
                <button onClick={() => handleQuantityChange(product, -1)}>
                  -
                </button>
                <input
                  type="number"
                  value={quantities[product]}
                  onChange={(e) => handleInputChange(product, e.target.value)}
                />
                <button onClick={() => handleQuantityChange(product, 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="button-group">
            <button
              type="button"
              className="button clear"
              onClick={handleClearProducts}
            >
              Clear Products
            </button>
            <button
              type="button"
              className="button clear"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
          {formInputs.packStyle !== "" && (
            <p className="pack-description">
              {packStyles[formInputs.packStyle]?.description ||
                packStyles.custom.description}
            </p>
          )}
        </div>
        <div className="order-details">
          <h3>Event Details</h3>
          <select
            id="eventType"
            name="eventType"
            className="input"
            value={formInputs.eventType}
            onChange={handleFormInputChange}
            required
          >
            <option value="" disabled>
              Select Event Type
            </option>
            {eventTypes.map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventType}
              </option>
            ))}
          </select>
          <select
            id="packStyle"
            name="packStyle"
            className="input"
            value={formInputs.packStyle}
            onChange={handleFormInputChange}
            required
          >
            <option value="" disabled>
              Select Pack Style
            </option>
            {Object.entries(packStyles).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
          <PlacesAutoComplete
            onSelect={handlePlaceSelect}
            clearInput={clearInput}
          />
          <input
            type="date"
            placeholder="Date of Event"
            name="eventDate"
            value={formInputs.eventDate}
            onChange={handleFormInputChange}
            className="input"
          />
          <input
            type="time"
            placeholder="Hour of Event"
            name="eventTime"
            value={formInputs.eventTime}
            onChange={handleFormInputChange}
            className="input"
          />
          <div className="total-price">
            <h4>Total Price: {totalPrice.toFixed(2)} ₪</h4>
          </div>
          <button
            type="button"
            className="button submit"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <p className="tax-info">* Total Price Includes 17% Tax Fee</p>
        </div>
      </div>
    </div>
  );
};

export default CreateNewOrder;
