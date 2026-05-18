require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const apiRoutes = require("./routes/api");

const PORT = process.env.PORT || 8801;
const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: SITE_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/signin", authLimiter);
app.use("/api/signup", authLimiter);
app.use("/api/forgotpassword", authLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "routes", "public", "uploads"))
);

app.use("/api", apiRoutes);

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Maximum is 20 files at once." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err.message && err.message.includes("Only image files")) {
    return res.status(400).json({ message: err.message });
  }

  console.error("Unhandled error:", err.message || err);
  res.status(500).json({ message: "An unexpected error occurred" });
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

app.listen(PORT, () => {
  console.log(`PhotoClick server running on port ${PORT}`);
});
