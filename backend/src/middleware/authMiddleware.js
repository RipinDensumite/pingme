// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use environment variable in production

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Token missing" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, error: "Invalid or expired token" });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res
      .status(403)
      .json({ success: false, error: "Admin access required" });
  }
  next();
};
