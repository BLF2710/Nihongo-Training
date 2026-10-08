import { Router } from "express";
import { getSite } from "../controllers/site.controller";

const router = Router();
router.get("/", getSite);
export default router;
