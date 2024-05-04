import { Router } from "express";
import { CheckController } from "../controllers/CheckController.js";

const CheckRouter = Router();

CheckRouter.get("/check-connect", CheckController);

export default CheckRouter;
