import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import {verifyJWT,validationProjectPermission} from "../middlewares/auth.middleware.js"
import { addMemberValidation,createProjectValidation } from "../validatiors/index.js";
import { 
    getProjects,
    deleteMember,
    updateMemberRole,
    getProjectMembers,
    addMemberToProject,
    deleteProject,
    updateProject,
    creatProject,
    getProjectsById} from "../controllers/project.controller.js";
import { AvailableRoles, USerRoleEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT)

router.route("/")
.get(getProjects)
.post(createProjectValidation(), validate, creatProject);

router.route("/:projectId")
.get(validationProjectPermission(AvailableRoles), getProjectsById)
.put(
  validationProjectPermission([USerRoleEnum.ADMIN]),
  createProjectValidation(),
  validate,
  updateProject
)
.delete(validationProjectPermission([USerRoleEnum.ADMIN]), deleteProject);

router.route("/:projectId/members")
.get(validationProjectPermission(AvailableRoles), getProjectMembers)
.post(
  validationProjectPermission([USerRoleEnum.ADMIN]),
  addMemberValidation(),
  validate,
  addMemberToProject
);

router.route("/:projectId/members/:userId")
.delete(validationProjectPermission([USerRoleEnum.ADMIN]), deleteMember)
.put(
  validationProjectPermission([USerRoleEnum.ADMIN]),
  addMemberValidation,
  validate,
  updateMemberRole
);
export default router;