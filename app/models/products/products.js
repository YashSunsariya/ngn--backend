import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    shortDescription: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      default: "Piece",
    },

    specifications: [
      {
        key: String,
        value: String,
      },
    ],

    warranty: {
      type: String,
      default: "",
    },

    weight: {
      type: Number,
      default: 0,
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);


const Products = mongoose.model("Products",productSchema);
export default Products;