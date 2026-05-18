// controllers/reportsController.js
const dbSingleton = require("../dbSingleton");

function safeParseFloat(value) {
  if (value === null || value === undefined) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Revenue & Orders
 */
const getRevenue = async (req, res) => {
  const { fromDate, toDate } = req.body;
  if (!fromDate || !toDate)
    return res.status(400).json({ message: "Missing date range" });

  const query = `
    SELECT OrderNumber, TotalPrice, DATE_FORMAT(OrderDate, '%Y-%m-%d') AS OrderDate
    FROM orders 
    WHERE DATE(DateOfEvent) BETWEEN ? AND ?
  `;

  try {
    const results = await dbSingleton.promiseQuery(query, [fromDate, toDate]);

    let totalRevenue = results.reduce(
      (sum, order) => sum + safeParseFloat(order.TotalPrice),
      0
    );
    if (!Number.isFinite(totalRevenue)) {
      totalRevenue = 0;
    }

    res.json({
      totalRevenue: totalRevenue.toFixed(2),
      orders: results.map((r) => ({
        OrderNumber: r.OrderNumber,
        TotalPrice: safeParseFloat(r.TotalPrice).toFixed(2),
        OrderDate: r.OrderDate,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: "Database error" });
  }
};

/**
 * Customer Report
 */
const getCustomerReport = async (req, res) => {
  const { fromDate, toDate } = req.body;
  if (!fromDate || !toDate)
    return res.status(400).json({ message: "Missing date range" });

  const query = `
    SELECT 
      u.FirstName,
      u.LastName,
      u.Email,
      GROUP_CONCAT(o.OrderNumber ORDER BY o.OrderDate SEPARATOR ', ') AS orders_list,
      SUM(o.TotalPrice) AS total_expenses
    FROM orders o
    JOIN users u ON o.Email = u.Email
    WHERE DATE(o.DateOfEvent) BETWEEN ? AND ?
    GROUP BY o.Email
  `;

  try {
    const results = await dbSingleton.promiseQuery(query, [fromDate, toDate]);

    const customers = results.map((row) => ({
      name: `${row.FirstName} ${row.LastName}`,
      email: row.Email,
      orders_list: row.orders_list,
      total_expenses: safeParseFloat(row.total_expenses).toFixed(2),
    }));

    res.json({ customers });
  } catch (err) {
    return res.status(500).json({ message: "Database error" });
  }
};

/**
 * Worker / Photographer Report
 */
const getWorkerReport = async (req, res) => {
  const { fromDate, toDate } = req.body;
  if (!fromDate || !toDate)
    return res.status(400).json({ message: "Missing date range" });

  const query = `
    SELECT 
      u.FirstName,
      u.LastName,
      u.Email,
      u.RoleName,
      COUNT(DISTINCT ow.OrderNumber) AS event_count
    FROM orders_workers ow
    JOIN users u ON u.Personal_id = ow.Personal_id
    JOIN orders o ON o.OrderNumber = ow.OrderNumber
    WHERE DATE(o.DateOfEvent) BETWEEN ? AND ?
      AND u.RoleName LIKE '%Photographer%'
    GROUP BY u.Personal_id, u.FirstName, u.LastName, u.Email, u.RoleName
  `;

  try {
    const results = await dbSingleton.promiseQuery(query, [fromDate, toDate]);

    const workerReports = results.map((row) => {
      const roleName = row.RoleName ?? "";
      let stillsEarnings = roleName.includes("Stills")
        ? row.event_count * 400
        : 0;
      let videoEarnings = roleName.includes("Video")
        ? row.event_count * 700
        : 0;

      return {
        name: `${row.FirstName} ${row.LastName}`,
        email: row.Email,
        role: row.RoleName,
        event_count: row.event_count || 0,
        stills_earnings: stillsEarnings.toFixed(2),
        video_earnings: videoEarnings.toFixed(2),
      };
    });

    res.json({ workerReports });
  } catch (err) {
    return res.status(500).json({ message: "Database error" });
  }
};

/**
 * Get Expenses Report
 * Shows all products including those inside the packs
 */
const getExpenses = async (req, res) => {
  const { fromDate, toDate } = req.body;
  if (!fromDate || !toDate)
    return res.status(400).json({ message: "Missing date range" });

  const ordersQuery = `
    SELECT o.OrderNumber, o.SerialPack, o.OrderDescription,
           p.SteelsPhotographers, p.VideoPhotographers,
           p.Albums30X80, p.Albums40X60,
           p.Magnets10X12, p.Magnets20X24,
           p.Canvas50X70, p.Canvas60X90
    FROM orders o
    LEFT JOIN packs p ON o.SerialPack = p.SerialPack
    WHERE DATE(o.DateOfEvent) BETWEEN ? AND ?
  `;

  const productQuery = `SELECT ProductDescription, ProductPrice AS ClientPrice, (ProductPrice*0.75) AS WorkerCost FROM products`;

  let orders;
  try {
    orders = await dbSingleton.promiseQuery(ordersQuery, [fromDate, toDate]);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database error fetching orders" });
  }

  let products;
  try {
    products = await dbSingleton.promiseQuery(productQuery, []);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Database error fetching products" });
  }

  const productTotals = products.map((p) => ({
    product: p.ProductDescription,
    clientPrice: safeParseFloat(p.ClientPrice),
    workerCost: safeParseFloat(p.WorkerCost),
    quantity: 0,
    totalClientPrice: 0,
    totalWorkerCost: 0,
    managerProfit: 0,
    totalCost: 0,
  }));

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const order of orders) {
    for (const product of productTotals) {
      let qty = 0;

      const regex = new RegExp(
        `(\\d+)\\s+${escapeRegex(product.product)}`,
        "gi"
      );
      let match;
      while ((match = regex.exec(order.OrderDescription))) {
        const q = parseInt(match[1], 10);
        if (!isNaN(q)) qty += q;
      }

      switch (product.product) {
        case "Photographers Stills":
          qty += order.SteelsPhotographers || 0;
          break;
        case "Photographers Video":
          qty += order.VideoPhotographers || 0;
          break;
        case "Albums (30X80 CM)":
          qty += order.Albums30X80 || 0;
          break;
        case "Albums (40X60 CM)":
          qty += order.Albums40X60 || 0;
          break;
        case "Magnets (10X12 CM)":
          qty += order.Magnets10X12 || 0;
          break;
        case "Magnets (20X24 CM)":
          qty += order.Magnets20X24 || 0;
          break;
        case "Canvas (50X70 CM)":
          qty += order.Canvas50X70 || 0;
          break;
        case "Canvas (60X90 CM)":
          qty += order.Canvas60X90 || 0;
          break;
      }

      if (qty > 0) {
        const clientTotal = qty * product.clientPrice;
        const workerTotal = qty * product.workerCost;
        const profit = clientTotal - workerTotal;

        product.quantity += qty;
        product.totalClientPrice += clientTotal;
        product.totalWorkerCost += workerTotal;
        product.managerProfit += profit;
        product.totalCost += workerTotal;
      }
    }
  }

  res.json({
    totalClientPrice: productTotals.reduce(
      (sum, p) => sum + p.totalClientPrice,
      0
    ),
    totalWorkerCost: productTotals.reduce(
      (sum, p) => sum + p.totalWorkerCost,
      0
    ),
    totalProfit: productTotals.reduce((sum, p) => sum + p.managerProfit, 0),
    items: productTotals,
  });
};

/**
 * Order-level Report
 */
const getOrderReport = async (req, res) => {
  const { fromDate, toDate } = req.body;
  if (!fromDate || !toDate)
    return res.status(400).json({ message: "Missing date range" });

  const query = `
    SELECT 
      OrderNumber,
      EventName,
      EventPlace,
      TotalPrice,
      Email,
      DATE_FORMAT(OrderDate, '%Y-%m-%d') AS OrderDate,
      DATE_FORMAT(DateOfEvent, '%Y-%m-%d') AS EventDate
    FROM orders
    WHERE DATE(DateOfEvent) BETWEEN ? AND ?
    ORDER BY OrderDate DESC
  `;

  try {
    const results = await dbSingleton.promiseQuery(query, [fromDate, toDate]);

    const orderReports = results.map((r) => ({
      orderNumber: r.OrderNumber,
      eventName: r.EventName || "N/A",
      eventPlace: r.EventPlace || "N/A",
      totalPrice: safeParseFloat(r.TotalPrice).toFixed(2),
      email: r.Email || "N/A",
      orderDate: r.OrderDate || "N/A",
      eventDate: r.EventDate || "N/A",
    }));

    res.json({ orderReports });
  } catch (err) {
    return res.status(500).json({ message: "Database error" });
  }
};

/**
 * Get all event dates (for calendar highlighting)
 */
const getEventDates = async (req, res) => {
  const query = `
    SELECT DISTINCT DATE_FORMAT(DateOfEvent, '%Y-%m-%d') AS eventDate
    FROM orders
    WHERE DateOfEvent IS NOT NULL
    ORDER BY eventDate
  `;

  try {
    const results = await dbSingleton.promiseQuery(query, []);

    res.json({
      eventDates: results.map((r) => r.eventDate),
    });
  } catch (err) {
    return res.status(500).json({ message: "Database error" });
  }
};

module.exports = {
  getRevenue,
  getExpenses,
  getCustomerReport,
  getWorkerReport,
  getOrderReport,
  getEventDates,
};
