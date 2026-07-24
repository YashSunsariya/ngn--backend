import Category from "../models/products/category.js";
import { uploadSingleImageImage } from "../utils.js/cloudinaryUpload.js";
import { handleResponse } from "../utils.js/responseHandler.js";

export const createCategory = async (req, res) => {
  try {
    const { categoryName, description, parentCategory, status } = req.body;

    if (!categoryName) {
      return handleResponse(res, 400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ categoryName });

    if (existingCategory) {
      return handleResponse(res, 400, "Category already exists");
    }

    let categoryImage = null;

    if (req.file) {
      const result = await uploadSingleImageImage(req.file, "categories");
      categoryImage = result.url;
    }

    const category = await Category.create({
      categoryName,
      description,
      categoryImage,
      parentCategory: parentCategory || null,
      status: status || "active",
    });

    return handleResponse(res, 201, "Category created successfully", category);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const getCategories = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.categoryName = { $regex: search, $options: "i" };
    }

    const categories = await Category.find(filter)
      .populate("parentCategory", "categoryName")
      .sort({ createdAt: -1 });

    return handleResponse(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parentCategory",
      "categoryName"
    );

    if (!category) {
      return handleResponse(res, 404, "Category not found");
    }

    return handleResponse(res, 200, "Category fetched successfully", category);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryName, description, parentCategory, status } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return handleResponse(res, 404, "Category not found");
    }

    if (categoryName && categoryName !== category.categoryName) {
      const existingCategory = await Category.findOne({ categoryName });
      if (existingCategory) {
        return handleResponse(res, 400, "Category name already exists");
      }
    }

    let categoryImage = category.categoryImage;

    if (req.file) {
      const result = await uploadSingleImageImage(req.file, "categories");
      categoryImage = result.url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { categoryName, description, parentCategory, status, categoryImage },
      { new: true, runValidators: true }
    );

    return handleResponse(res, 200, "Category updated successfully", updatedCategory);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return handleResponse(res, 404, "Category not found");
    }

    await Category.findByIdAndUpdate(req.params.id, { status: "deleted" });

    return handleResponse(res, 200, "Category deleted successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};
