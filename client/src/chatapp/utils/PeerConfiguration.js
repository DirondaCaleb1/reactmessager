//Public IceServer:https://wwww.metered.ca/tools/openrelay
export const IceServer = {
  iceServers: [
    {
      urls: "turn:openreplay.metered.ca:443",
      username: "openreplayproject",
      credential: "openreplayproject",
      //urls: ["stun:stun.l.google.com:19302"], // Google's public STUN server,
    },
  ],
};

const BuildPeerConnection = (socket, IceServer, peerVideoRef, roomId = 0) => {
  /*console.log({
    socket:socket,
    IceServer: IceServer,
    peerVideoRef: peerVideoRef,
    roomId:  roomId
  })*/
  const connection = new RTCPeerConnection(IceServer);

  //console.log(connection);

  //Getting the icecandidate from the IceServer
  connection.onicecandidate = (event) => {
    //console.log("ice_candidate");
    //console.log(event);
    if (event.candidate) {
      //When it receives the ice candidate, it sends the ice-candidate to the server
      socket.current.emit("ice_candidate", event.candidate, roomId);
    }
  };

  //Getting the streams
  connection.ontrack = (event) => {
    console.log("track receiving", event);
    let videoRef = peerVideoRef.current;

    if (videoRef) {
      videoRef.srcObject = event.streams[0];
    }
  };

  //console.log(connection);

  return connection;
};

export default BuildPeerConnection;
