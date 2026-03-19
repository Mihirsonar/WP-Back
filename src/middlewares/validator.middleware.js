import { validationResult } from "express-validator";
import { ApiError } from "../utils/Api_Err.js";

// Middleware to validate request data using express-validator
export const validate=(req,res,next)=>{
 const errors = validationResult(req);
if(errors.isEmpty()){
    return next();
}
const extractedErrors = [];
errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
 throw new ApiError('Validation Error', 400, extractedErrors);
}
