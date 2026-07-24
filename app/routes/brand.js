import express from "express";
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/", protect, upload.single("brandImage"), createBrand);
router.get("/", protect, getBrands);
router.get("/:id", protect, getBrandById);
router.put("/:id", protect, upload.single("brandImage"), updateBrand);
router.delete("/:id", protect, deleteBrand);

export default router;
