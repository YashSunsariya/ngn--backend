import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Order must have at least one item",
      },
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      contact: { type: Number, required: true },

    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online", "upi", "card"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",

    },
    // Razorpay Order ID
      razorpay_order_id: {

        type: String,

        default: null,

      },


      // Razorpay Payment ID
      razorpay_payment_id: {

        type: String,

        default: null,

      },


      // Optional: Signature
      razorpay_signature: {

        type: String,

        default: null,

      },


      transaction_id: {

        type: String,

        default: null,

      },

    

    trackingNumber: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
