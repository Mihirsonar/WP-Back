import { Router } from "express";
import { verifyJWT, validationProjectPermission } from "../middlewares/auth.middleware.js";
import { getLists, createList, updateList, deleteList, reorderLists } from "../controllers/list.controller.js";
import { AvailableRoles, USerRoleEnum } from "../utils/constants.js";

const router = Router({ mergeParams: true });
router.use(verifyJWT);

router.route("/:projectId/lists")
  .get(validationProjectPermission(AvailableRoles), getLists)
  .post(validationProjectPermission(AvailableRoles), createList);

router.route("/:projectId/lists/reorder")
  .patch(validationProjectPermission(AvailableRoles), reorderLists);

router.route("/:projectId/lists/:listId")
  .patch(validationProjectPermission(AvailableRoles), updateList)
  .delete(validationProjectPermission([USerRoleEnum.ADMIN]), deleteList);

export default router;
