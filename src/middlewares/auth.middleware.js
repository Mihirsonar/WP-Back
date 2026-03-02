import User from "../models/user.model.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
    console.log("Cookies:", req.cookies?.accessToken);
    console.log("Auth Header:", req.header("Authorization"));

  if (!token) {
    throw new ApiError(401, "Unauthorized!!!");
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    // console.log("Verify Secret:", process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id)
    .select("-password -refreshToken");
    // console.log("User from DB:", user);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token 1");
    }

    console.log("Decoded Token:", decodedToken);
    req.user = user;
    next();


  } catch (error) {
console.log("JWT Verification Error:", error);}
});