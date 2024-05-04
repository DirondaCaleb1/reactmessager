import React from "react";
import { calculateTime } from "../../utils/CalculateTime.js";
import MessageStatus from "../common/MessageStatus.jsx";
import Image from "../common/Image.jsx";
import { GoDownload } from "react-icons/go";
import { useStateProvider } from "../../context/StateContext.jsx";
import { HOST } from "../../utils/ApiRoutes.js";
import { DownloaderFile } from "../../utils/FileSystem.js";

function ImageMessage({ message, codeTime, codeDay, yesterday, daysOfWeek }) {
  const [{ myUserInfo, currentChatUser }] = useStateProvider();

  const downloadFile = async () => {
    const urlDocument = `${HOST}/${message.message}`;
    const messageSuccess = "Téléchargement réussi";
    await DownloaderFile(urlDocument, messageSuccess);
  };

  return (
    <div
      className={`p-1 rounded-lg ${
        message.senderId === currentChatUser?.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      <div className="relative">
        <Image
          src={`${HOST}/${message.message}`}
          className="rounded-lg"
          alt="asset"
          height={300}
          width={300}
          crossOrigin="anonymous"
        />
        <div className="absolute bottom-1 right-1 flex items-end gap-1">
          <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
            {calculateTime(
              message.createdAt,
              codeTime,
              codeDay,
              yesterday,
              daysOfWeek
            )}
          </span>
          <span
            className="rounded-md border-2 border-bubble-meta cursor-pointer"
            title="Si vous voulez sauvegarder ce fichier sur votre disque dur, veuillez cliquer ci-dessus"
            id="preview_app"
          >
            <GoDownload
              className="text-3xl"
              id="preview"
              onClick={downloadFile}
            />
          </span>
          <span className="text-bubble-meta text-[11px] pt-1 min-w-[10px]">
            {message.senderId === currentChatUser?.id ? "" : "Vous"}
          </span>
          <span className="text-bubble-meta">
            {message.senderId === myUserInfo?.id && (
              <MessageStatus messageStatus={message.messageStatus} />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ImageMessage;
