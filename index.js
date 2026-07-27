import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import allRoutes from "./app/routes/index.js";
import { connectDB } from "./app/config/dbConfig.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      return res.status(500).json({ statusCode: 500, message: "Database connection failed", data: null });
    }
  }
  next();
});

allRoutes(app);

app.get("/", (req, res) => {
  res.send("NGN Project Apis");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    statusCode: err.statusCode || 500,
    message: err.message || "Internal server error",
    data: null,
  });
});

export default app;
