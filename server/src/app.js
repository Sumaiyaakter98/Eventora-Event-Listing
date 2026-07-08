import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ratelimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import cookie from "cookie-parser";
import connectDB from "./config/bd.js";
import authRoutes from "./routes/auth.js";
import eventsRoutes from "./routes/events.js";
import bookingRoutes from "./routes/booking.js";

dotenv.config({ path: "./.env" });
const app = express();

// ডাটাবেজ কানেক্ট করা হচ্ছে
await connectDB();

// Middleware
// 🔄 ১. CORS কনফিগারেশন
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
  }),
);
app.options("*", cors({ origin: true, credentials: true }));
app.use(express.json());

// Logging for request diagnostics
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/booking", bookingRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Eventora API Server!",
    status: "Running Successfully",
  });
});

// Debug endpoint that returns presence of critical environment variables (booleans only)
app.get("/_debug/env", (req, res) => {
  const vars = {
    MONGO_URI: !!process.env.MONGO_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    NODE_ENV: !!process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
  };

  return res.status(200).json({ debug: true, vars });
});

// Global error handler for better deployment diagnostics
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production" || process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
