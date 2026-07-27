import express from "express";
import { registeruser, loginuser, getme, updateUser, changePassword } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();
router.post("/register", registeruser);
router.post("/login", loginuser);
router.get("/me", protect, getme);
router.get("/profile", protect, getme);
router.put("/profile", protect, updateUser);
router.put("/change-password", protect, changePassword);
export default router;
