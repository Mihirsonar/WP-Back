import mongoose,{Schema} from "mongoose";
import { AvailableTaskStatus,PriorityEnum,TaskStatusEnum } from "../utils/constants.js";

const taskSchema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
    },
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    status:{
        type: String,
        enum: AvailableTaskStatus,
        default: TaskStatusEnum.PENDING
    },

    priority:{
        type : String,
        enum: Priority,
        default : PriorityEnum.Low
    },
    attachment:{
        type:[{
            url:String,
            mimetype:String,
            size:Number
        }],
        default :[]
    },
    dueDate:{
        type: Date
    }
},{
    timestamps: true
});

export const Task = mongoose.model("Task",taskSchema);