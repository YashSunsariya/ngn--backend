import Brand from "../../models/products/brand.js";
import Category from "../../models/products/category.js";
import Products from "../../models/products/products.js";
import { handleResponse } from "../../utils.js/responseHandler.js";

export const getClientBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ status: "active" })
      .select("brandName brandImage category")
      .sort({ brandName: 1 });

    return handleResponse(res, 200, "Brands fetched successfully", brands);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const getClientCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .select("categoryName categoryImage description parentCategory")
      .populate("parentCategory", "categoryName")
      .sort({ categoryName: 1 });

    return handleResponse(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const getClientProducts = async (req, res) => {
  try {
    const { search, category, brand, featured, minPrice, maxPrice } = req.query;

    const filter = { status: "active" };

    if (search) {
      filter.productName = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Products.find(filter)
      .select("productName slug description shortDescription images price discountPrice stock unit specifications warranty weight dimensions featured category brand")
      .populate("category", "categoryName slug")
      .populate("brand", "brandName slug brandImage")
      .sort({ createdAt: -1 });

    return handleResponse(res, 200, "Products fetched successfully", products);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const getClientProductById = async (req, res) => {
  try {
    const product = await Products.findOne({
      _id: req.params.id,
      status: "active",
    })
      .select("productName slug description shortDescription images price discountPrice stock unit specifications warranty weight dimensions featured category brand")
      .populate("category", "categoryName slug")
      .populate("brand", "brandName slug brandImage");

    if (!product) {
      return handleResponse(res, 404, "Product not found");
    }

    return handleResponse(res, 200, "Product fetched successfully", product);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};
