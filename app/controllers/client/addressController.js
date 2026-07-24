import Address from "../../models/address/address.js";
import { handleResponse } from "../../utils.js/responseHandler.js";

export const createAddress = async (req, res) => {
  try {
    const { fullName, contact, address,address_type, city, state, pincode, country, isDefault } = req.body;

    if (!fullName || !contact || !address || !city || !state || !pincode) {
      return handleResponse(res, 400, "Missing required fields");
    }

    const newAddress = await Address.create({
      user: req.user._id,
      fullName,
      contact,
      address,
      address_type,
      city,
      state,
      pincode,
      country,
      isDefault,
    });

    return handleResponse(res, 201, "Address created successfully", newAddress);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
      status: { $ne: "deleted" },
    }).sort({ isDefault: -1, createdAt: -1 });

    return handleResponse(res, 200, "Addresses fetched successfully", addresses);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return handleResponse(res, 404, "Address not found");
    }

    return handleResponse(res, 200, "Address fetched successfully", address);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { fullName, contact, address,address_type, city, state, pincode, country, isDefault } = req.body;

    const existingAddress = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!existingAddress) {
      return handleResponse(res, 404, "Address not found");
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        contact,
        address,
        address_type,
        city,
        state,
        pincode,
        country,
        isDefault,
      },
      { new: true, runValidators: true }
    );

    return handleResponse(res, 200, "Address updated successfully", updatedAddress);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return handleResponse(res, 404, "Address not found");
    }

    await Address.findByIdAndUpdate(req.params.id, { status: "deleted" });

    return handleResponse(res, 200, "Address deleted successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return handleResponse(res, 404, "Address not found");
    }

    await Address.updateMany(
      { user: req.user._id },
      { isDefault: false }
    );

    address.isDefault = true;
    await address.save();

    return handleResponse(res, 200, "Default address updated successfully", address);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "Internal server error");
  }
};
