import mongoose,{Schema} from "mongoose";
import { AvailableRoles,USerRoleEnum } from "../utils/constants.js";
import crypto from "crypto";

const projectMemberSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
   project:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
   },
   role:{
    type: String,
    enum: AvailableRoles,
    default: USerRoleEnum.MEMBER
   },
   status:{
    type: String,
    enum: ['pending', 'accepted'],
    default: 'accepted'
   },
   inviteToken:{
    type: String
   }
},{
    timestamps: true
});

export const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);


