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
connectDB();

// Middleware
// 🔄 ১. CORS কনফিগারেশন
app.use(cors({
  origin: true, // অথবা আপনার ফ্রন্টএন্ডের নির্দিষ্ট URL: "https://eventora-client.vercel.app"
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔄 ২. প্রি-ফ্লাইট (OPTIONS) রিকোয়েস্টের জন্য এই হ্যান্ডেলারটি যোগ করুন (এটিই আসল ফিক্স)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(200); // ২০৪ প্রি-ফ্লাইটকে সাকসেসফুলি ২০০ ওকে করে দেবে
});
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/booking", bookingRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to Eventora API Server!",
        status: "Running Successfully"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app