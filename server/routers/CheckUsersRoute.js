import { Router } from "express";
import { CheckUserController } from "../controllers/CheckUserController.js";

const CheckUsersRouter = Router();

CheckUsersRouter.post("/check-user-exists", CheckUserController);

export default CheckUsersRouter;
