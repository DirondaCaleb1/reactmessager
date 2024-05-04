import React from "react";
//, { useEffect }
import { FaCamera, FaMicrophone } from "react-icons/fa";
import { FcDocument } from "react-icons/fc";
import { BiVideo } from "react-icons/bi";
import { CgFile } from "react-icons/cg";
import myCrypto from "../../crypto";
import { KEY_SECRET_CRYPTO } from "../../crypto/crypto-dev.js";
import { calculateTime } from "../../utils/CalculateTime.js";
import Avatar from "../common/Avatar.jsx";
import MessageStatus from "../common/MessageStatus.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";

function ChatListItem({
  data,
  codeTime,
  codeDay,
  yesterday,
  daysOfWeek,
  isContactPage = false,
}) {
  const crypto = myCrypto(KEY_SECRET_CRYPTO);
  const [{ myUserInfo }, dispatch] = useStateProvider();

  const handleContactClick = () => {
    //if (currentChatUser?.id === data?.id) {
    //Display the messages list of users
    if (!isContactPage) {
      dispatch({
        type: reducerCases.CHANGE_CURRENT_CHAT_USER,
        user: {
          name: data.name,
          about: data.about,
          profilePicture: data.profilePicture,
          email: data.email,
          id:
            myUserInfo?.id === data.senderId ? data.recieverId : data.senderId,
        },
      });
    } else {
      //Display the list of users
      dispatch({
        type: reducerCases.CHANGE_CURRENT_CHAT_USER,
        user: { ...data },
      });
      dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
    }
  };

  return (
    <div
      className={`flex flex-row items-center cursor-pointer  hover:bg-background-default-hover `}
      onClick={handleContactClick}
    >
      <div className="min-w-fit px-5 mt-2 pt-3 pb-1">
        <Avatar
          type="sm"
          image={data?.profilePicture || "/default_avatar.png"}
          setImage={() => {}}
        />
      </div>
      <div className=" w-[80%] mt-3 pr-2 min-w-max flex flex-col justify-center">
        <div className="flex justify-between">
          <div>
            <span className="text-white">{data?.name || ""}</span>
          </div>
          {isContactPage === false && (
            <div>
              <span
                className={`${
                  data?.totalUnreadMessages > 0
                    ? "text-secondary"
                    : "text-icon-green"
                } text-sm`}
              >
                {calculateTime(
                  data?.createdAt,
                  codeTime,
                  codeDay,
                  yesterday,
                  daysOfWeek
                )}
              </span>
            </div>
          )}
        </div>
        <div className="flex border-b border-conversation-border pb-2 pt-1 px-2">
          <div className="flex justify-between w-full">
            <span className="text-secondary line-clamp-1 text-sm">
              {isContactPage ? (
                data?.about || "\u00A0"
              ) : (
                <div className="flex items-center gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]">
                  {data?.senderId === myUserInfo?.id && (
                    <MessageStatus messageStatus={data?.messageStatus} />
                  )}
                  {data?.type === "text" && (
                    <span className="truncate">
                      {crypto.decrypt(data?.message)}
                    </span>
                  )}
                  {data?.type === "audio" && (
                    <span className="flex items-center gap-1">
                      <FaMicrophone className="text-panel-header-icon" />
                      Audio
                    </span>
                  )}
                  {data?.type === "image" && (
                    <span className="flex items-center gap-1">
                      <FaCamera className="text-panel-header-icon" />
                      Image
                    </span>
                  )}
                  {data?.type === "document" && (
                    <span className="flex items-center gap-1">
                      <FcDocument className="text-panel-header-icon" />
                      Document
                    </span>
                  )}
                  {data?.type === "video" && (
                    <span className="flex items-center gap-1">
                      <BiVideo className="text-panel-header-icon" />
                      Video
                    </span>
                  )}
                  {data?.type === "other" && (
                    <span className="flex items-center gap-1">
                      <CgFile className="text-panel-header-icon" />
                      Autre fichier
                    </span>
                  )}
                </div>
              )}
            </span>
            {data?.totalUnreadMessages > 0 && (
              <span className="bg-icon-green px-[5px] rounded-full text-sm">
                {data?.totalUnreadMessages}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatListItem;
