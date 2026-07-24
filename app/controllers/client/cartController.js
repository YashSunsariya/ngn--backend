import Products from "../../models/products/products.js";
import { handleResponse } from "../../utils.js/responseHandler.js";
import Cart from './../../models/cart/cart.js';

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const userId = req.user._id;

    const product = await Products.findById(productId);

    if (!product) {
      return handleResponse(res, 404, "Product not found");
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [
          {
            product: productId,
            quantity,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
        });
      }
    }

    await cart.save();

    const populated = await cart.populate({
      path: "items.product",
      populate: [
        { path: "brand", model: "Brand", select: "brandName" },
        { path: "category", model: "Category", select: "categoryName" },
      ],
    });
    return handleResponse(res, 200, "Product added to cart", populated);
  } catch (error) {
    return handleResponse(res, 500, error.message);
  }
};

export const getCart = async (req, res) => {
  try {
    if (!req.user) {
      return handleResponse(res, 200, "Cart is empty", []);
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      populate: [
        { path: "brand", model: "Brand", select: "brandName" },
        { path: "category", model: "Category", select: "categoryName" },
      ],
    });

    if (!cart) {
      return handleResponse(res, 200, "Cart is empty", []);
    }

    return handleResponse(res, 200, "Cart fetched successfully", cart);
  } catch (error) {
    return handleResponse(res, 500, error.message);
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return handleResponse(res, 404, "Cart not found");
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return handleResponse(res, 404, "Product not found in cart");
    }

    item.quantity = quantity;

    await cart.save();

    const populated = await cart.populate({
      path: "items.product",
      populate: [
        { path: "brand", model: "Brand", select: "brandName" },
        { path: "category", model: "Category", select: "categoryName" },
      ],
    });
    return handleResponse(res, 200, "Cart updated", populated);
  } catch (error) {
    return handleResponse(res, 500, error.message);
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return handleResponse(res, 404, "Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populated = await cart.populate({
      path: "items.product",
      populate: [
        { path: "brand", model: "Brand", select: "brandName" },
        { path: "category", model: "Category", select: "categoryName" },
      ],
    });
    return handleResponse(res, 200, "Item removed from cart", populated);
  } catch (error) {
    return handleResponse(res, 500, error.message);
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return handleResponse(res, 404, "Cart not found");
    }

    cart.items = [];

    await cart.save();

    const populated = await cart.populate({
      path: "items.product",
      populate: [
        { path: "brand", model: "Brand", select: "brandName" },
        { path: "category", model: "Category", select: "categoryName" },
      ],
    });
    return handleResponse(res, 200, "Cart cleared", populated);
  } catch (error) {
    return handleResponse(res, 500, error.message);
  }
};