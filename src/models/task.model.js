import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants.js";

const taskSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  list: { type: Schema.Types.ObjectId, ref: "List" },
  position: { type: Number, default: 0 },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: AvailableTaskStatus, default: TaskStatusEnum.TODO },
  labels: { type: [{ name: String, color: String }], default: [] },
  coverColor: { type: String, default: "" },
  dueDate: { type: Date },
  attachment: {
    type: [{ url: String, mimetype: String, size: Number }],
    default: []
  }
}, { timestamps: true });

taskSchema.index({ list: 1, position: 1 });
taskSchema.index({ project: 1 });
export const Task = mongoose.model("Task", taskSchema);
