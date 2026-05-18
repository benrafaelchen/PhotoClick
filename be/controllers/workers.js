const dbSingleton = require("../dbSingleton");
const { sendAssignmentEmailToWorker } = require("./user");

const getAvailableWorkers = async (req, res) => {
  const dateOfEvent = req.body.data;

  if (!dateOfEvent) {
    return res.status(400).json({ message: "Event date is required" });
  }

  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT DISTINCT u.Personal_id, u.FirstName, u.LastName, u.RoleName, u.PhoneNumber, u.RoleID
       FROM users u
       LEFT JOIN orders_workers ow ON u.Personal_id = ow.Personal_id
       LEFT JOIN orders o ON ow.OrderNumber = o.OrderNumber
       WHERE (DATE_FORMAT(o.DateOfEvent, '%Y-%m-%d') != ? OR o.DateOfEvent IS NULL)
         AND u.RoleID NOT IN (1, 2)`,
      [dateOfEvent]
    );

    const workers = results.map((row) => ({
      personalId: row.Personal_id,
      firstName: row.FirstName,
      lastName: row.LastName,
      roleName: row.RoleName,
      phoneNumber: row.PhoneNumber,
      roleId: row.RoleID,
    }));

    return res.status(200).json({ success: true, data: workers });
  } catch (error) {
    console.error("getAvailableWorkers error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const getCustomers = async (req, res) => {
  try {
    const result = await dbSingleton.promiseQuery(
      "SELECT FirstName, LastName, PhoneNumber, Personal_id, Email, StreetAddress FROM users WHERE RoleID = 2"
    );
    res.json(result);
  } catch (err) {
    console.error("Error fetching customers:", err.message);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

const getWorkers = async (req, res) => {
  try {
    const result = await dbSingleton.promiseQuery(
      "SELECT FirstName, LastName, PhoneNumber, Personal_id, Email, StreetAddress FROM users WHERE RoleID IN (3, 4)"
    );
    res.json(result);
  } catch (err) {
    console.error("Error fetching workers:", err.message);
    res.status(500).json({ error: "Failed to fetch workers" });
  }
};

const getWorkersWhoServesOrder = async (req, res) => {
  const orderId = req.body.data;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT u.FirstName, u.LastName, u.PhoneNumber
       FROM users AS u
       JOIN orders_workers AS ow ON u.Personal_id = ow.Personal_id
       WHERE ow.OrderNumber = ?`,
      [orderId]
    );

    const workers = results.map((row) => ({
      firstName: row.FirstName,
      lastName: row.LastName,
      phoneNumber: row.PhoneNumber,
    }));

    return res.status(200).json({ success: true, data: workers });
  } catch (error) {
    console.error("getWorkersWhoServesOrder error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const assignWorkers = async (req, res) => {
  const { orderId, workers } = req.body;

  if (!orderId || !workers || !Array.isArray(workers) || workers.length === 0) {
    return res.status(400).json({ message: "Invalid orderId or workers list" });
  }

  const values = workers.map((worker) => [orderId, worker.personalId]);

  try {
    await dbSingleton.promiseQuery(
      "INSERT INTO orders_workers (OrderNumber, Personal_id) VALUES ?",
      [values]
    );

    try {
      const [order] = await dbSingleton.promiseQuery(
        "SELECT EventName, EventPlace, DateOfEvent, HourOfEvent FROM orders WHERE OrderNumber = ?",
        [orderId]
      );

      const workersData = await dbSingleton.promiseQuery(
        "SELECT FirstName, Email FROM users WHERE Personal_id IN (?)",
        [workers.map((w) => w.personalId)]
      );

      for (const worker of workersData) {
        await sendAssignmentEmailToWorker(worker, order);
      }
    } catch (mailErr) {
      console.error("Assignment email failed (non-blocking):", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `${workers.length} worker(s) assigned successfully`,
      data: workers,
    });
  } catch (error) {
    console.error("assignWorkers error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const getAssignedWorkersForAssignedOrders = async (req, res) => {
  const { ordersList } = req.body;

  if (!ordersList || !Array.isArray(ordersList) || ordersList.length === 0) {
    return res.status(400).json({ message: "Invalid or empty orders list" });
  }

  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT DISTINCT u.Personal_id, u.FirstName, u.LastName, u.PhoneNumber, u.RoleName, ow.OrderNumber
       FROM orders_workers ow
       JOIN users u ON ow.Personal_id = u.Personal_id
       WHERE ow.OrderNumber IN (?)`,
      [ordersList]
    );

    const assignedWorkers = results.map((worker) => ({
      personalId: worker.Personal_id,
      firstName: worker.FirstName,
      lastName: worker.LastName,
      phoneNumber: worker.PhoneNumber,
      roleName: worker.RoleName,
      orderNumber: worker.OrderNumber,
    }));

    return res.status(200).json({ success: true, data: assignedWorkers });
  } catch (error) {
    console.error("getAssignedWorkersForAssignedOrders error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

const getOrdersForWorker = async (req, res) => {
  // Only allow fetching own orders (IDOR protection)
  const userId = req.user.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT DISTINCT o.OrderNumber, o.EventName, o.EventPlace, o.TotalPrice, o.Status,
        DATE_FORMAT(o.OrderDate, '%Y-%m-%d') AS OrderDate, o.OrderHour,
        DATE_FORMAT(o.DateOfEvent, '%Y-%m-%d') AS DateOfEvent, o.HourOfEvent
       FROM orders_workers ow
       JOIN orders o ON ow.OrderNumber = o.OrderNumber
       WHERE ow.Personal_id = ?`,
      [userId]
    );

    const orders = results.map((row) => ({
      orderNumber: row.OrderNumber,
      eventName: row.EventName,
      eventPlace: row.EventPlace,
      totalPrice: row.TotalPrice,
      status: row.Status || "Approved",
      orderDate: row.OrderDate,
      orderHour: row.OrderHour,
      dateOfEvent: row.DateOfEvent,
      hourOfEvent: row.HourOfEvent,
    }));

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("getOrdersForWorker error:", error.message);
    return res.status(500).json({ message: "Database error" });
  }
};

module.exports = {
  getAvailableWorkers, getWorkersWhoServesOrder, assignWorkers,
  getAssignedWorkersForAssignedOrders, getOrdersForWorker,
  getWorkers, getCustomers,
};
