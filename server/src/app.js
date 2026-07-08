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
app.use(cors({
  // 🔄 আপনার Vercel ফ্রন্টএন্ডের লাইভ URL-টি এখানে দিন (শেষে কোন '/' দিবেন না)
  origin: "https://eventora-client.vercel.app", 
  credentials: true, // কুকি বা অথরাইজেশন টোকেন পাস করার অনুমতি দেয়
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
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