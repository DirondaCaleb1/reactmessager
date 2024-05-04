import React from "react";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { calculateTime } from "../../utils/CalculateTime.js";
import Avatar from "../common/Avatar.jsx";
import { GoArrowUpRight, GoArrowDownLeft } from "react-icons/go";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BsFillChatLeftTextFill } from "react-icons/bs";
import axios from "axios";
import { SAVE_CALLS_ROUTE } from "../../utils/ApiRoutes.js";
import { getDevicesSupported } from "../../utils/MediaDevicesConfig.js";
import { notification } from "antd";

function CallListItem({
  data,
  callTimes,
  codeTime,
  codeDay,
  yesterday,
  daysOfWeek,
  myVideoRef,
  peerVideoRef,
  infoCaller,
}) {
  const [
    { myUserInfo, socket, incomingVoiceCall, incomingVideoCall },
    dispatch,
  ] = useStateProvider();

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

  const otherUserInfos = (id) => {
    if (data?.incomingUserId !== id) {
      return {
        id: data?.incomingUserId,
        name: data?.incomingUserName,
        about: data?.incomingUserAbout,
        profilePicture: data?.incomingUserProfilePicture,
        email: data?.incomingUserEmail,
      };
    } else if (data?.outgoingUserId !== id) {
      return {
        id: data?.outgoingUserId,
        name: data?.outgoingUserName,
        about: data?.outgoingUserAbout,
        profilePicture: data?.outgoingUserProfilePcture,
        email: data?.outgoingUserEmail,
      };
    } else {
      return {
        id: "",
        name: "",
        about: "",
        profilePicture: "",
        email: "",
      };
    }
  };

  const handleVoiceCall = async () => {
    const configStream = await getDevicesSupported();

    const currentChatUser = otherUserInfos(myUserInfo?.id);
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
          });

          const formData = {
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

    const currentChatUser = otherUserInfos(myUserInfo?.id);

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
          });

          const formData = {
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
          }

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

  const chatView = async () => {
    const currentChatUser = otherUserInfos(myUserInfo?.id);

    dispatch({
      type: reducerCases.CHANGE_CURRENT_CHAT_USER,
      user: { ...currentChatUser },
    });

    dispatch({ type: reducerCases.SET_ALL_HISTORY_CALLS });
  };

  const handleExistsCall = async (handleCall, infoCaller) => {
    const currentChatUser = otherUserInfos(myUserInfo?.id);

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
    <div
      className={`flex flex-row items-center  hover:bg-background-default-hover `}
      onClick={() => {
        console.log(infoCaller);
      }}
    >
      <div className="min-w-fit px-5 mt-2 pt-3 pb-1">
        <Avatar
          type="sm"
          image={
            otherUserInfos(myUserInfo?.id).profilePicture !== ""
              ? otherUserInfos(myUserInfo?.id).profilePicture
              : "/default_avatar.png"
          }
          setImage={() => {}}
        />
      </div>
      <div className="w-[80%] mt-4 pr-2 min-w-max flex flex-row justify-between items-center gap-3">
        <div className="flex flex-col gap-4">
          <span className="text-white">
            {otherUserInfos(myUserInfo?.id).name !== ""
              ? otherUserInfos(myUserInfo?.id).name
              : ""}
          </span>
          <div>
            {data?.incomingUserId === myUserInfo?.id && (
              <GoArrowDownLeft
                className={`${
                  data?.callerStatus === "emiting"
                    ? "text-green-500"
                    : "text-red-500"
                } text-xl`}
              />
            )}

            {data?.outgoingUserId === myUserInfo?.id && (
              <GoArrowUpRight
                className={`${
                  data?.callerStatus === "emiting"
                    ? "text-green-500"
                    : "text-red-500"
                } text-xl`}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-white">
            {data?.typeCall === "audio" ? "Appel Vocal" : "Appel Video"}
          </span>
        </div>
        <div
          className={`flex flex-col gap-2 items-center ${
            data?.callerStatus !== "emiting"
              ? " justify-center"
              : "justify-between"
          }`}
        >
          <span className="text-xs text-white cut-words">
            {calculateTime(
              data?.startCallingTime,
              codeTime,
              codeDay,
              yesterday,
              daysOfWeek
            )}
          </span>

          <span className="text-xs text-white">
            {data?.callerStatus === "emiting" ? data?.totalDuration : ""}
          </span>
        </div>

        <div className="flex flex-col gap-3 items-center justify-between">
          <span
            className="border-2 border-teal-light rounded-full w-max h-max text-xs text-white bg-green-500"
            title="Nombre d'appels"
          >
            {callTimes}
          </span>
          <div className="flex flex-row gap-2">
            <MdCall
              className={`text-green-500 text-xl cursor-pointer`}
              title="Appel Vocal"
              onClick={() => {
                handleExistsCall(handleVoiceCall, infoCaller);
              }}
            />
            <IoVideocam
              className={`text-blue-500 text-xl cursor-pointer`}
              title="Appel Video"
              onClick={() => {
                handleExistsCall(handleVideoCall, infoCaller);
              }}
            />
            <BsFillChatLeftTextFill
              className={`text-white text-xl cursor-pointer`}
              title="Chat"
              onClick={chatView}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallListItem;
