import Products from "../models/products/products.js";
import { handleResponse } from "../utils.js/responseHandler.js";
import { uploadSingleImageImage, uploadMultipleImages } from "../utils.js/cloudinaryUpload.js";

const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      sku,
      slug,
      description,
      shortDescription,
      category,
      brand,
      price,
      discountPrice,
      costPrice,
      stock,
      unit,
      specifications,
      warranty,
      weight,
      dimensions,
      featured,
    } = req.body;

    if (!productName || !category || !brand || price === undefined || stock === undefined) {
      return handleResponse(res, 400, "Missing required fields");
    }

    if (sku) {
      const existingProduct = await Products.findOne({ sku });
      if (existingProduct) {
        return handleResponse(res, 400, "Product with this SKU already exists");
      }
    }

    const images = req.files
      ? (await uploadMultipleImages(req.files, "products")).map((img) => img.url)
      : [];

const parsedSpecifications =
  typeof specifications === "string"
    ? JSON.parse(specifications)
    : specifications || [];

const parsedDimensions =
  typeof dimensions === "string"
    ? JSON.parse(dimensions)
    : dimensions || {};

const productSlug = slug || generateSlug(productName);

    const product = await Products.create({
      productName,
      slug: productSlug,
      description,
      shortDescription,
      category,
      brand,
      images,
      price,
      discountPrice,
      costPrice,
      stock,
      unit,
      specifications: parsedSpecifications,
      warranty,
      weight,
      dimensions: parsedDimensions,
      featured,
    });

    return handleResponse(res, 201, "Product created successfully", product);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const getProducts = async (req, res) => {
  try {
    const { status, search, category, brand, featured, minPrice, maxPrice } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

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
      .populate("category", "categoryName")
      .populate("brand", "brandName")
      .sort({ createdAt: -1 });

    return handleResponse(res, 200, "Products fetched successfully", products);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id)
      .populate("category", "categoryName")
      .populate("brand", "brandName");

    if (!product) {
      return handleResponse(res, 404, "Product not found");
    }

    return handleResponse(res, 200, "Product fetched successfully", product);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      sku,
      slug,
      description,
      shortDescription,
      category,
      brand,
      price,
      discountPrice,
      costPrice,
      stock,
      unit,
      specifications,
      warranty,
      weight,
      dimensions,
      featured,
      status,
    } = req.body;

    const product = await Products.findById(req.params.id);

    if (!product) {
      return handleResponse(res, 404, "Product not found");
    }

    if (sku && sku !== product.sku) {
      const existingProduct = await Products.findOne({ sku });
      if (existingProduct) {
        return handleResponse(res, 400, "SKU already exists");
      }
    }

    const images = req.files
      ? (await uploadMultipleImages(req.files, "products")).map((img) => img.url)
      : product.images;

    const parsedSpecifications = specifications ? JSON.parse(specifications) : product.specifications;
    const parsedDimensions = dimensions ? JSON.parse(dimensions) : product.dimensions;

    const productSlug = slug || generateSlug(productName || product.productName);

    const updatedProduct = await Products.findByIdAndUpdate(
      req.params.id,
      {
        productName,
        slug: productSlug,
        sku,
        description,
        shortDescription,
        category,
        brand,
        images,
        price,
        discountPrice,
        costPrice,
        stock,
        unit,
        specifications: parsedSpecifications,
        warranty,
        weight,
        dimensions: parsedDimensions,
        featured,
        status,
      },
      { new: true, runValidators: true }
    );

    return handleResponse(res, 200, "Product updated successfully", updatedProduct);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      return handleResponse(res, 404, "Product not found");
    }

    await Products.findByIdAndUpdate(req.params.id, { status: "deleted" });

    return handleResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};
