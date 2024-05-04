import React from "react";
import Image from "./Image.jsx";

function WrittingStatus({ data }) {
  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        <Image
          src={data.profilePicture}
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div className="text-xl">{data.message}</div>
      </div>
    </div>
  );
}

export default WrittingStatus;
