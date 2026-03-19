import { Router } from "express";
import {verifyJWT,validationProjectPermission} from "../middlewares/auth.middleware.js"
import { 
     getTasks, createTask, updateTask, deleteTask, getTaskById, createSubTask, updateSubTask, deleteSubTask } from "../controllers/task.controller.js";
import { AvailableRoles, USerRoleEnum } from "../utils/constants.js";

const router = Router({mergeParams:true});

router.use(verifyJWT)

router.route("/:projectId/tasks")
.get(validationProjectPermission(AvailableRoles), getTasks)
.post(createTask);


router.route("/:projectId/tasks/:taskId")
.get(validationProjectPermission(AvailableRoles), getTaskById)
.patch(validationProjectPermission([USerRoleEnum.ADMIN]), updateTask)
.delete(validationProjectPermission([USerRoleEnum.ADMIN]), deleteTask);

router.route("/:projectId/tasks/:taskId/subtasks")
.post(validationProjectPermission([USerRoleEnum.ADMIN]), createSubTask);

router.route("/:projectId/tasks/:taskId/subtasks/:subTaskId")
.put(validationProjectPermission([USerRoleEnum.ADMIN]), updateSubTask)
.delete(validationProjectPermission([USerRoleEnum.ADMIN]), deleteSubTask);

export default router;


