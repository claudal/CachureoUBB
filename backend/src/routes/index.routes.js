import { Router } from "express";
import { funcionPrueba } from "../controllers/test.js";

export const router = Router();

router.get("/test/",funcionPrueba);