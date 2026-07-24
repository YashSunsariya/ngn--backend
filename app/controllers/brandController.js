import Brand from "../models/products/brand.js";
import { handleResponse } from "../utils.js/responseHandler.js";

import { uploadSingleImageImage } from "../utils.js/cloudinaryUpload.js";

export const createBrand = async (req, res) => {
  try {
    const { brandName, category } = req.body;

    if (!brandName) {
      return handleResponse(res, 400, "Brand name is required");
    }

    const existingBrand = await Brand.findOne({ brandName });

    if (existingBrand) {
      return handleResponse(res, 400, "Brand already exists");
    }

    let brandImage = null;
if (req.file) {
  const result = await uploadSingleImageImage(req.file, "brands");
  brandImage = result.url;
}
    const brand = await Brand.create({
      brandName,
      brandImage,
      category,
    });

    return handleResponse(res, 201, "Brand created successfully", brand);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const getBrands = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.brandName = { $regex: search, $options: "i" };
    }

    const brands = await Brand.find(filter).sort({ createdAt: -1 });

    return handleResponse(res, 200, "Brands fetched successfully", brands);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return handleResponse(res, 404, "Brand not found");
    }

    return handleResponse(res, 200, "Brand fetched successfully", brand);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { brandName, category, status } = req.body;

    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return handleResponse(res, 404, "Brand not found");
    }

    if (brandName && brandName !== brand.brandName) {
      const existingBrand = await Brand.findOne({ brandName });
      if (existingBrand) {
        return handleResponse(res, 400, "Brand name already exists");
      }
    }
let brandImage = brand.brandImage;

if (req.file) {
  const result = await uploadSingleImageImage(req.file, "brands");
  brandImage = result.url;
}

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      { brandName, category, status, brandImage },
      { new: true, runValidators: true }
    );

    return handleResponse(res, 200, "Brand updated successfully", updatedBrand);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return handleResponse(res, 404, "Brand not found");
    }

    await Brand.findByIdAndUpdate(req.params.id, { status: "deleted" });

    return handleResponse(res, 200, "Brand deleted successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};
