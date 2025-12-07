const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models");
const { DatabaseConnection } = require("./config/database");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Debug: Check if JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error("⚠️ WARNING: JWT_SECRET environment variable is not set!");
} else {
  console.log("✅ JWT_SECRET is loaded from environment variables");
}

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost",
        "http://localhost:80",
        "http://localhost:5173", // dev server
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api", (req, res) => {
  res.status(200).json({ message: "Welcome to UniNest Backend API" });
});

// Auth routes
app.use("/api/auth", require("./routes/auth"));

// User routes
app.use("/api/users", require("./routes/users"));

// Contact route
app.use("/api/contact", require("./routes/contact"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/conversations", require("./routes/conversations"));

// Upload routes
app.use("/api/uploads", require("./routes/uploads"));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, async () => {
  console.log("Server running on port " + PORT);
  await DatabaseConnection.connect();
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received");
  process.exit(0);
});
