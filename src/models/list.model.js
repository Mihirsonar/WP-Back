import mongoose, { Schema } from "mongoose";

const listSchema = new Schema({
  title: { type: String, required: true, trim: true },
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  position: { type: Number, required: true, default: 0 },
  color: { type: String, default: "#6366f1" }
}, { timestamps: true });

listSchema.index({ project: 1, position: 1 });
export const List = mongoose.model("List", listSchema);
