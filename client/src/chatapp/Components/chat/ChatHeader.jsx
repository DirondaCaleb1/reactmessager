import React, { useState } from "react";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { notification } from "antd";
import ContextMenu from "../common/ContextMenu.jsx";
import Avatar from "../common/Avatar.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { getDevicesSupported } from "../../utils/MediaDevicesConfig.js";
//import axios from "axios";
//import { SAVE_CALLS_ROUTE } from "../../utils/ApiRoutes.js";

function ChatHeader({ myVideoRef, peerVideoRef, myStreamRef, infoCaller }) {
  const [
    {
      currentChatUser,
      myUserInfo,
      connectUsers,
      socket,
      incomingVoiceCall,
      incomingVideoCall,
    },
    dispatch,
  ] = useStateProvider();
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x: 0,
    y: 0,
  });

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCoordinates({
      x: e.pageX - 50,
      y: e.pageY + 20,
    });
    setIsContextMenuVisible(true);
  };
  //

  const contextMenuOptions = [
    {
      name: "Retour",
      callback: async () => {
        dispatch({ type: reducerCases.SET_EXIT_CHAT });
      },
    },
  ];

  const errorHandlerByMultimediaAbsent = async (
    configStream,
    kindMultimedia
  ) => {
    try {
      const presenceHandler = configStream?.includes(kindMultimedia);

      const errorHandler = !presenceHandler;

      return errorHandler;
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoiceCall = async () => {
    const configStream = await getDevicesSupported();

    try {
      const errorHandlerOutputAudio = await errorHandlerByMultimediaAbsent(
        configStream,
        "audiooutput"
      );
      const errorHandlerInputAudio = await errorHandlerByMultimediaAbsent(
        configStream,
        "audioinput"
      );

      if (incomingVoiceCall || incomingVideoCall) {
        notification.error({
          message:
            "Vous ne pouvez pas effectuer cet appel car vous avez un appel entrant en attente de réponse de votre part...",
        });
      } else {
        if (errorHandlerOutputAudio || errorHandlerInputAudio) {
          notification.error({
            message:
              "Vous ne disposez pas de microphone, pour effectuer cet appel vocal",
          });
        } else {
          socket.current.emit("emit-call", {
            id: currentChatUser?.id,
            from: myUserInfo?.id,
            connectUsers: connectUsers,
          });

          navigator.mediaDevices
            .getUserMedia({
              audio: true,
              video: false,
            })
            .then((stream) => {
              myStreamRef.current = stream;

              //Storing our audio (or video)
              let currentMyVideoRef = myVideoRef.current;

              if (currentMyVideoRef) {
                currentMyVideoRef.srcObject = stream;
              }
            })
            .catch((err) => {
              //Handle Error
              console.log(err);
            });

          /*const formData = {
            from: myUserInfo?.id,
            to: currentChatUser?.id,
            callType: "audio",
            callerStatus: "",
          };

          const response = await axios.post(SAVE_CALLS_ROUTE, formData);

          const statusResponse = response.status;

          let id;

          if (statusResponse === 200) {
            const responseData = response.data;
            id = responseData.callCreate.id;
          } else {
            id = null;
          }

          console.log(id);*/
          let id = 1;

          dispatch({
            type: reducerCases.SET_VOICE_CALL,
            voiceCall: {
              ...currentChatUser,
              type: "out-going",
              callType: "voice",
              roomId: Date.now(),
              idCall: id,
              myVideoRef: myVideoRef,
              peerVideoRef: peerVideoRef,
            },
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleVideoCall = async () => {
    //const errorHandler = errorHandlerByVideoAbsent();
    const configStream = await getDevicesSupported();

    try {
      const errorHandlerInputVideo = await errorHandlerByMultimediaAbsent(
        configStream,
        "videoinput"
      );

      const errorHandlerInputAudio = await errorHandlerByMultimediaAbsent(
        configStream,
        "audioinput"
      );

      const errorHandlerOutputAudio = await errorHandlerByMultimediaAbsent(
        configStream,
        "audiooutput"
      );

      if (
        errorHandlerInputVideo ||
        errorHandlerInputAudio ||
        errorHandlerOutputAudio
      ) {
        notification.error({
          message:
            "Vous ne disposez pas de camera, pour effectuer cet appel video",
        });
      } else {
        if (incomingVoiceCall || incomingVideoCall) {
          notification.error({
            message:
              "Vous ne pouvez pas effectuer cet appel car vous avez un appel entrant en attente de réponse de votre part...",
          });
        } else {
          socket.current.emit("emit-call", {
            id: currentChatUser?.id,
            from: myUserInfo?.id,
            connectUsers: connectUsers,
          });

          navigator.mediaDevices
            .getUserMedia({
              audio: true,
              video: true,
            })
            .then((stream) => {
              myStreamRef.current = stream;

              //Storing our audio (or video)
              let currentMyVideoRef = myVideoRef.current;

              if (currentMyVideoRef) {
                currentMyVideoRef.srcObject = stream;
              }
            })
            .catch((err) => {
              //Handle Error
              console.log(err);
            });

          /*const formData = {
            from: myUserInfo?.id,
            to: currentChatUser?.id,
            callType: "video",
            callerStatus: "",
          };

          const response = await axios.post(SAVE_CALLS_ROUTE, formData);

          const statusResponse = response.status;

          let id;

          if (statusResponse === 200) {
            const responseData = response.data;
            id = responseData.callCreate.id;
          } else {
            id = null;
          } */

          let id = 0;

          dispatch({
            type: reducerCases.SET_VIDEO_CALL,
            videoCall: {
              ...currentChatUser,
              type: "out-going",
              callType: "video",
              roomId: Date.now(),
              idCall: id,
              myVideoRef: myVideoRef,
              peerVideoRef: peerVideoRef,
            },
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleExistsCall = async (handleCall, infoCaller) => {
    if (
      (typeof infoCaller.emitCallUsers === "undefined" &&
        typeof infoCaller.recieverCallUsers === "undefined") ||
      (typeof infoCaller.emitCallUsers !== "undefined" &&
        infoCaller.emitCallUsers.length <= 0 &&
        typeof infoCaller.recieverCallUsers !== "undefined" &&
        infoCaller.recieverCallUsers.length <= 0)
    ) {
      handleCall();
    } else if (
      typeof infoCaller.emitCallUsers !== "undefined" &&
      infoCaller.emitCallUsers.length > 0 &&
      typeof infoCaller.recieverCallUsers !== "undefined" &&
      infoCaller.recieverCallUsers.length > 0
    ) {
      if (
        infoCaller.emitCallUsers.includes(currentChatUser?.id) ||
        infoCaller.recieverCallUsers.includes(currentChatUser?.id)
      ) {
        notification.error({
          message:
            "Le correspondant que vous voulez appeler, a déjà un appel en cours",
        });
      } else {
        handleCall();
      }
    }
  };

  return (
    <div className="h-16 px-4 flex justify-between items-center  bg-panel-header-background z-10">
      <div className="flex items-center justify-center gap-6">
        <Avatar
          type="sm"
          image={currentChatUser?.profilePicture || "/default_avatar.png"}
          setImage={() => {}}
        />
        <div className="flex flex-col">
          <span className="text-primary-strong ">
            {currentChatUser?.name || ""}
          </span>
          <span className="text-secondary text-sm">
            {connectUsers.includes(currentChatUser?.id)
              ? "En Ligne"
              : "Déconnecté"}
          </span>
        </div>
      </div>
      <div className="flex gap-6">
        <MdCall
          className="text-panel-header-icon cursor-pointer text-xl"
          title={"Appel Vocal"}
          onClick={() => {
            handleExistsCall(handleVoiceCall, infoCaller);
          }}
        />
        <IoVideocam
          className="text-panel-header-icon cursor-pointer text-xl"
          title={"Appel Video"}
          onClick={() => {
            handleExistsCall(handleVideoCall, infoCaller);
          }}
        />
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl"
          title={"Rechercher un message..."}
          onClick={() => {
            if (!incomingVoiceCall || !incomingVideoCall) {
              dispatch({
                type: reducerCases.SET_MESSAGE_SEARCH,
              });
            } else {
              notification.error({
                message:
                  "Vous ne pouvez pas effectuer cette action car vous avez un appel entrant en attente de réponse de votre part...",
              });
            }
          }}
        />

        <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-xl"
          title={"Menu"}
          id="context-opener"
          onClick={(e) => {
            if (!incomingVoiceCall || !incomingVideoCall) {
              showContextMenu(e);
            } else {
              notification.error({
                message:
                  "Vous ne pouvez pas effectuer cette action car vous avez un appel entrant en attente de réponse de votre part...",
              });
            }
          }}
        />
        {isContextMenuVisible && (
          <ContextMenu
            options={contextMenuOptions}
            cordinates={contextMenuCoordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
