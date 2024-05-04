import React from "react";
import { calculateTime } from "../../utils/CalculateTime.js";
import MessageStatus from "../common/MessageStatus.jsx";
import { BiVideo } from "react-icons/bi";
import path from "path-browserify";
import { useStateProvider } from "../../context/StateContext.jsx";
import { HOST } from "../../utils/ApiRoutes.js";
import { DownloaderFile } from "../../utils/FileSystem.js";
import { GoDownload } from "react-icons/go";
//import path from "path";

function VideoMessage({ message, codeTime, codeDay, yesterday, daysOfWeek }) {
  const videoFileArray = message.message.split("/");
  const videoFileName = videoFileArray[videoFileArray.length - 1];
  const [{ myUserInfo, currentChatUser }] = useStateProvider();

  const extName = path.extname(videoFileName);

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
      className={`p-1 rounded-lg ${
        message.senderId === currentChatUser?.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      }`}
    >
      <div className="relative">
        {extName === ".mp4" ? (
          <video
            controls={true}
            playsInline={true}
            width="300"
            height="300"
            src={`${HOST}/${message.message}`}
            className="rounded-lg"
          ></video>
        ) : (
          <div className="flex flex-col gap-1 items-center justify-center w-[250px] h-[250px] text-white">
            <BiVideo className="text-[115px] text-white" />
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
            <span className="break-words text-center text-white text-xs">
              Format de video non supporté par le navigateur. Veuillez cliquer
              ci-dessus si vous voulez le télécharger
            </span>
          </div>
        )}

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
          {extName === ".mp4" && (
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
          )}

          <span className="text-bubble-meta text-[11px] pt-1 min-w-[10px]">
            {message.senderId === currentChatUser?.id ? "" : "Vous"}
          </span>
          {message.senderId === myUserInfo?.id && (
            <MessageStatus messageStatus={message.messageStatus} />
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoMessage;
