import React from "react";
import { calculateTime } from "../../utils/CalculateTime.js";
import MessageStatus from "../common/MessageStatus.jsx";
import { CgFile } from "react-icons/cg";
import { GoDownload } from "react-icons/go";
import { useStateProvider } from "../../context/StateContext.jsx";
import { HOST } from "../../utils/ApiRoutes.js";
import { DownloaderFile } from "../../utils/FileSystem.js";

function OtherMessage({ message, codeTime, codeDay, yesterday, daysOfWeek }) {
  const arrayNameFile = message.message.split("/");

  const nameFile = arrayNameFile[arrayNameFile.length - 1];

  const [{ myUserInfo, currentChatUser }] = useStateProvider();

  const handleDownload = () => {
    const data = document.getElementById("download-opener");
    data?.click();
  };

  const downloadFile = async () => {
    const urlDocument = `${HOST}/${message.message}`;
    const messageSuccess = "Téléchargement réussi";
    await DownloaderFile(urlDocument, messageSuccess);
  };

  return (
    <div
      className={`p-1 w-72 h-[155px] rounded-lg ${
        message.senderId === currentChatUser?.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      <div className="relative">
        <div className="flex flex-col items-center justify-center text-white">
          <span className="break-words">{nameFile}</span>
          <CgFile className="text-[90px]" />
          <span
            onClick={handleDownload}
            className="cursor-pointer"
            title={"Telecharger"}
          >
            Telecharger
          </span>
          <a href={`${HOST}/${message.message}`} hidden id="download-opener">
            Telecharger
          </a>
        </div>
        <div className="absolute bottom-[-5px] right-1 flex items-end gap-1">
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

export default OtherMessage;
