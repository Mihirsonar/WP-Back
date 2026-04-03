import User from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import {SubTask} from "../models/subtask.model.js";
import { ApiResponse } from "../utils/Api_response.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import mongoose from "mongoose";
import { USerRoleEnum ,AvailableRoles} from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
        const project = req.params.projectId;

    if(!project) {
        throw new ApiError(400, "Project ID is required");
    }

   const tasks = await Task.find({
        project : new mongoose.Types.ObjectId(project)
    }).populate("assignedTo","name email");
    return res.status(200).json(new ApiResponse(200, "Tasks fetched successfully👍🏻👍🏻",tasks));
});

const createTask = asyncHandler(async (req, res) => {
    const { title, description, status,assignedTo } = req.body;
    const {projectId} = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const files = req.files || [];

    const attachments =files.map((file)=>{
        return {
            url: `${process.env.BASE_URL}/imgs/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        }
    })

    const task = new Task({
        title,
        description,
        project : new mongoose.Types.ObjectId(projectId),
        status,
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments: []
    });
    await task.save();

    return res.status(201).json(new ApiResponse(201, task,"Task created successfully👍🏻👍🏻",));
});

// const updateTask = asyncHandler(async (req, res) => {
//         const { taskId } = req.params;
//         const { title, description, status, assignedTo } = req.body;

//         const task = await Task.findById(taskId);
//         if (!task) {
//             throw new ApiError(404, "Task not found");
//         }
//         if (title) task.title = title;
//         if (description) task.description = description;
//         if (status) task.status = status;
//         // if (priority) task.priority = priority;
//         if (assignedTo) task.assignedTo = new mongoose.Types.ObjectId(assignedTo);

//         await task.save();
//         return res.status(200).json(new ApiResponse(200, task, "Task updated successfully👍🏻👍🏻"));
// });

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const { status, title, description, assignedTo } = req.body;

  // Build update object dynamically
  const updateFields = {};

  if (status) updateFields.status = status;
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (assignedTo) updateFields.assignedTo = assignedTo;

  const task = await Task.findByIdAndUpdate(
    taskId,
    updateFields,
    { new: true }
  ).populate("assignedTo", "username"); // ✅ important

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res.status(200).json(
    new ApiResponse(200, task, "Task updated successfully")
  );
});
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    await task.remove();
    return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully👍🏻👍🏻"));
});

const getTaskById = asyncHandler(async (req, res) => {

    const { taskId } = req.params;

    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: { $arrayElemAt: ["$createdBy", 0] }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: { $arrayElemAt: ["$assignedTo", 0] }
            }
        }
    ]);

if(!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
}
return res.status(200).json(new ApiResponse(200, task[0], "Task fetched successfully👍🏻👍🏻"));
});

const createSubTask = asyncHandler(async (req, res) => {
    const { title, description, status } = req.body;
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    const subtask = new subTask({
        title,
        description,
        status,
        task: new mongoose.Types.ObjectId(taskId)
    });
    await subtask.save();
    return res.status(201).json(new ApiResponse(201, subtask, "SubTask created successfully👍🏻👍🏻"));
});

const updateSubTask = asyncHandler(async (req, res) => {
        const { subTaskId } = req.params;
        const { title, description, status } = req.body;

        const subtask = await subTask.findById(subTaskId);
        if (!subtask) {
            throw new ApiError(404, "SubTask not found");
        }
        if (title) subtask.title = title;
        if (description) subtask.description = description;
        if (status) subtask.status = status;
        await subtask.save();
        return res.status(200).json(new ApiResponse(200, subtask, "SubTask updated successfully👍🏻👍🏻"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
    const { subTaskId } = req.params;

    const subtask = await subTask.findById(subTaskId);
    if (!subtask) {
        throw new ApiError(404, "SubTask not found");
    }

    await subtask.remove();
    return res.status(200).json(new ApiResponse(200, null, "SubTask deleted successfully👍🏻👍🏻"));
});

export { getTasks, createTask, updateTask, deleteTask, getTaskById, createSubTask, updateSubTask, deleteSubTask };
