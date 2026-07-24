import express from "express";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/client/addressController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", protect, createAddress);
router.get("/", protect, getAddresses);
router.get("/:id", protect, getAddressById);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);
router.put("/:id/default", protect, setDefaultAddress);

export default router;
