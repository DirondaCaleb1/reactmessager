import React from "react";
import Image from "./Image.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { getDevicesSupported } from "../../utils/MediaDevicesConfig.js";
import { notification } from "antd";
//import axios from "axios";
//import { UPDATE_FINISHING_CALLS } from "../../utils/ApiRoutes.js";
//import { formatLongTime } from "../../utils/FormatTime.js";
//import { calculateTime } from "../../utils/CalculateTime.js";

function IncomingVoiceCall() {
  //, idCall
  const [{ incomingVoiceCall, myUserInfo, socket }, dispatch] =
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

      const errorHandlerOutputAudio = await errorHandlerByMultimediaAbsent(
        configStream,
        "audiooutput"
      );

      const errorHandlerInputAudio = await errorHandlerByMultimediaAbsent(
        configStream,
        "audioinput"
      );

      if (errorHandlerOutputAudio || errorHandlerInputAudio) {
        notification.error({
          message:
            "Vous ne disposez pas de microphone, pour effectuer cet appel vocal",
        });

        /*const formData = {
          id: idCall,
          from: incomingVoiceCall.id,
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
            to: incomingVoiceCall.id,
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
        }*/

        socket.current.emit("emit-init-call", {
          to: incomingVoiceCall.id,
          from: myUserInfo?.id,
        });

        dispatch({
          type: reducerCases.END_CALL,
        });

        socket.current.emit("reject-voice-call-byerror", {
          from: incomingVoiceCall.id,
        });
      } else {
        dispatch({
          type: reducerCases.SET_VOICE_CALL,
          voiceCall: {
            ...incomingVoiceCall,
            type: "in-coming",
          },
        });

        socket.current.emit("accept-incoming-call", {
          id: incomingVoiceCall.id,
          to: myUserInfo?.id,
          callType: "voice",
        });

        dispatch({
          type: reducerCases.SET_RINGING_CALL,
          ringingCall: undefined,
        });

        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: undefined,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const rejectCall = async () => {
    try {
      /*const formData = {
        id: idCall,
        from: incomingVoiceCall.id,
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
          to: incomingVoiceCall.id,
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
      }*/

      socket.current.emit("emit-init-call", {
        to: myUserInfo?.id,
        from: incomingVoiceCall.id,
      });

      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: undefined,
      });

      dispatch({
        type: reducerCases.END_CALL,
      });

      socket.current.emit("reject-voice-call", { from: incomingVoiceCall.id });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        <Image
          src={incomingVoiceCall.profilePicture}
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full"
        />
      </div>
      <div>
        <div>{incomingVoiceCall.name}</div>
        <div className="text-xs">Appel vocal entrant</div>
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

export default IncomingVoiceCall;
