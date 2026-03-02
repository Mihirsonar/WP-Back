import {body} from 'express-validator';

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
export {registerValidation,userLoginValidation,changePasswordValidation,forgotPasswordValidation}