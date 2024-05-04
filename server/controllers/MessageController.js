import {
  AddMessageText,
  AudioAttachMessage,
  DocumentAttachMessage,
  GetAllMessages,
  GetInitialContactsWithMessages,
  GetTotalUnreadMessage,
  ImageAttachMessage,
  OtherFileAttachMessage,
  VideoAttachMessage,
  VocalRecordingMessage,
} from "../services/MessageService.js";

export const GetInitialContactsWithMessagesController =
  GetInitialContactsWithMessages;

export const GetTotalUnreadMessageController = GetTotalUnreadMessage;

export const GetAllMessagesController = GetAllMessages;

export const AddMessageTextController = AddMessageText;

export const AddMessageVocalRecordingController = VocalRecordingMessage;

export const AddMessageAudioController = AudioAttachMessage;

export const AddMessageVideoController = VideoAttachMessage;

export const AddMessageDocumentController = DocumentAttachMessage;

export const AddMessageImageController = ImageAttachMessage;

export const AddMessageOtherFileController = OtherFileAttachMessage;
