import {
  DeleteProfileImage,
  LoginService,
  OnBoardUserService,
  OnlineUserConnectUpdate,
  SignupService,
  UploadProfileImage,
} from "../services/AuthService.js";
import { checkUserEmailExist } from "../services/CheckUserExistsService.js";

export const SignupController = SignupService;

export const LoginController = LoginService;

export const CheckUserController = checkUserEmailExist;

export const UploadProfileImageController = UploadProfileImage;

export const DeleteProfileImageController = DeleteProfileImage;

export const OnBoardUserController = OnBoardUserService;

export const OnlineUserConnectContoller = OnlineUserConnectUpdate;
