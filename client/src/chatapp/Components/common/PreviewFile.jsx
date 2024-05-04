import React from "react";
import { IoClose } from "react-icons/io5";

function PreviewFile({ urlDocument, setPreviewDocument }) {
  const arrayNameFile = urlDocument.split("/");

  const nameFile = arrayNameFile[arrayNameFile.length - 1];

  return (
    <div className="fixed top-0 left-0 max-h-[80vh] max-w-[80vw] h-full w-full ml-[125px] mt-11 flex justify-center items-center bg-conversation-panel-background shadow-md rounded-md">
      <div className="flex flex-col h-full w-full gap-2 rounded-lg p-4">
        <div
          className="pt-2 pe-2 cursor-pointer flex items-end justify-end"
          onClick={() => setPreviewDocument(false)}
        >
          <IoClose className="w-10 h-10 cursor-pointer text-white" />
        </div>
        <div className="flex justify-center items-center">
          <iframe
            id="frame-document"
            title={nameFile}
            width="1050"
            height="450"
            src={urlDocument}
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default PreviewFile;
