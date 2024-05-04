import React, { useState, useEffect } from "react";
import Image from "../common/Image.jsx";
import { MdOutlineCallEnd } from "react-icons/md";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { notification } from "antd";
import { formatLongTime } from "../../utils/FormatTime.js";
//import axios from "axios";
//import { UPDATE_FINISHING_CALLS } from "../../utils/ApiRoutes.js";
//import { calculateTime } from "../../utils/CalculateTime.js";

function CallContainer({ data, myStreamRef, idCallEmit }) {
  const [callAccepted, setCallAccepted] = useState(false);
  const [notConnect, setNotConnect] = useState(false);
  const [{ socket, connectUsers, myUserInfo }, dispatch] = useStateProvider();
  const [recordingDuration, setRecordingDuration] = useState(0);
  //const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [statusCall, setStatusCall] = useState("missed");

  //const mediaRecordRef = useRef(null);

  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => {
        dispatch({
          type: reducerCases.SET_RINGING_CALL,
          ringingCall: undefined,
        });
        setCallAccepted(true);
        console.log("accept-call");
      });
    } else {
      setTimeout(() => {
        dispatch({
          type: reducerCases.SET_RINGING_CALL,
          ringingCall: undefined,
        });
        setCallAccepted(true);
      }, 1000);
    }
  }, [data, dispatch, socket]);

  useEffect(() => {
    console.log({
      idCallEmit: idCallEmit,
      myStreamRef: myStreamRef,
    });
  }, [idCallEmit, myStreamRef]);

  const endCall = async () => {
    const id = data.id;

    //id, from, to, totalDuration, endingCallingTime, callerStatus

    try {
      if (data.callType === "voice") {
        socket.current.emit("reject-voice-call", {
          from: id,
        });
      } else {
        socket.current.emit("reject-video-call", {
          from: id,
        });
      }

      /*if (idCallEmit !== null) {
        const formData = {
          id: idCallEmit,
          from: myUserInfo?.id,
          to: data?.id,
          totalDuration: formatLongTime(totalDuration),
          endingCallingTime: Date.now(),
          callerStatus: statusCall,
        };

        const response = await axios.put(UPDATE_FINISHING_CALLS, formData);

        const statusResponse = response.status;

        if (statusResponse === 200) {
          const responseData = response.data;

          const callUpdate = responseData.callUpdate;

          socket.current.emit("send-history-call", {
            to: data.id,
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
      }

      console.log(idCallEmit);*/
    } catch (err) {
      console.log(err);
    }

    //console.log(callAccepted);

    socket.current.emit("emit-init-call", {
      to: data.id,
      from: myUserInfo?.id,
    });

    dispatch({
      type: reducerCases.SET_RINGING_CALL,
      ringingCall: undefined,
    });

    dispatch({
      type: reducerCases.END_CALL,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      if (!callAccepted && !connectUsers?.includes(data.id)) {
        setStatusCall("missed");
        setNotConnect(true);
      }
    }, 5000);
  }, [callAccepted, data.id, connectUsers]);

  useEffect(() => {
    if (!callAccepted && connectUsers?.includes(data.id)) {
      setRecordingDuration(0);
      //setCurrentPlaybackTime(0);
      setTotalDuration(0);
    }
  }, [callAccepted, data.id, connectUsers]);

  useEffect(() => {
    let interval;
    if (callAccepted && connectUsers?.includes(data.id)) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) => {
          setTotalDuration(prevDuration + 1);
          return prevDuration + 1;
        });
        //myStreamRef
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [callAccepted, data.id, connectUsers]);

  useEffect(() => {
    if (callAccepted && connectUsers?.includes(data.id)) {
      setTimeout(() => {
        setStatusCall("emiting");
      }, 1000);
    }
  }, [callAccepted, data, connectUsers, myUserInfo]);

  useEffect(() => {
    if (notConnect) {
      notification.error({
        message: "Correspondant non joinable car déconnecté",
      });
      /*const updateHistoryCall = async () => {
        //id, from, to, totalDuration, endingCallingTime, callerStatus

        try {
          if (idCallEmit !== null) {
            const formData = {
              id: idCallEmit,
              from: myUserInfo?.id,
              to: data?.id,
              totalDuration: formatLongTime(0),
              endingCallingTime: Date.now(),
              callerStatus: statusCall,
            };

            const response = await axios.put(UPDATE_FINISHING_CALLS, formData);

            const statusResponse = response.status;

            if (statusResponse === 200) {
              const responseData = response.data;

              const callUpdate = responseData.callUpdate;

              socket.current.emit("send-history-call", {
                to: data.id,
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
          }
        } catch (err) {
          console.log(err);
        }
      };

      updateHistoryCall();*/

      socket.current.emit("emit-init-call", {
        to: data.id,
        from: myUserInfo?.id,
      });

      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: undefined,
      });

      dispatch({
        type: reducerCases.END_CALL,
      });
    }
  }, [
    data?.id,
    dispatch,
    idCallEmit,
    myUserInfo?.id,
    notConnect,
    statusCall,
    socket,
  ]);

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAccepted && data.callType !== "video"
            ? "Appel en cours"
            : "Appel"}
        </span>
      </div>
      {(!callAccepted || data.callType === "audio") && (
        <div className="my-24">
          <Image
            src={data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className="rounded-full"
          />
        </div>
      )}
      {callAccepted && (
        <>
          {data.callType !== "video" && (
            <div className="text-2xl text-white text-center">
              {formatLongTime(recordingDuration)}
            </div>
          )}

          <div className="my-5 relative" id="remote-video">
            {/* Peer Video */}
            <video
              autoPlay={true}
              ref={data?.peerVideoRef}
              muted={false}
              playsInline
              hidden={data.callType === "video" ? false : true}
            />
            <div className="absolute bottom-5 right-5" id="local-audio">
              {myStreamRef && (
                <video
                  autoPlay={true}
                  ref={data?.myVideoRef}
                  muted={false}
                  playsInline
                  className={`${data.callType === "video" ? "h-28 w-32" : ""}`}
                  hidden={data.callType === "video" ? false : true}
                />
              )}
            </div>
          </div>
        </>
      )}
      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd
          className="text-3xl cursor-pointer"
          onClick={endCall}
        />
      </div>
    </div>
  );
}

export default CallContainer;
