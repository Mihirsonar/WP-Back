import {ApiResponse} from '../utils/Api_response.js';
import { asyncHandler } from '../utils/async_Handler.js';

const healthCheck = asyncHandler(async (req, res) => {
    const response = new ApiResponse(200, 'Server is healthy', null);
    res.status(200).json(response); 
});

export  {healthCheck};