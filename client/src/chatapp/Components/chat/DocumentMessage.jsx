import React, { useState, useEffect } from "react";
import { FcDocument } from "react-icons/fc";
import { GoDownload } from "react-icons/go";
import { CgEye } from "react-icons/cg";
import { calculateTime } from "../../utils/CalculateTime.js";
import MessageStatus from "../common/MessageStatus.jsx";
import PreviewFile from "../common/PreviewFile.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { HOST } from "../../utils/ApiRoutes.js";
import { DownloaderFile } from "../../utils/FileSystem.js";

function DocumentMessage({
  message,
  codeTime,
  codeDay,
  yesterday,
  daysOfWeek,
}) {
  const [previewDocument, setPreviewDocument] = useState(false);
  const [{ myUserInfo, currentChatUser }] = useStateProvider();

  useEffect(() => {
    const removePreview = (e) => {
      if (e.target.id !== "preview") {
        setPreviewDocument(false);
      }
    };

    document.addEventListener("click", removePreview);

    return () => {
      document.removeEventListener("click", removePreview);
    };
  }, []);

  const downloadFile = async () => {
    const urlDocument = `${HOST}/${message.message}`;
    const messageSuccess = "Téléchargement réussi";
    await DownloaderFile(urlDocument, messageSuccess);
  };

  const arrayNameFile = message.message.split("/");

  const nameFile = arrayNameFile[arrayNameFile.length - 1];

  return (
    <div
      className={`p-1 w-72 h-[190px] rounded-lg ${
        message.senderId === currentChatUser?.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      } `}
    >
      <div className="relative">
        <div className="flex flex-col items-center justify-center text-white">
          <span className="break-words">{nameFile}</span>
          <FcDocument className="text-[120px]" />
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
          <span className="text-bubble-meta rounded-full border-white bg-conversation-panel-background">
            <CgEye
              onClick={() => setPreviewDocument(true)}
              className="text-white text-2xl cursor-pointer"
              title={"Prévisualiser le document"}
              id="preview"
            />
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
      {/* ${HOST}/${message.message} */}
      {previewDocument && (
        <PreviewFile
          urlDocument={`url.doc`}
          setPreviewDocument={setPreviewDocument}
        />
      )}
    </div>
  );
}

export default DocumentMessage;
