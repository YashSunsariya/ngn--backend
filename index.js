import express from "express";
import cors from "cors";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import allRoutes from "./app/routes/index.js";
import {connectDB} from "./app/config/dbConfig.js";

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

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

connectDB();
allRoutes(app);

app.get("/", (req, res) => {
  res.send("NGN Project Apis");
}); 


const PORT = process.env.PORT || 3000;
const HOST= process.env.HOST || "localhost"

app.listen(PORT, HOST, () => {
  console.log(`Server is running on port http://${HOST}:${PORT} `);
});