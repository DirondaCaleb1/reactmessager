import React, { useEffect, useRef, useState } from "react";
//import { socketInstance } from "./api/useSocket";
import { io } from "socket.io-client";

const HOST_SERVER = "http://localhost:3010";

//Public IceServer:https://wwww.metered.ca/tools/openrelay
const IceServer = {
  iceServers: [
    {
      urls: "turn:openreplay.metered.ca:443",
      username: "openreplayproject",
      credential: "openreplayproject",
      //urls: ["stun:stun.l.google.com:19302"], // Google's public STUN server,
    },
  ],
};

/*const useSocket = () => {
  const socket = useRef();
  useEffect(() => {
    if (!socket.current) {
      const socketInitializer = async () => {
        await fetch("/api/socket").then(() => {
          console.log("connected");
        });
      };

      try {
        socketInitializer();
        socket.current = true;
      } catch (err) {
        console.log(err);
      }
    }
  }, []);
};*/

function Main() {
  //Calling the useSocket function
  //useSocket();

  const [errorSetting, setErrorSetting] = useState("");
  const [id, setID] = useState(); //Your roomID
  const connectionRef = useRef(null); //The peer connection
  const [roomId, setRoomId] = useState(""); //The roomID of the other user
  const socket = useRef(); //The socket instance
  const myVideoRef = useRef(); //Your video
  const peerVideoRef = useRef(); //The other user video
  const myStreamRef = useRef(); //Our video stream
  const host = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    socket.current = io(HOST_SERVER);

    //Getting the roomId from the server
    socket.current.on("me", (roomId) => {
      console.log(roomId);
      //Saving the room Id got from the server
      setID(roomId);
    });

    //Listening for a `full` event from the server
    socket.current.on("full", () => {
      setErrorSetting("Room is filled");
    });

    //Listening for a `not-existing` event from the server
    socket.current.on("not-existing", () => {
      setErrorSetting("Room does not exist");
    });

    //Setting the host
    socket.current.on("created", () => (host.current = true));

    //Starting the audio (video) call when we receive a ready event
    socket.current.on("ready", startCall);

    // /* WebRTC */

    //Getting the offer
    socket.current.on("offer", receiveOfferHandler);

    //Getting the answer
    socket.current.on("answer", handleAnswer);

    //Getting the offer
    socket.current.on("ice-candidate", newIceCandidate);

    return () => socket.current.disconnect();
  }, [roomId]);

  useEffect(() => {
    //Getting our audio (and video)

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
  }, []);

  const peerConnection = () => {
    //Create Peer connection
    const connection = new RTCPeerConnection(IceServer);

    //Getting the icecandidate from the IceServer
    connection.onicecandidate = (event) => {
      console.log("ice_candidate");
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

    return connection;
  };

  const startCall = (roomId) => {
    console.log("call initiated", roomId);

    if (host.current) {
      //Setting the host's peerConnection
      connectionRef.current = peerConnection();

      myStreamRef.current.getTracks().forEach((element) => {
        //Storing the stream of the host in the peerConnection
        connectionRef.current.addTrack(element, myStreamRef.current);
      });

      //Creating offer
      connectionRef.current
        .createOffer()
        .then((offer) => {
          connectionRef.current.setLocalDescription(offer);

          //Sending the offer to the server
          socket.current.emit("offer", offer, roomId);
        })
        .catch((err) => {
          console.log(err);
        });

      console.log(connectionRef);
    }
  };

  const receiveOfferHandler = (offer, roomId) => {
    if (!host.current) {
      console.log("receive offer to user is not host", roomId, offer);

      //Setting the other user's peerConnection
      connectionRef.current = peerConnection();

      myStreamRef.current.getTracks().forEach((element) => {
        //Storing the stream of the other user in the peerConnection
        connectionRef.current.addTrack(element, myStreamRef.current);
      });

      //Storing the host's offer that was received
      connectionRef.current.setRemoteDescription(offer);

      //Creating offer
      connectionRef.current
        .createAnswer()
        .then((answer) => {
          connectionRef.current.setLocalDescription(answer);

          //Sending the answer to the server
          socket.current.emit("answer", answer, roomId);

          setDone(true);
        })
        .catch((err) => {
          console.log(err);
        });

      console.log(connectionRef);
    }
  };

  const handleAnswer = (answer) => {
    if (host.current) {
      console.log("receiving answer to the host", answer);
      setDone(true);
      //UseRef of connection of 
      connectionRef.current.setRemoteDescription(answer).catch((err) => {
        console.log(err);
      });
    }
  };

  const newIceCandidate = (incomingIce) => {
    console.log(
      "receiving new icecandidate for other user send the icecandiate",
      incomingIce
    );

    const candidate = new RTCIceCandidate(incomingIce);
    console.log(candidate);
    connectionRef.current.addIceCandidate(candidate).catch((err) => {
      console.log(err);
    });
  };

  const roomCreate = () => {
    console.log("create Room");

    console.log(socket);
    //Signaling the server to create a room
    socket.current.emit("create-room");
  };

  const joinRoom = () => {
    //Signaling the server to join the user to the room
    socket.current.emit("join-room", roomId);
  };

  useEffect(() => {
    console.log(done);
  }, [done]);

  return (
    <>
      <div className="container">
        <div>
          <video autoPlay ref={myVideoRef} muted playsInline width={"500px"} />
          <h1>USER</h1>
        </div>
        <div>
          <video
            autoPlay
            ref={peerVideoRef}
            muted
            playsInline
            width={"500px"}
          />
          {done && <h1>USER2</h1>}
        </div>
      </div>
      <div className="div">
        <button style={{ marginBottom: "10px" }} onClick={roomCreate}>
          Create Room
        </button>
        {id && <h2>Copy ID : {id}</h2>}
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ marginBottom: "20px" }}
        />
        <button style={{ marginBottom: "10px" }} onClick={joinRoom}>
          Join Room
        </button>
        <h1>{errorSetting}</h1>
      </div>
    </>
  );
}

export default Main;
