import jwt from "jsonwebtoken";
import User from "../models/auth/user.js";
import { handleResponse } from "../utils.js/responseHandler.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return handleResponse(res, 401, "Not authorized, no token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return handleResponse(res, 401, "Not authorized, user not found");
    }

    next();
  } catch (error) {
    return handleResponse(res, 401, "Not authorized, token failed");
  }
};
