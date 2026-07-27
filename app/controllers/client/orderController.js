import Order from "./../../models/order/order.js";
import Cart from "./../../models/cart/cart.js";
import Address from "./../../models/address/address.js";
import Products from "./../../models/products/products.js";
import { handleResponse } from "../../utils.js/responseHandler.js";
import razorpay from "./../../config/razorpay.js";

const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne({
    order_number: { $exists: true, $ne: null },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;
  if (lastOrder?.order_number) {
    const lastNumber = parseInt(lastOrder.order_number.replace("ORDER", ""), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  return `ORDER${String(nextNumber).padStart(3, "0")}`;
};

export const createOrder = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { address_id, payment_method = "cod" } = req.body;

    const address = await Address.findOne({ _id: address_id, user: user_id });
    if (!address) {
      return handleResponse(res, 404, "Address not found.");
    }

    const cart = await Cart.findOne({ user: user_id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return handleResponse(res, 400, "Cart is empty.");
    }

    const invalidItem = cart.items.find((item) => !item.product);
    if (invalidItem) {
      return handleResponse(res, 400, "One or more products are no longer available.");
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        productName: product.productName,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const shippingCharge = 40;
    const totalAmount = subtotal + shippingCharge;

    const order_number = await generateOrderNumber();

    let razorpay_order_id = null;
    if (payment_method === "online") {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order_number,
        notes: { order_number, user_id: user_id.toString() },
      });
      razorpay_order_id = razorpayOrder.id;
    }

    const order = await Order.create({
      order_number,
      user: user_id,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        contact: address.contact,
      },
      paymentMethod: payment_method,
      paymentStatus: payment_method === "online" ? "pending" : "pending",
      subtotal,
      shippingCharge,
      totalAmount,
      orderStatus: "pending",
      razorpay_order_id,
    });

    await Cart.deleteMany({ user: user_id });

    return handleResponse(res, 201, "Order created successfully.", {
      order,
      ...(payment_method === "online" && {
        razorpay: { razorpay_order_id, amount: Math.round(totalAmount * 100), currency: "INR" },
      }),
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return handleResponse(res, 500, "Internal Server Error");
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const user_id = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalRecords = await Order.countDocuments({ user: user_id });

    const orders = await Order.find({ user: user_id })
      .select("order_number items totalAmount orderStatus createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return handleResponse(res, 200, "Orders fetched successfully.", {
      orders,
      pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) },
    });
  } catch (error) {
    console.error("Get Order History Error:", error);
    return handleResponse(res, 500, "Internal Server Error");
  }
};

export const getOrderById = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { order_id } = req.params;

    const order = await Order.findOne({ _id: order_id, user: user_id }).lean();
    if (!order) {
      return handleResponse(res, 404, "Order not found.");
    }

    return handleResponse(res, 200, "Order fetched successfully.", order);
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    return handleResponse(res, 500, "Internal Server Error");
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { order_id } = req.params;

    const order = await Order.findOne({ _id: order_id, user: user_id });
    if (!order) {
      return handleResponse(res, 404, "Order not found.");
    }

    const nonCancelableStatuses = ["shipped", "delivered", "cancelled"];
    if (nonCancelableStatuses.includes(order.orderStatus)) {
      return handleResponse(res, 400, `Order cannot be cancelled because its status is ${order.orderStatus}.`);
    }

    order.orderStatus = "cancelled";
    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }
    await order.save();

    return handleResponse(res, 200, "Order cancelled successfully.", order);
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return handleResponse(res, 500, "Internal Server Error");
  }
};
