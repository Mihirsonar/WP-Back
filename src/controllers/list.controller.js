import { List } from "../models/list.model.js";
import { Task } from "../models/task.model.js";
import { ApiResponse } from "../utils/Api_response.js";
import { ApiError } from "../utils/Api_Err.js";
import { asyncHandler } from "../utils/async_Handler.js";
import mongoose from "mongoose";
import { DEFAULT_LISTS } from "../utils/constants.js";

const getLists = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  let lists = await List.find({ project: projectId }).sort({ position: 1 });

  // Auto-create default lists if project has none
  if (lists.length === 0) {
    const defaults = DEFAULT_LISTS.map((l) => ({
      ...l,
      project: new mongoose.Types.ObjectId(projectId),
    }));
    lists = await List.insertMany(defaults);

    // Migrate existing status-based tasks to lists
    const statusMap = {};
    for (const list of lists) {
      const key = list.title.toLowerCase().replace(/ /g, "_");
      statusMap[key] = list._id;
    }
    const orphanTasks = await Task.find({ project: projectId, list: null });
    for (let i = 0; i < orphanTasks.length; i++) {
      const t = orphanTasks[i];
      const listId = statusMap[t.status] || lists[0]._id;
      await Task.findByIdAndUpdate(t._id, { list: listId, position: i });
    }
    lists = await List.find({ project: projectId }).sort({ position: 1 });
  }

  return res.status(200).json(new ApiResponse(200, "Lists fetched", lists));
});

const createList = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, color } = req.body;
  const max = await List.findOne({ project: projectId }).sort({ position: -1 });
  const position = max ? max.position + 1 : 0;

  const list = await List.create({
    title: title || "Untitled List",
    project: new mongoose.Types.ObjectId(projectId),
    position,
    color: color || "#6366f1",
  });

  return res.status(201).json(new ApiResponse(201, "List created", list));
});

const updateList = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { title, color, position } = req.body;
  const fields = {};
  if (title !== undefined) fields.title = title;
  if (color !== undefined) fields.color = color;
  if (position !== undefined) fields.position = position;

  const list = await List.findByIdAndUpdate(listId, fields, { returnDocument: 'after' });
  if (!list) throw new ApiError(404, "List not found");
  return res.status(200).json(new ApiResponse(200, "List updated", list));
});

const deleteList = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const list = await List.findById(listId);
  if (!list) throw new ApiError(404, "List not found");

  const other = await List.findOne({ project: list.project, _id: { $ne: listId } });
  if (other) {
    await Task.updateMany({ list: listId }, { list: other._id });
  } else {
    await Task.deleteMany({ list: listId });
  }
  await List.findByIdAndDelete(listId);
  return res.status(200).json(new ApiResponse(200, "List deleted", null));
});

const reorderLists = asyncHandler(async (req, res) => {
  const { lists } = req.body;
  const ops = lists.map((l) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(l._id) },
      update: { position: l.position },
    },
  }));
  await List.bulkWrite(ops);
  return res.status(200).json(new ApiResponse(200, "Lists reordered", null));
});

export { getLists, createList, updateList, deleteList, reorderLists };
