import { Router } from "express";
import {
  AddMessageAudioController,
  AddMessageDocumentController,
  AddMessageImageController,
  AddMessageOtherFileController,
  AddMessageTextController,
  AddMessageVideoController,
  AddMessageVocalRecordingController,
  GetAllMessagesController,
  GetInitialContactsWithMessagesController,
  GetTotalUnreadMessageController,
} from "../controllers/MessageController.js";
import multer from "multer";

const MesssageRouter = Router();

MesssageRouter.get(
  "/get-initial-contacts/:from",
  GetInitialContactsWithMessagesController
);

MesssageRouter.get(
  "/get-unread-message/:from",
  GetTotalUnreadMessageController
);

MesssageRouter.get("/get-messages/:from/:to", GetAllMessagesController);

MesssageRouter.post("/add-text-message", AddMessageTextController);

const uploadVocalRecording = multer({
  dest: "/uploads/recordings",
});

MesssageRouter.post(
  "/add-recording-message",
  uploadVocalRecording.single("audio"),
  AddMessageVocalRecordingController
);

const uploadAudio = multer({
  dest: "/uploads/recordings/audio",
});

MesssageRouter.post(
  "/add-audio-message",
  uploadAudio.single("audio"),
  AddMessageAudioController
);

const uploadVideo = multer({
  dest: "/uploads/recordings/video",
});

MesssageRouter.post(
  "/add-video-message",
  uploadVideo.single("video"),
  AddMessageVideoController
);

const uploadDocument = multer({
  dest: "/uploads/recordings/documents",
});

MesssageRouter.post(
  "/add-document-message",
  uploadDocument.single("document"),
  AddMessageDocumentController
);

const uploadImage = multer({
  dest: "/uploads/images",
});

MesssageRouter.post(
  "/add-image-message",
  uploadImage.single("image"),
  AddMessageImageController
);

const uploadOther = multer({
  dest: "/uploads/recordings/others",
});

MesssageRouter.post(
  "/add-file-any-message",
  uploadOther.single("file"),
  AddMessageOtherFileController
);

export default MesssageRouter;
