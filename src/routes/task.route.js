import { Router } from "express";
import { verifyJWT, validationProjectPermission } from "../middlewares/auth.middleware.js";
import {
  getTasks, createTask, updateTask, deleteTask, getTaskById,
  reorderTasks, createSubTask, updateSubTask, deleteSubTask
} from "../controllers/task.controller.js";
import { AvailableRoles, USerRoleEnum } from "../utils/constants.js";

const router = Router({ mergeParams: true });
router.use(verifyJWT);

router.route("/:projectId/tasks")
  .get(validationProjectPermission(AvailableRoles), getTasks)
  .post(validationProjectPermission(AvailableRoles), createTask);

router.route("/:projectId/tasks/reorder")
  .patch(validationProjectPermission(AvailableRoles), reorderTasks);

router.route("/:projectId/tasks/:taskId")
  .get(validationProjectPermission(AvailableRoles), getTaskById)
  .patch(validationProjectPermission(AvailableRoles), updateTask)
  .delete(validationProjectPermission([USerRoleEnum.ADMIN, USerRoleEnum.PROJECT_ADMIN]), deleteTask);

router.route("/:projectId/tasks/:taskId/subtasks")
  .post(validationProjectPermission(AvailableRoles), createSubTask);

router.route("/:projectId/tasks/:taskId/subtasks/:subTaskId")
  .patch(validationProjectPermission(AvailableRoles), updateSubTask)
  .delete(validationProjectPermission(AvailableRoles), deleteSubTask);

export default router;
