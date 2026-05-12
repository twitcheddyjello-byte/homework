const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// =========================
// CONFIG
// =========================

const PORT = process.env.PORT || 3000;

const MONGO_URI =
  "mongodb://127.0.0.1:27017/homework_platform";

// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// =========================
// ROUTES
// =========================

// Landing Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health Check
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Homework Platform Server Running",
  });
});

// =========================
// SOCKET.IO
// =========================

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  // Join tutoring room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    console.log(`User joined room: ${roomId}`);

    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Chat message
  socket.on("send-message", (data) => {
    io.to(data.room).emit("receive-message", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
  });
});

// =========================
// START SERVER
// =========================

server.listen(PORT, () => {
  console.log(`
==================================
🚀 SERVER RUNNING
🌍 http://localhost:${PORT}
==================================
  `);
});