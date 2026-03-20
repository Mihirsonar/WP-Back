import { urlencoded } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";    

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,   
        required: [true, 'Password is required'],
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    RefreshToken: {
        type: String,
    },
    AccessToken:{
        type: String,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpire: {
        type: Date,
    },

    role: { 
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    avatar:{
        type:{
            url : String,
           localpath : String,
        },
        default: {
            url: 'https://placehold.co/200x200',
            localpath: '',
        }
    },
}, { timestamps: true });

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next;
    }   
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next;
    }
    catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT tokens
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
  );
};

userSchema.methods.generateRefreshToken = function() {   
    const refreshToken = jwt.sign({ id: this._id,email: this.email, role: this.role,username: this.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
    return refreshToken;
};

userSchema.methods.generateTemporaryToken = function() {
   const unHashedToken = crypto.randomBytes(20).toString("hex");
   const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
   const tokenExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
   return {unHashedToken,hashedToken,tokenExpire};
};

const User = mongoose.model("User", userSchema);

export default User;