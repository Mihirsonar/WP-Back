import { Router } from "express";
import { getAllusers } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.get("/",verifyJWT,getAllusers);

export default router;