import React, { useState, useEffect } from "react";
import {
  BsFillChatLeftTextFill,
  BsThreeDotsVertical,
  BsBellFill,
} from "react-icons/bs";
import { MdCall } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ContextMenu from "../common/ContextMenu.jsx";
import axios from "axios";
import Avatar from "../common/Avatar.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { GET_TOTAL_UNREADMESSAGE_ROUTE } from "../../utils/ApiRoutes.js";

function ChatListHeader() {
  const navigate = useNavigate();
  const [{ myUserInfo, unreadMessages, messages }, dispatch] =
    useStateProvider();

  const handleAllContactsPage = () => {
    dispatch({
      type: reducerCases.SET_ALL_CONTACTS_PAGE,
    });
  };

  const handleAllCallsPage = () => {
    dispatch({
      type: reducerCases.SET_ALL_HISTORY_CALLS,
    });
  };

  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const getTotalUnreadMessage = async () => {
      try {
        const response = await axios.get(
          `${GET_TOTAL_UNREADMESSAGE_ROUTE}/${myUserInfo?.id}`
        );

        //totalUnreadMessages

        const statusResponse = response.status;

        if (statusResponse === 200) {
          const totalUnreadMessages = response.data.totalUnreadMessages;

          dispatch({
            type: reducerCases.SET_UNREAD_MESSAGE,
            unreadMessages: totalUnreadMessages,
          });
        }

        //console.log(response);
      } catch (err) {
        console.log(err);
      }
    };

    if (myUserInfo) {
      getTotalUnreadMessage();
    }
  }, [dispatch, myUserInfo, messages]);

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCoordinates({
      x: e.pageX,
      y: e.pageY,
    });
    setIsContextMenuVisible(true);
  };

  const contextMenuOptions = [
    {
      name: "Ajouter un contact",
      callback: () => {
        setIsContextMenuVisible(false);
      },
    },
    {
      name: "Déconnexion",
      callback: () => {
        setIsContextMenuVisible(false);
        dispatch({
          type: reducerCases.SET_LOGOUT_ACCESS,
          logoutAccess: true,
        });
        navigate("/deconnexion");
      },
    },
  ];

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer">
        <Avatar
          type="sm"
          image={myUserInfo?.profilePicture || "/default_avatar.png"}
          setImage={() => {}}
        />
      </div>
      <div className="flex gap-6">
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title={"Discussion"}
          onClick={handleAllContactsPage}
        />
        <MdCall
          className="text-panel-header-icon cursor-pointer text-xl"
          title={"Vos Appels"}
          onClick={handleAllCallsPage}
        />
        <>
          <div className="flex items-center justify-center">
            {unreadMessages > 0 && (
              <span className="absolute top-2 left-[24%] rounded-full bg-red-600 text-xs text-white p-1 w-max h-max flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
            <BsBellFill
              className="text-panel-header-icon cursor-pointer text-xl"
              title={"Notifications de vos discussions"}
            />
          </div>
        </>

        <>
          <BsThreeDotsVertical
            className="text-panel-header-icon cursor-pointer text-xl"
            title={"Menu"}
            onClick={(e) => showContextMenu(e)}
            id="context-opener"
          />

          {isContextMenuVisible && (
            <ContextMenu
              options={contextMenuOptions}
              cordinates={contextMenuCoordinates}
              contextMenu={isContextMenuVisible}
              setContextMenu={setIsContextMenuVisible}
            />
          )}
        </>
      </div>
    </div>
  );
}

export default ChatListHeader;
