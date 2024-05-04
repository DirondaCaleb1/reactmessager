import React, { useEffect } from "react";
import CallContainer from "./CallContainer.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";

function VideoCall({ myStreamRef }) {
  const [{ videoCall, socket, myUserInfo }] = useStateProvider();

  useEffect(() => {
    if (videoCall.type === "out-going") {
      socket.current.emit("outgoing-video-call", {
        to: videoCall.id,
        from: {
          id: myUserInfo.id,
          profilePicture: myUserInfo.profilePicture,
          name: myUserInfo.name,
          objectAudio: videoCall.objectAudio,
        },
        callType: videoCall.callType,
      });

      socket.current.emit("outgoing-id-call", {
        to: videoCall.id,
        idCall: videoCall.idCall,
      });
    }
  }, [videoCall, socket, myUserInfo]);
  return (
    <CallContainer
      data={videoCall}
      iidCallEmit={videoCall.idCall}
      myStreamRef={myStreamRef}
    />
  );
}

export default VideoCall;
