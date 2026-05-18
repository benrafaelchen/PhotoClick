const dbSingleton = require("../dbSingleton");

const getWorkStills = async (req, res) => {
  try {
    const results = await dbSingleton.promiseQuery(
      "SELECT FirstName, LastName, Personal_id FROM users WHERE RoleID = 3"
    );
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("getWorkStills error:", error.message);
    return res.status(500).json({ success: false, message: "Database error" });
  }
};

const getOrdersAtDate = async (req, res) => {
  const selectedDate = req.body.data;

  const ordersQuery = `
    SELECT 
      OrderNumber, EventName, EventPlace, TotalPrice, OrderDescription, Status,
      DATE_FORMAT(OrderDate, '%Y-%m-%d') AS OrderDate, OrderHour,
      DATE_FORMAT(DateOfEvent, '%Y-%m-%d') AS DateOfEvent, HourOfEvent, Email
    FROM orders
    WHERE DATE_FORMAT(DateOfEvent, '%Y-%m-%d') = ?
  `;

  try {
    const results = await dbSingleton.promiseQuery(ordersQuery, [selectedDate]);

    const orders = results.map((row) => ({
      orderNumber: row.OrderNumber,
      eventName: row.EventName,
      eventPlace: row.EventPlace,
      totalPrice: row.TotalPrice,
      orderDate: row.OrderDate,
      orderHour: row.OrderHour,
      dateOfEvent: row.DateOfEvent,
      hourOfEvent: row.HourOfEvent,
      email: row.Email,
      status: row.Status,
      orderDescription: row.OrderDescription,
    }));

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("getOrdersAtDate error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const rejectOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  try {
    const result = await dbSingleton.promiseQuery(
      "UPDATE orders SET Status = 'Rejected' WHERE OrderNumber = ?",
      [orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const rows = await dbSingleton.promiseQuery(
      "SELECT * FROM orders WHERE OrderNumber = ?",
      [orderId]
    );

    res.json({ success: true, order: rows[0] });
  } catch (error) {
    console.error("rejectOrder error:", error.message);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

const getAssignedOrders = async (req, res) => {
  const selectedDate = req.body.data;

  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT DISTINCT ow.OrderNumber
       FROM orders_workers ow
       JOIN orders o ON ow.OrderNumber = o.OrderNumber
       WHERE DATE_FORMAT(o.DateOfEvent, '%Y-%m-%d') = ?`,
      [selectedDate]
    );

    const assignedOrders = results.map((row) => row.OrderNumber);

    return res.status(200).json({
      success: true,
      data: assignedOrders,
      message: assignedOrders.length > 0 ? "Orders found" : "No assigned orders for this date",
    });
  } catch (error) {
    console.error("getAssignedOrders error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const getPrices = async (req, res) => {
  try {
    const results = await dbSingleton.promiseQuery(
      "SELECT ProductDescription, ProductPrice FROM products"
    );

    const prices = results.reduce((acc, row) => {
      acc[row.ProductDescription] = row.ProductPrice;
      return acc;
    }, {});

    return res.status(200).json({ success: true, data: prices });
  } catch (error) {
    console.error("getPrices error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const getTotalOrders = async (req, res) => {
  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT OrderNumber, EventName, EventPlace, TotalPrice,
        DATE_FORMAT(OrderDate, '%Y-%m-%d') AS OrderDate,
        DATE_FORMAT(OrderHour, '%H:%i:%s') AS OrderHour,
        DATE_FORMAT(DateOfEvent, '%Y-%m-%d') AS DateOfEvent,
        DATE_FORMAT(HourOfEvent, '%H:%i:%s') AS HourOfEvent,
        OrderDescription, Status, Email
      FROM orders`
    );

    const orders = results.map((row) => ({
      orderNumber: row.OrderNumber,
      eventName: row.EventName,
      eventPlace: row.EventPlace,
      totalPrice: row.TotalPrice,
      orderDate: row.OrderDate,
      orderHour: row.OrderHour,
      dateOfEvent: row.DateOfEvent,
      hourOfEvent: row.HourOfEvent,
      orderDescription: row.OrderDescription,
      email: row.Email,
      status: row.Status,
    }));

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("getTotalOrders error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const getEventTypes = async (req, res) => {
  try {
    const results = await dbSingleton.promiseQuery("SELECT EventName FROM eventkind");
    const eventTypes = results.map((row) => row.EventName);
    return res.status(200).json({ success: true, data: eventTypes });
  } catch (error) {
    console.error("getEventTypes error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const getPackStyles = async (req, res) => {
  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT SerialPack, PackDescription, PricePack, PackName,
        SteelsPhotographers, VideoPhotographers,
        Albums30X80, Albums40X60, Magnets10X12, Magnets20X24,
        Canvas50X70, Canvas60X90
      FROM packs`
    );

    const discountMap = { 201: 0.05, 202: 0.1, 203: 0.15 };

    const packStyles = {
      custom: {
        basePrice: 0, discount: 0,
        name: "Custom (No Discount)",
        description: "Choose Your Own Products (No Discount)",
        included: {},
      },
    };

    results.forEach((row) => {
      const key = row.PackName.toLowerCase().split(" ")[0];
      packStyles[key] = {
        basePrice: parseFloat(row.PricePack),
        discount: discountMap[row.SerialPack] || 0,
        name: `${row.PackName} = ${row.PricePack.toFixed(2)}\u20AA + ${(
          (discountMap[row.SerialPack] || 0) * 100
        ).toFixed(0)}% Discount`,
        description: row.PackDescription,
        included: {
          ...(row.SteelsPhotographers && { stills: row.SteelsPhotographers }),
          ...(row.VideoPhotographers && { video: row.VideoPhotographers }),
          ...(row.Albums30X80 && { album30x80: row.Albums30X80 }),
          ...(row.Albums40X60 && { album40x60: row.Albums40X60 }),
          ...(row.Magnets10X12 && { magnets10x12: row.Magnets10X12 }),
          ...(row.Magnets20X24 && { magnets20x24: row.Magnets20X24 }),
          ...(row.Canvas50X70 && { canvas50x70: row.Canvas50X70 }),
          ...(row.Canvas60X90 && { canvas60x90: row.Canvas60X90 }),
        },
      };
    });

    return res.status(200).json({ success: true, data: packStyles });
  } catch (error) {
    console.error("getPackStyles error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const approveOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  try {
    const result = await dbSingleton.promiseQuery(
      "UPDATE orders SET Status = 'Approved' WHERE OrderNumber = ?",
      [orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order approved" });
  } catch (error) {
    console.error("approveOrder error:", error.message);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

module.exports = {
  getOrdersAtDate, getTotalOrders, getPrices, getEventTypes,
  getPackStyles, getWorkStills, getAssignedOrders, rejectOrder, approveOrder,
};
