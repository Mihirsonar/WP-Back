import User from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { List } from "../models/list.model.js";
import { ApiResponse } from "../utils/Api_response.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import mongoose from "mongoose";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) throw new ApiError(400, "Project ID is required");

  const tasks = await Task.find({ project: new mongoose.Types.ObjectId(projectId) })
    .populate("assignedTo", "username email avatar")
    .populate("list", "title color position")
    .sort({ position: 1 });

  return res.status(200).json(new ApiResponse(200, "Tasks fetched", tasks));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo, list: listId, labels, dueDate } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  let targetList = listId;
  if (!targetList) {
    const defaultList = await List.findOne({ project: projectId }).sort({ position: 1 });
    if (defaultList) targetList = defaultList._id;
  }

  const maxPos = await Task.findOne({ list: targetList }).sort({ position: -1 });
  const position = maxPos ? maxPos.position + 1 : 0;

  const task = await Task.create({
    title,
    description: description || "",
    project: new mongoose.Types.ObjectId(projectId),
    list: targetList ? new mongoose.Types.ObjectId(targetList) : undefined,
    position,
    status: status || "todo",
    assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    labels: labels || [],
    dueDate,
  });

  const populated = await Task.findById(task._id)
    .populate("assignedTo", "username email avatar")
    .populate("list", "title color position");

  return res.status(201).json(new ApiResponse(201, "Task created", populated));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status, title, description, assignedTo, dueDate, list, position, labels, coverColor } = req.body;

  const fields = {};
  if (status !== undefined) fields.status = status;
  if (title !== undefined) fields.title = title;
  if (description !== undefined) fields.description = description;
  if (assignedTo !== undefined) fields.assignedTo = assignedTo;
  if (dueDate !== undefined) fields.dueDate = dueDate;
  if (list !== undefined) fields.list = list;
  if (position !== undefined) fields.position = position;
  if (labels !== undefined) fields.labels = labels;
  if (coverColor !== undefined) fields.coverColor = coverColor;

  const task = await Task.findByIdAndUpdate(taskId, fields, { returnDocument: 'after' })
    .populate("assignedTo", "username email avatar")
    .populate("list", "title color position");

  if (!task) throw new ApiError(404, "Task not found");
  return res.status(200).json(new ApiResponse(200, "Task updated", task));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw new ApiError(404, "Task not found");
  return res.status(200).json(new ApiResponse(200, "Task deleted", null));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(taskId) } },
    {
      $lookup: {
        from: "users", localField: "assignedTo", foreignField: "_id", as: "assignedTo",
        pipeline: [{ $project: { _id: 1, username: 1, avatar: 1, email: 1 } }]
      }
    },
    {
      $lookup: {
        from: "lists", localField: "list", foreignField: "_id", as: "list",
        pipeline: [{ $project: { _id: 1, title: 1, color: 1, position: 1 } }]
      }
    },
    {
      $lookup: {
        from: "subtasks", localField: "_id", foreignField: "task", as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users", localField: "createdBy", foreignField: "_id", as: "createdBy",
              pipeline: [{ $project: { _id: 1, username: 1, avatar: 1 } }]
            }
          },
          { $addFields: { createdBy: { $arrayElemAt: ["$createdBy", 0] } } }
        ]
      }
    },
    { $addFields: { assignedTo: { $arrayElemAt: ["$assignedTo", 0] } } },
    { $addFields: { list: { $arrayElemAt: ["$list", 0] } } }
  ]);

  if (!task || task.length === 0) throw new ApiError(404, "Task not found");
  return res.status(200).json(new ApiResponse(200, "Task fetched", task[0]));
});

const reorderTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body;
  const ops = tasks.map((t) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(t._id) },
      update: { list: new mongoose.Types.ObjectId(t.list), position: t.position },
    },
  }));
  await Task.bulkWrite(ops);
  return res.status(200).json(new ApiResponse(200, "Tasks reordered", null));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const subtask = await SubTask.create({
    title,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });
  return res.status(201).json(new ApiResponse(201, "SubTask created", subtask));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const { title, isCompleted } = req.body;
  const fields = {};
  if (title !== undefined) fields.title = title;
  if (isCompleted !== undefined) fields.isCompleted = isCompleted;

  const subtask = await SubTask.findByIdAndUpdate(subTaskId, fields, { returnDocument: 'after' });
  if (!subtask) throw new ApiError(404, "SubTask not found");
  return res.status(200).json(new ApiResponse(200, "SubTask updated", subtask));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const subtask = await SubTask.findByIdAndDelete(subTaskId);
  if (!subtask) throw new ApiError(404, "SubTask not found");
  return res.status(200).json(new ApiResponse(200, "SubTask deleted", null));
});

export {
  getTasks, createTask, updateTask, deleteTask, getTaskById,
  reorderTasks, createSubTask, updateSubTask, deleteSubTask
};
