import jwt from "jsonwebtoken";
import User from "../models/auth/user.js";
import { handleResponse } from "../utils.js/responseHandler.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const registeruser = async (req, res) => {
  try {
    const { name, email, contact, password, address } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingUser) {
      return handleResponse(res, 400, "User already exists");
    }

    const user = await User.create({
      name,
      email,
      contact,
      password,
      address,
    });

    const token = generateToken(user._id);

    return handleResponse(res, 201, "User registered successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address,
      token,
    });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const loginuser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return handleResponse(res, 400, "Please provide email and password");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return handleResponse(res, 401, "Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return handleResponse(res, 401, "Invalid email or password");
    }

    const token = generateToken(user._id);

    return handleResponse(res, 200, "Login successful", {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};

export const getme = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    return handleResponse(res, 200, "User profile fetched successfully", user);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "Internal server error");
  }
};


export const updateUser = async (req, res) => {
  try {
    const email = req.user.email;

    const { name, contact, address } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        name,
        contact,
        address
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!updatedUser) {
      return handleResponse(res, 404, "User not found");
    }

    return handleResponse(
      res,
      200,
      "User updated successfully",
      updatedUser
    );

  } catch (error) {
    console.error(error);

    return handleResponse(
      res,
      500,
      "Internal server error"
    );
  }
};