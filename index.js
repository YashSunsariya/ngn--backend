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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await connectDB();
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

const PORT = process.env.PORT || 3000;
const HOST= process.env.HOST || "localhost"

app.listen(PORT, HOST, () => {
  console.log(`Server is running on port http://${HOST}:${PORT} `);
});
