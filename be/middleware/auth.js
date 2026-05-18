const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error("FATAL: JWT_SECRET environment variable is required in production");
  process.exit(1);
}

const EFFECTIVE_SECRET = JWT_SECRET || "dev-only-insecure-secret-" + Date.now();

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.Personal_id,
      email: user.Email,
      roleID: user.RoleID,
      roleName: user.RoleName,
    },
    EFFECTIVE_SECRET,
    { expiresIn: "24h" }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, EFFECTIVE_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.roleID)) {
      return res.status(403).json({ message: "You don't have permission to access this resource" });
    }
    next();
  };
}

module.exports = { generateToken, verifyToken, requireRole };
