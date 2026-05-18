const dbSingleton = require("../dbSingleton");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { generateToken } = require("../middleware/auth");

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);
const BCRYPT_ROUNDS = 10;

const ROLE_MAP = {
  2: "Customer",
  3: "Photographer-Stills",
  4: "Photographer-Video",
};

const ALLOWED_SIGNUP_ROLES = [2, 3, 4];

async function verifyAndUpgradePassword(plainPassword, storedPassword, userEmail) {
  const isBcrypt = storedPassword && storedPassword.startsWith("$2");

  if (isBcrypt) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  if (plainPassword !== storedPassword) {
    return false;
  }

  try {
    const hash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
    await dbSingleton.promiseQuery(
      "UPDATE users SET Password = ? WHERE Email = ?",
      [hash, userEmail]
    );
  } catch (err) {
    console.error("Password upgrade failed (non-blocking):", err.message);
  }

  return true;
}

const getUser = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  if (!userEmail || !userPassword) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const userResults = await dbSingleton.promiseQuery(
      "SELECT * FROM users WHERE Email = ?",
      [userEmail]
    );

    if (userResults.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userResults[0];
    const passwordValid = await verifyAndUpgradePassword(
      userPassword,
      user.Password,
      userEmail
    );

    if (!passwordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      roleID: user.RoleID,
      roleName: user.RoleName,
      personalId: user.Personal_id,
      email: user.Email,
      firstName: user.FirstName,
      lastName: user.LastName,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "An error occurred during login" });
  }
};

const addUser = async (req, res) => {
  try {
    const {
      email, personalId, password, firstName, lastName,
      phoneNumber, address, roleID, roleName,
    } = req.body;

    if (!email || !personalId || !password || !firstName || !lastName ||
        !phoneNumber || !address || !roleID || !roleName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const numericRoleID = parseInt(roleID, 10);
    if (!ALLOWED_SIGNUP_ROLES.includes(numericRoleID)) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    const expectedRoleName = ROLE_MAP[numericRoleID];
    if (!expectedRoleName || expectedRoleName !== roleName) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return res.status(400).json({ message: "Name is too long" });
    }

    const userExists = await dbSingleton.promiseQuery(
      "SELECT Personal_id FROM users WHERE Email = ? OR Personal_id = ?",
      [email, personalId]
    );

    if (userExists.length > 0) {
      return res.status(400).json({ message: "A user with this email or ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await dbSingleton.promiseQuery(
      `INSERT INTO users 
       (Email, Personal_id, Password, FirstName, LastName, PhoneNumber, StreetAddress, RoleID, RoleName)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, personalId, hashedPassword, firstName.trim(), lastName.trim(),
       phoneNumber, address, numericRoleID, expectedRoleName]
    );

    try {
      await sendWelcomeEmail({ email, firstName: firstName.trim(), roleName: expectedRoleName });
    } catch (emailErr) {
      console.error("Welcome email failed (non-blocking):", emailErr.message);
    }

    return res.status(201).json({
      message: "Account created successfully!",
      userId: result.insertId,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "A user with this email or ID already exists." });
    }
    return res.status(500).json({ message: "An error occurred during registration" });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "photoclickteam@gmail.com",
    pass: process.env.EMAIL_PASS || "",
  },
});

async function sendEmail({ to, subject, html }) {
  const from = `"PhotoClick" <${process.env.EMAIL_USER || "photoclickteam@gmail.com"}>`;
  await transporter.sendMail({ from, to, subject, html });
}

async function sendWelcomeEmail(user) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:0 auto;">
      <h2>Welcome to PhotoClick, ${user.firstName}!</h2>
      <p>Your account has been successfully created.</p>
      <ul>
        <li><b>Email:</b> ${user.email}</li>
        ${user.roleName ? `<li><b>Role:</b> ${user.roleName}</li>` : ""}
      </ul>
      <p>Sign in here: <a href="${SITE_URL}/signin">${SITE_URL}/signin</a></p>
      <hr />
      <p><b>PhotoClick Team</b></p>
    </div>
  `;
  await sendEmail({ to: user.email, subject: "Welcome to PhotoClick", html });
}

const forgotPassword = async (req, res) => {
  const userEmail = req.body.userEmail;

  if (!userEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const results = await dbSingleton.promiseQuery(
      "SELECT FirstName, Email FROM users WHERE Email = ?",
      [userEmail]
    );

    // Always return same message to prevent email enumeration
    const genericMsg = "If an account exists with this email, you will receive reset instructions.";

    if (results.length === 0) {
      return res.status(200).json({ message: genericMsg });
    }

    const user = results[0];
    const tempPassword = crypto.randomBytes(6).toString("base64url");
    const hashedTemp = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    await dbSingleton.promiseQuery(
      "UPDATE users SET Password = ? WHERE Email = ?",
      [hashedTemp, userEmail]
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
        <h2>Password Reset</h2>
        <p>Hello ${user.FirstName},</p>
        <p>Your password has been reset. Use this temporary password to sign in:</p>
        <h3 style="background:#f0f0f0; padding:12px; border-radius:6px; text-align:center; font-family:monospace;">${tempPassword}</h3>
        <p>Please sign in and change your password immediately in your Profile.</p>
        <p><a href="${SITE_URL}/signin">Go to Sign In</a></p>
        <hr />
        <p>If you did not request this, contact support immediately.</p>
        <p><b>PhotoClick Team</b></p>
      </div>
    `;

    await sendEmail({
      to: userEmail,
      subject: "PhotoClick - Password Reset",
      html,
    });

    res.json({ message: genericMsg });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

async function sendNewOrderEmailToAdmin(order) {
  if (ADMIN_EMAILS.length === 0) return;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
      <h2>New Order Received</h2>
      <p><b>Customer:</b> ${order.email}</p>
      <p><b>Event:</b> ${order.eventType} on ${order.eventDate} at ${order.eventTime}</p>
      <p><b>Total:</b> ${order.eventPrice} &#8362;</p>
      <p><b>Location:</b> ${order.place?.name || order.place}</p>
      <hr /><p>${order.dynamicDescription || ""}</p>
    </div>
  `;
  await sendEmail({ to: ADMIN_EMAILS, subject: "New Order - PhotoClick", html });
}

async function sendOrderConfirmationToCustomer(order) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:0 auto;">
      <h2>Order Confirmed!</h2>
      <p>Thank you for choosing <b>PhotoClick</b>. Your order is pending approval.</p>
      <ul>
        <li><b>Event:</b> ${order.eventType}</li>
        <li><b>Date:</b> ${order.eventDate}</li>
        <li><b>Time:</b> ${order.eventTime}</li>
        <li><b>Location:</b> ${order.place?.name || order.place}</li>
        <li><b>Total:</b> ${order.eventPrice} &#8362;</li>
      </ul>
      <p>Track your orders: <a href="${SITE_URL}/signin">${SITE_URL}/signin</a></p>
      <p><b>PhotoClick Team</b></p>
    </div>
  `;
  await sendEmail({ to: order.email, subject: "PhotoClick - Order Confirmation", html });
}

async function sendAssignmentEmailToWorker(worker, order) {
  if (!worker?.Email || !order) return;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
      <h2>New Event Assigned</h2>
      <p>Hello ${worker.FirstName || ""},</p>
      <ul>
        <li><b>Event:</b> ${order.EventName || ""}</li>
        <li><b>Date:</b> ${order.DateOfEvent || ""}</li>
        <li><b>Time:</b> ${order.HourOfEvent || ""}</li>
        <li><b>Location:</b> ${order.EventPlace || ""}</li>
      </ul>
      <p><b>PhotoClick Team</b></p>
    </div>
  `;
  await sendEmail({ to: worker.Email, subject: "New Event Assignment - PhotoClick", html });
}

// IDOR-safe: only return data for the authenticated user
const getUserDetails = async (req, res) => {
  const userEmail = req.user.email;

  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT Email, Personal_id, FirstName, LastName, PhoneNumber, StreetAddress, RoleID, RoleName 
       FROM users WHERE Email = ?`,
      [userEmail]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(results[0]);
  } catch (error) {
    console.error("getUserDetails error:", error.message);
    res.status(500).json({ message: "An error occurred" });
  }
};

// IDOR-safe: only update the authenticated user's own profile
const updateUserDetails = async (req, res) => {
  const email = req.user.email;
  const { firstName, lastName, phoneNumber, address, newPassword } = req.body;

  if (!firstName || !lastName || !phoneNumber) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  if (firstName.length > 50 || lastName.length > 50) {
    return res.status(400).json({ message: "Name is too long" });
  }

  try {
    let sqlQuery, queryParams;

    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      sqlQuery = `UPDATE users SET FirstName=?, LastName=?, PhoneNumber=?, StreetAddress=?, Password=? WHERE Email=?`;
      queryParams = [firstName.trim(), lastName.trim(), phoneNumber, address, hashedPassword, email];
    } else {
      sqlQuery = `UPDATE users SET FirstName=?, LastName=?, PhoneNumber=?, StreetAddress=? WHERE Email=?`;
      queryParams = [firstName.trim(), lastName.trim(), phoneNumber, address, email];
    }

    await dbSingleton.promiseQuery(sqlQuery, queryParams);
    res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("updateUserDetails error:", error.message);
    res.status(500).json({ message: "An error occurred" });
  }
};

const getEventSerial = async (eventType) => {
  const rows = await dbSingleton.promiseQuery(
    "SELECT EventSerial FROM eventkind WHERE EventName = ?",
    [eventType]
  );
  if (rows.length === 0) throw new Error("Invalid event type");
  return rows[0].EventSerial;
};

const getProductPackSerials = async () => {
  const results = await dbSingleton.promiseQuery(
    "SELECT ProductPackSerial, ItemType FROM products_packs"
  );
  const out = {};
  results.forEach((row) => {
    if (row.ItemType === "Pack") {
      if (row.ProductPackSerial === 201) out.bronze = row.ProductPackSerial;
      if (row.ProductPackSerial === 202) out.silver = row.ProductPackSerial;
      if (row.ProductPackSerial === 203) out.gold = row.ProductPackSerial;
    } else {
      const map = {
        901: "stills", 902: "video", 903: "album30x80", 904: "album40x60",
        905: "magnets10x12", 906: "magnets20x24", 907: "canvas50x70", 908: "canvas60x90",
      };
      if (map[row.ProductPackSerial]) out[map[row.ProductPackSerial]] = row.ProductPackSerial;
    }
  });
  return out;
};

// IDOR-safe: order created under the authenticated user's email only
const createOrder = async (req, res) => {
  const email = req.user.email;
  const {
    eventType, packStyle, serialPack, eventDate, eventTime,
    eventPrice, place, quantities, dynamicDescription,
  } = req.body;

  if (!eventType || !eventDate || !eventTime) {
    return res.status(400).json({ success: false, message: "Missing required order fields" });
  }

  if (!place || !place.name) {
    return res.status(400).json({ success: false, message: "Event location is required" });
  }

  const priceNum = parseFloat(eventPrice);
  if (isNaN(priceNum) || priceNum < 0) {
    return res.status(400).json({ success: false, message: "Invalid price" });
  }

  try {
    const eventSerial = await getEventSerial(eventType);
    const serials = await getProductPackSerials();

    const maxResult = await dbSingleton.promiseQuery(
      "SELECT MAX(OrderNumber) AS maxOrderNumber FROM orders"
    );
    const nextOrder = (maxResult[0].maxOrderNumber || 1000) + 1;

    await dbSingleton.promiseQuery(
      `INSERT INTO orders 
       (OrderNumber, EventName, EventSerial, SerialPack, TotalPrice, EventPlace, Email,
        OrderDate, OrderHour, DateOfEvent, HourOfEvent, OrderDescription)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?)`,
      [nextOrder, eventType, eventSerial, serialPack || 0,
       priceNum, place.name, email, eventDate, eventTime,
       dynamicDescription || ""]
    );

    const orderItems = [];
    if (quantities) {
      for (const [product, qty] of Object.entries(quantities)) {
        const numQty = parseInt(qty, 10);
        if (numQty > 0 && serials[product]) {
          orderItems.push([nextOrder, serials[product], numQty]);
        }
      }
    }
    if (serials[packStyle]) {
      orderItems.push([nextOrder, serials[packStyle], 1]);
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "Order has no items" });
    }

    await dbSingleton.promiseQuery(
      "INSERT INTO order_items (OrderNumber, ProductPackSerial, Quantity) VALUES ?",
      [orderItems]
    );

    try {
      await sendNewOrderEmailToAdmin({
        email, eventType, packStyle, eventDate, eventTime, eventPrice: priceNum, place, dynamicDescription,
      });
      await sendOrderConfirmationToCustomer({
        email, eventType, eventDate, eventTime, eventPrice: priceNum, place, dynamicDescription,
      });
    } catch (emailErr) {
      console.error("Order email failed (non-blocking):", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully! Check your email for details.",
    });
  } catch (error) {
    console.error("Order creation error:", error.message);
    res.status(500).json({ success: false, message: "An error occurred creating the order" });
  }
};

// IDOR-safe: only return orders for the authenticated user's email
const getUserOrders = async (req, res) => {
  const userEmail = req.user.email;

  try {
    const results = await dbSingleton.promiseQuery(
      `SELECT 
        orders.OrderNumber, orders.TotalPrice, orders.EventName,
        orders.DateOfEvent, orders.HourOfEvent, orders.OrderDate,
        orders.OrderHour, orders.EventPlace, orders.OrderDescription,
        orders.Status,
        order_items.ProductPackSerial, order_items.Quantity,
        products_packs.Description AS ItemDescription,
        products_packs.Price AS ItemPrice
      FROM orders
      LEFT JOIN order_items ON orders.OrderNumber = order_items.OrderNumber
      LEFT JOIN products_packs ON order_items.ProductPackSerial = products_packs.ProductPackSerial
      WHERE orders.Email = ?`,
      [userEmail]
    );

    const orders = {};
    results.forEach((row) => {
      if (!orders[row.OrderNumber]) {
        orders[row.OrderNumber] = {
          OrderNumber: row.OrderNumber,
          TotalPrice: row.TotalPrice,
          EventName: row.EventName,
          DateOfEvent: row.DateOfEvent,
          HourOfEvent: row.HourOfEvent,
          OrderDate: row.OrderDate,
          OrderHour: row.OrderHour,
          EventPlace: row.EventPlace,
          OrderDescription: row.OrderDescription,
          Status: row.Status || "Pending",
          Items: [],
        };
      }
      if (row.ProductPackSerial) {
        orders[row.OrderNumber].Items.push({
          ProductPackSerial: row.ProductPackSerial,
          Quantity: row.Quantity,
          ItemDescription: row.ItemDescription || "",
          ItemPrice: row.ItemPrice || 0,
        });
      }
    });

    res.status(200).json({ success: true, orders: Object.values(orders) });
  } catch (error) {
    console.error("getUserOrders error:", error.message);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

module.exports = {
  getUser, addUser, forgotPassword,
  getUserDetails, updateUserDetails,
  createOrder, getUserOrders,
  sendAssignmentEmailToWorker,
};
