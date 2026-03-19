import User from "../models/user.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized!!!");
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id)
    .select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token 1");
    }
    req.user = user;
    next();
  } catch (error) {
console.log("JWT Verification Error:", error);}
});

export const validationProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {

    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "Project ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Invalid Project ID");
    }

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id)
    });

    if (!project) {
      throw new ApiError(403, "You do not have permission to access this project");
    }

    const givenRole = project.role;

    req.user.role = givenRole;

    if (roles.length && !roles.includes(givenRole)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();

  });
};