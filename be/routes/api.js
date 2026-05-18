const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 20 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"), false);
    }
  },
});

/* ====== Users ====== */
const {
  getUser, addUser, forgotPassword,
  getUserDetails, updateUserDetails,
  createOrder, getUserOrders,
} = require("../controllers/user");

router.post("/signup", addUser);
router.post("/signin", getUser);
router.post("/forgotpassword", forgotPassword);

router.post("/getUserData", verifyToken, getUserDetails);
router.post("/updateUserData", verifyToken, updateUserDetails);

/* ====== Orders ====== */
const {
  getOrdersAtDate, getTotalOrders, getPrices,
  getEventTypes, getPackStyles, getWorkStills,
  getAssignedOrders, rejectOrder, approveOrder,
} = require("../controllers/orders");

router.post("/createOrder", verifyToken, createOrder);
router.post("/getUserOrders", verifyToken, getUserOrders);
router.post("/rejectOrder", verifyToken, requireRole(1), rejectOrder);
router.post("/approveOrder", verifyToken, requireRole(1), approveOrder);

router.get("/getTotalOrders", verifyToken, requireRole(1), getTotalOrders);
router.get("/getEventTypes", getEventTypes);
router.get("/getPrices", getPrices);
router.get("/getPackStyles", getPackStyles);
router.post("/getOrdersAtDate", verifyToken, requireRole(1), getOrdersAtDate);
router.post("/getAssignedOrders", verifyToken, requireRole(1), getAssignedOrders);
router.get("/getWorkStils", getWorkStills);

/* ====== Workers ====== */
const {
  getAvailableWorkers, getWorkersWhoServesOrder,
  assignWorkers, getAssignedWorkersForAssignedOrders,
  getOrdersForWorker, getWorkers, getCustomers,
} = require("../controllers/workers");

router.get("/getWorkers", verifyToken, requireRole(1), getWorkers);
router.get("/getCustomers", verifyToken, requireRole(1), getCustomers);
router.post("/getAvailableWorkers", verifyToken, requireRole(1), getAvailableWorkers);
router.post("/getWorkersForOrder", verifyToken, requireRole(1), getWorkersWhoServesOrder);
router.post("/assignWorkers", verifyToken, requireRole(1), assignWorkers);
router.post("/getAssignedWorkersForAssignedOrders", verifyToken, requireRole(1), getAssignedWorkersForAssignedOrders);
router.post("/getOrdersForWorker", verifyToken, getOrdersForWorker);

/* ====== Photographer Capacity ====== */
const { getPhotographerLimits } = require("../controllers/photographerCapacity");
router.get("/getPhotographerLimits", getPhotographerLimits);
router.get("/getPhotographerCaps", getPhotographerLimits);

/* ====== FAQ ====== */
const { getFAQData, addFaqData, deleteFaqData } = require("../controllers/faq");
router.get("/faqData", getFAQData);
router.post("/addFaq", verifyToken, requireRole(1), addFaqData);
router.post("/deleteFaq", verifyToken, requireRole(1), deleteFaqData);

/* ====== Pages / Content ====== */
const { getAboutUsData, editPageContent } = require("../controllers/pages");
router.get("/aboutUsData", getAboutUsData);
router.post("/editPageContent", verifyToken, requireRole(1), editPageContent);

/* ====== Events ====== */
const { getEventNames } = require("../controllers/events");
router.get("/getEventNames", getEventNames);

/* ====== Reports ====== */
const {
  getRevenue, getExpenses, getCustomerReport,
  getWorkerReport, getOrderReport, getEventDates,
} = require("../controllers/calculations");

router.post("/getRevenue", verifyToken, requireRole(1), getRevenue);
router.post("/getExpenses", verifyToken, requireRole(1), getExpenses);
router.post("/getCustomerReport", verifyToken, requireRole(1), getCustomerReport);
router.post("/getOrderReport", verifyToken, requireRole(1), getOrderReport);
router.post("/getWorkerReport", verifyToken, requireRole(1), getWorkerReport);
router.get("/getEventDates", getEventDates);

/* ====== Images ====== */
const { getImages, addImages, deleteImage } = require("../controllers/images");
router.get("/getImages", getImages);
router.post("/uploadImages", verifyToken, requireRole(1), upload.array("images"), addImages);
router.post("/deleteImage", verifyToken, requireRole(1), deleteImage);

/* ====== Google Auth ====== */
const { googleSignIn } = require("../controllers/googleAuth");
router.post("/google-signin", googleSignIn);

module.exports = router;
