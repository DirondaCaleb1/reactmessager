import React, { useEffect, useState } from "react";
import axios from "axios";
import myCrypto from "../../crypto";
import { KEY_SECRET_CRYPTO } from "../../crypto/crypto-dev.js";
import { calculateTime } from "../../utils/CalculateTime.js";
import MessageStatus from "../common/MessageStatus.jsx";
import DocumentMessage from "./DocumentMessage.jsx";
import ImageMessage from "./ImageMessage.jsx";
import OtherFileMessage from "./OtherFileMessage.jsx";
import VideoMessage from "./VideoMessage.jsx";
import VoiceMessage from "./VoiceMessage.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { GET_ALL_MESSAGES_ROUTE } from "../../utils/ApiRoutes.js";

function ChatContainer({ codeTime, codeDay, yesterday, daysOfWeek }) {
  const crypto = myCrypto(KEY_SECRET_CRYPTO);
  const [{ myUserInfo, currentChatUser, messages }] = useStateProvider();
  const [myMessages, setMyMessages] = useState(messages);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axios.get(
          `${GET_ALL_MESSAGES_ROUTE}/${myUserInfo?.id}/${currentChatUser?.id}`
        );

        const statusResponse = response.status;
        let messagesDB;

        if (statusResponse === 200) {
          messagesDB = response.data.messages;
        }
        setMyMessages(messagesDB);
      } catch (err) {
        console.log(err);
      }
    };

    if (currentChatUser?.id) {
      getMessages();
    }
  }, [currentChatUser, messages, myUserInfo]);

  return (
    <div
      className="h-[80vh] w-full relative flex-grow bg-fixed overflow-auto custom-scrollbar"
      style={{ backgroundImage: `url(./chat-bg.png)` }}
    >
      <div className="mx-10 my-10 relative bottom-0 z-40 left-0">
        <div className="flex w-full">
          <div className="flex flex-col justify-end  w-full gap-1 overflow-auto">
            {myMessages?.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === currentChatUser?.id
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                {message.type === "text" && (
                  <div
                    className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-end max-w-[45%] 
                                        ${
                                          message.senderId ===
                                          currentChatUser?.id
                                            ? "bg-incoming-background"
                                            : "bg-outgoing-background"
                                        }`}
                  >
                    <span className="break-all">
                      {crypto.decrypt(message.message)}
                    </span>
                    <div className="flex gap-1 items-end">
                      <span className="text-bubble-meta text-[11px] pt-1 min-w-[10px]">
                        {calculateTime(
                          message.createdAt,
                          codeTime,
                          codeDay,
                          yesterday,
                          daysOfWeek
                        )}
                      </span>
                      <span className="text-bubble-meta text-[11px] pt-1 min-w-[10px]">
                        {message.senderId === currentChatUser?.id ? "" : "Vous"}
                      </span>
                      <span>
                        {message.senderId === myUserInfo?.id && (
                          <MessageStatus
                            messageStatus={message.messageStatus}
                          />
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {message.type === "image" && (
                  <ImageMessage
                    message={message}
                    codeTime={codeTime}
                    codeDay={codeDay}
                    yesterday={yesterday}
                    daysOfWeek={daysOfWeek}
                  />
                )}
                {message.type === "audio" && (
                  <VoiceMessage
                    message={message}
                    codeTime={codeTime}
                    codeDay={codeDay}
                    yesterday={yesterday}
                    daysOfWeek={daysOfWeek}
                  />
                )}
                {message.type === "document" && (
                  <DocumentMessage
                    message={message}
                    codeTime={codeTime}
                    codeDay={codeDay}
                    yesterday={yesterday}
                    daysOfWeek={daysOfWeek}
                  />
                )}
                {message.type === "video" && (
                  <VideoMessage
                    message={message}
                    codeTime={codeTime}
                    codeDay={codeDay}
                    yesterday={yesterday}
                    daysOfWeek={daysOfWeek}
                  />
                )}
                {message.type === "other" && (
                  <OtherFileMessage
                    message={message}
                    codeTime={codeTime}
                    codeDay={codeDay}
                    yesterday={yesterday}
                    daysOfWeek={daysOfWeek}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
