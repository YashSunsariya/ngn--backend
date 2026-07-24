import express from "express";
import {
  getClientBrands,
  getClientCategories,
  getClientProducts,
  getClientProductById,

} from "../../controllers/client/publicController.js";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../../controllers/client/cartController.js";
import { protect } from "../../middlewares/auth.js";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../controllers/client/addressController.js";

const router = express.Router();

router.get("/brands", getClientBrands);
router.get("/categories", getClientCategories);
router.get("/products", getClientProducts);
router.get("/products/:id", getClientProductById);

router.get("/cart", protect, getCart);
router.post("/cart", protect, addToCart);
router.put("/cart/:productId", protect, updateCartItem);
router.delete("/cart/:productId", protect, removeCartItem);
router.delete("/cart", protect, clearCart);

router.post("/", protect, createAddress);
router.get("/", protect, getAddresses);
router.get("/:id", protect, getAddressById);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);
router.put("/:id/default", protect, setDefaultAddress);
export default router;
