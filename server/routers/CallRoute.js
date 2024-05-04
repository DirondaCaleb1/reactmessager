import { Router } from "express";
import {
  GetAllCallsController,
  SaveCallsController,
  UpdateCallFinishingController,
} from "../controllers/CallController.js";

const CallRouter = Router();

CallRouter.post("/save-call", SaveCallsController);

CallRouter.put("/update-finish-call", UpdateCallFinishingController);

CallRouter.get("/get-all-calls/:from", GetAllCallsController);

export default CallRouter;
