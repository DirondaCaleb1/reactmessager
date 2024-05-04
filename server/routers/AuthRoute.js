import { Router } from "express";
import {
  CheckUserController,
  DeleteProfileImageController,
  LoginController,
  OnBoardUserController,
  OnlineUserConnectContoller,
  SignupController,
  UploadProfileImageController,
} from "../controllers/AuthController.js";
import multer from "multer";

const AuthRouter = Router();

AuthRouter.post("/signup-local", SignupController);

AuthRouter.post("/login-local", LoginController);

AuthRouter.post("/check-user", CheckUserController);

const uploadProfileImage = multer({
  dest: "/uploads/images/profiles",
});

AuthRouter.post(
  "/add-profile-image",
  uploadProfileImage.single("image"),
  UploadProfileImageController
);

AuthRouter.post("/delete-profile-image", DeleteProfileImageController);

AuthRouter.put("/onboard-user-local", OnBoardUserController);

AuthRouter.post("/onboard-user-firebase", OnBoardUserController);

AuthRouter.put("/update-user-online", OnlineUserConnectContoller);

export default AuthRouter;
