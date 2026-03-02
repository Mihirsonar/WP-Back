import { Router } from "express";
import {registerUser,login, logout} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { registerValidation ,userLoginValidation} from "../validatiors/index.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { forgotPassword, changePassword, getCurrentUser,resetPassword} from "../controllers/auth.controller.js";
import { changePasswordValidation, forgotPasswordValidation } from "../validatiors/index.js";
import { resetPasswordValidation } from "../validatiors/resetPassword.validation.js";

const router = Router();

router.route('/register').post(registerValidation(validate), registerUser);
router.route("/login").post(userLoginValidation(validate),login);
router.route("/forgot-password").post(forgotPasswordValidation(validate),forgotPassword);
router.route("/reset-password/:id/:token").post(resetPasswordValidation(validate),resetPassword);

// Protected Routes
router.route("/logout").post(verifyJWT,logout);
router.route("/change-password").post(verifyJWT,changePasswordValidation(validate),changePassword);
router.route("/current").get(verifyJWT,getCurrentUser);


export default router;