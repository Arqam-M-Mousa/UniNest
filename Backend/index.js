const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const db = require("./models");
const { DatabaseConnection } = require("./config/database");
const { Conversation } = require("./models");

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Debug: Check if JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error("⚠️ WARNING: JWT_SECRET environment variable is not set!");
} else {
  console.log("✅ JWT_SECRET is loaded from environment variables");
}

// CORS configuration
const corsOptions = {
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
};

app.use(cors(corsOptions));

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: corsOptions,
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.io connection handling
io.on("connection", (socket) => {
  // Join user to their personal room
  socket.join(`user:${socket.userId}`);

  // Join conversation room
  socket.on("conversation:join", async (conversationId) => {
    try {
      // Verify user is part of this conversation
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        socket.emit("error", { message: "Conversation not found" });
        return;
      }

      if (
        conversation.studentId !== socket.userId &&
        conversation.landlordId !== socket.userId
      ) {
        socket.emit("error", { message: "Access denied to this conversation" });
        return;
      }

      socket.join(`conversation:${conversationId}`);
    } catch (error) {
      socket.emit("error", { message: "Failed to join conversation" });
    }
  });

  // Leave conversation room
  socket.on("conversation:leave", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Typing indicator
  socket.on("typing:start", ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit("typing:start", {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on("typing:stop", ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit("typing:stop", {
      userId: socket.userId,
      conversationId,
    });
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    // User disconnected
  });
});

// Make io accessible to routes
app.set("io", io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api", (req, res) => {
  res.status(200).json({ message: "Welcome to UniNest Backend API" });
});

// API Routes
app.use("/api", require("./routes"));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

server.listen(PORT, async () => {
  console.log("Server running on port " + PORT);
  console.log("WebSocket server ready");
  await DatabaseConnection.connect();
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  io.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received");
  io.close();
  process.exit(0);
});
