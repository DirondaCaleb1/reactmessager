import { Router } from "express";
import { UserController } from "../controllers/UserController.js";

const UserRouter = Router();

UserRouter.get("/user-contacts/:userId", UserController);

export default UserRouter;
