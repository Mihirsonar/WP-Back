import User from "../models/user.model.js";

export const getAllusers = async (req,res)=>{
    try {
        const users = await User.find({},"-password -accessToken -refreshToken");

        res.status(200).json({
            users,
            count:users.length
        })
    } catch (error) {
        console.error("Error While fetching Users",error)
    }
}