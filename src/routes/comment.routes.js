import { Router } from "express";
import { verifyJWT, validationProjectPermission } from "../middlewares/auth.middleware.js";
import { getComments, createComment, deleteComment } from "../controllers/comment.controller.js";
import { AvailableRoles } from "../utils/constants.js";

const router = Router({ mergeParams: true });
router.use(verifyJWT);

router.route("/:projectId/tasks/:taskId/comments")
  .get(validationProjectPermission(AvailableRoles), getComments)
  .post(validationProjectPermission(AvailableRoles), createComment);

router.route("/:projectId/tasks/:taskId/comments/:commentId")
  .delete(validationProjectPermission(AvailableRoles), deleteComment);

export default router;
