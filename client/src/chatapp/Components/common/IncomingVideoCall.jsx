import React from "react";
import Image from "./Image.jsx";
import { notification } from "antd";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { getDevicesSupported } from "../../utils/MediaDevicesConfig.js";
import axios from "axios";
import { UPDATE_FINISHING_CALLS } from "../../utils/ApiRoutes.js";
import { formatLongTime } from "../../utils/FormatTime.js";
//import { calculateTime } from "../../utils/CalculateTime.js";

function IncomingVideoCall() {
  const [{ incomingVideoCall, myUserInfo, socket, idCall }, dispatch] =
    useStateProvider();

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

  const acceptCall = async () => {
    try {
      const configStream = await getDevicesSupported();
      const errorHandlerInputVideo = await errorHandlerByMultimediaAbsent(
        configStream,
        "videoinput"
      );

      const errorHandlerOutputAudio = await errorHandlerByMultimediaAbsent(
        configStream,
        "audiooutput"
      );

      const errorHandlerInputAudio = await errorHandlerByMultimediaAbsent(
        configStream,
        "audioinput"
      );

      if (
        errorHandlerInputVideo ||
        errorHandlerInputAudio ||
        errorHandlerOutputAudio
      ) {
        notification.error({
          message:
            "Vous ne disposez pas de camera, pour repondre à cet appel video",
        });

        const formData = {
          id: idCall,
          from: incomingVideoCall.id,
          to: myUserInfo?.id,
          totalDuration: formatLongTime(0),
          endingCallingTime: Date.now(),
          callerStatus: "missed",
        };

        const response = await axios.put(UPDATE_FINISHING_CALLS, formData);

        const statusResponse = response.status;

        if (statusResponse === 200) {
          console.log(response);

          const responseData = response.data;

          const callUpdate = responseData.callUpdate;

          socket.current.emit("send-history-call", {
            to: incomingVideoCall.id,
            from: myUserInfo?.id,
            historyCall: callUpdate,
          });

          dispatch({
            type: reducerCases.ADD_HISTORY_CALL,
            newHistoryCall: {
              ...callUpdate,
            },
          });
        } else {
          console({
            response: response,
          });
        }

        socket.current.emit("emit-init-call", {
          to: incomingVideoCall.id,
          from: myUserInfo?.id,
        });

        dispatch({
          type: reducerCases.END_CALL,
        });

        socket.current.emit("reject-video-call-byerror", {
          from: incomingVideoCall.id,
        });
      } else {
        dispatch({
          type: reducerCases.SET_VIDEO_CALL,
          videoCall: {
            ...incomingVideoCall,
            type: "in-coming",
          },
        });

        socket.current.emit("accept-incoming-call", {
          id: incomingVideoCall.id,
          to: myUserInfo?.id,
          callType: "video",
        });

        dispatch({
          type: reducerCases.SET_RINGING_CALL,
          ringingCall: undefined,
        });

        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: undefined,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const rejectCall = async () => {
    try {
      const formData = {
        id: idCall,
        from: incomingVideoCall.id,
        to: myUserInfo?.id,
        totalDuration: formatLongTime(0),
        endingCallingTime: Date.now(),
        callerStatus: "missed",
      };

      const response = await axios.put(UPDATE_FINISHING_CALLS, formData);

      const statusResponse = response.status;

      if (statusResponse === 200) {
        const responseData = response.data;

        const callUpdate = responseData.callUpdate;

        socket.current.emit("send-history-call", {
          to: incomingVideoCall.id,
          from: myUserInfo?.id,
          historyCall: callUpdate,
        });

        dispatch({
          type: reducerCases.ADD_HISTORY_CALL,
          newHistoryCall: {
            ...callUpdate,
          },
        });
      } else {
        console({
          response: response,
        });
      }

      socket.current.emit("emit-init-call", {
        to: incomingVideoCall.id,
        from: myUserInfo?.id,
      });

      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: undefined,
      });

      dispatch({
        type: reducerCases.END_CALL,
      });

      socket.current.emit("reject-video-call", { from: incomingVideoCall.id });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        <Image
          src={incomingVideoCall.profilePicture}
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div>{incomingVideoCall.name}</div>
        <div className="text-xs">Appel video entrant</div>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-500 p-1 px-3 text-sm rounded-full"
            onClick={rejectCall}
          >
            Refuser
          </button>
          <button
            className="bg-green-500 p-1 px-3 text-sm rounded-full"
            onClick={acceptCall}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingVideoCall;
