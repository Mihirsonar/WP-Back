import User from "../models/user.model.js";

export const getAllusers = async (req,res)=>{
    try {
        const users = await User.find({},"-password -accessToken -refreshToken");

        res.status(200).json({
            count:users.length,
            users
        })
    } catch (error) {
        console.error("Error While fetching Users",error)
    }
}