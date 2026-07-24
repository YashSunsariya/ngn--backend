import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect } from "../middlewares/auth.js";
import {upload} from "../middlewares/upload.js";


const router = express.Router();

router.post("/", protect, upload.single("categoryImage"), createCategory);
router.get("/", protect, getCategories);
router.get("/:id", protect, getCategoryById);
router.put("/:id", protect, upload.single("categoryImage"), updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
