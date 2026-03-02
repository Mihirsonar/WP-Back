import User from "../models/user.model.js";
import { ApiResponse } from "../utils/Api_response.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import { emailVerificationMail, sendEmail } from "../utils/mail.js";
import{generateForgotPasswordToken} from "../utils/token.js"; 

const generateTokens = async (user) => {
  try {
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Error generating tokens");
  }
};


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already in use");
  }

  const user = await User.create({
    username,
    email,
    password,
    isEmailVerified: false,
  });

  // Send email BEFORE response
  // await sendEmail({
  //   email: user.email,
  //   subject: "Email Verification",
  //   mailgencontent: emailVerificationMail(
  //     user.username,
  //     `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${user._id}`
  //   )
  // });

  return res.status(201).json(
    new ApiResponse(
      201,
      "User registered successfully. Please verify email.",
      {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    )
  );
});


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  const userData = user.toObject();
  delete userData.password;
  delete userData.RefreshToken;

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };
  // console.log("Login Secret:", process.env.ACCESS_TOKEN_SECRET);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        "User login successful",
        { user: userData, accessToken, refreshToken }
      )
    );
});

const logout = asyncHandler (async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:""
      }
    },{
      new: true,
    }
  );

  const options ={
    httpOnly : false,
    secure : false
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User LoggedOut")
  )
  
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200).json(
    new ApiResponse(200,req.user,"Current User")
  )
});

const forgotPassword = asyncHandler(async(req,res)=>{
  const {email} = req.body;
  if(!email){
    throw new ApiError(400,"Email is required");
  }
  const user = await User.findOne({email});
  if(!user){
    throw new ApiError(400,"User with this email does not exist");
  }

  const {unHashedToken,hashedToken,tokenExpire} = user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpire = tokenExpire;
  await user.save({validateBeforeSave:false});

  // Send email with temporary token
  await sendEmail({
    email: user.email,
    subject: "Forgot Password",
    mailgencontent: forgotPassword(user.username, `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${user._id}/${unHashedToken}`)
  });

  return res.status(200).json(
    new ApiResponse(200, "Reset password email sent successfully")
  );
});

const changePassword = asyncHandler(async(req,res)=>{
  const {currentPassword, newPassword} = req.body;
  if(!currentPassword || !newPassword){
    throw new ApiError(400,"Current and New Password are required");
  }
  const user = await User.findById(req.user._id);
  const isPasswordValid = await user.comparePassword(currentPassword);
  if(!isPasswordValid){
    throw new ApiError(400,"Current password is incorrect");
  }
  user.password = newPassword;
  await user.save({validateBeforeSave:false});
  return res.status(200).json(
    new ApiResponse(200, "Password changed successfully")
  );
});

const resetPassword = asyncHandler(async(req,res)=>{
  const {id,token} = req.params;
  const {newPassword} = req.body; 
  if(!newPassword){
    throw new ApiError(400,"New Password is required");
  }
  const user = await User.findById(req.user._id);
  if(!user){
    throw new ApiError(400,"Invalid link or expired");
  } 
  const isValidToken = user.validateTemporaryToken(token);
  if(!isValidToken){
    throw new ApiError(400,"Invalid link or expired");
  }
  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpire = undefined;

  await user.save({validateBeforeSave:false});
  return res.status(200).json(
    new ApiResponse(200, "Password reset successfully")
  );
});

export { generateTokens, registerUser, login ,logout,getCurrentUser,forgotPassword,changePassword,resetPassword};