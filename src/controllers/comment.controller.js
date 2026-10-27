import { Comment } from "../models/comment.model.js";
import { Task } from "../models/task.model.js";
import { ApiResponse } from "../utils/Api_response.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import mongoose from "mongoose";

const getComments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const comments = await Comment.find({ task: taskId })
    .populate("createdBy", "username avatar email")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, "Comments fetched", comments));
});

const createComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const comment = await Comment.create({
    content,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });
  const populated = await Comment.findById(comment._id)
    .populate("createdBy", "username avatar email");
  return res.status(201).json(new ApiResponse(201, "Comment created", populated));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");
  if (String(comment.createdBy) !== String(req.user._id)) {
    throw new ApiError(403, "Not authorized to delete this comment");
  }
  await Comment.findByIdAndDelete(commentId);
  return res.status(200).json(new ApiResponse(200, "Comment deleted", null));
});

export { getComments, createComment, deleteComment };
