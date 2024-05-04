import React, { useEffect } from "react";
import CallContainer from "./CallContainer.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";

function VoiceCall({ myStreamRef }) {
  const [{ voiceCall, socket, myUserInfo }] = useStateProvider();

  useEffect(() => {
    if (voiceCall.type === "out-going") {
      socket.current.emit("outgoing-voice-call", {
        to: voiceCall.id,
        from: {
          id: myUserInfo.id,
          profilePicture: myUserInfo.profilePicture,
          name: myUserInfo.name,
        },
        callType: voiceCall.callType,
      });

      socket.current.emit("outgoing-id-call", {
        to: voiceCall.id,
        idCall: voiceCall.idCall,
      });

      /*socket.current.emit("incoming-caller-exists", {
        to: voiceCall.id,
        from: myUserInfo.id,
      });
      socket.current.emit("init-incoming-call", {
        to: voiceCall.id,
        from: myUserInfo.id,
      });*/
    }
  }, [voiceCall, socket, myUserInfo]);

  return (
    <CallContainer
      data={voiceCall}
      idCallEmit={voiceCall.idCall}
      myStreamRef={myStreamRef}
    />
  );
}

export default VoiceCall;
