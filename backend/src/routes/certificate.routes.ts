import { Router, type Router as ExpressRouter } from "express";
import { verifyCertificate } from "../controllers/ai.controller.js";

const router: ExpressRouter = Router();

router.get("/verify/:certificateNumber", verifyCertificate);

export default router;
