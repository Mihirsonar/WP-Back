import {body} from 'express-validator';
import { AvailableRoles } from '../utils/constants.js';

 const registerValidation=()=>{
return [
    body("email").isEmail().withMessage("Please enter a valid email address."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
    body("username").notEmpty().withMessage("Name is required.")
]
}

const userLoginValidation = ()=>{
    return [
    body("email").isEmail().withMessage("Invalid Email."),
    body("password").isLength({ min: 6 }).withMessage("Password is required."),

    ]
}

const changePasswordValidation = ()=>{
    return [
        body("currentPassword").isLength({ min: 6 }).withMessage("Current password is required."),
        body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long."),
    ]
}

const forgotPasswordValidation = ()=>{
    return [
        body("email").isEmail().withMessage("Invalid Email."),
    ]
}

const createProjectValidation = ()=>{
    return [
        body("name").notEmpty().withMessage("Project name is required."),
        body("description").optional().isString().withMessage("Description must be a string."),
    ]
}

const addMemberValidation = ()=>{
    return [
        body("email").isEmail().withMessage("Invalid Email."),
        body("role").isIn(AvailableRoles).withMessage("Role must be one of admin, editor, or viewer."),
    ]
}

const resetPasswordValidation = ()=>{
    return [
        body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long."),
    ]
}
export {registerValidation,userLoginValidation,changePasswordValidation,forgotPasswordValidation,createProjectValidation,addMemberValidation,resetPasswordValidation}