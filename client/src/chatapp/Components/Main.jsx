import React, { useEffect, useState, useRef } from "react";
import { constantsFormatTime } from "../utils/constantsApp.js";
import ChatList from "./chatlist/ChatList.jsx";
import Empty from "./Empty.jsx";
import Chat from "./chat/Chat.jsx";
import SearchMessage from "./chat/SearchMessage.jsx";
import IncomingVoiceCall from "./common/IncomingVoiceCall.jsx";
import IncomingVideoCall from "./common/IncomingVideoCall.jsx";
import VoiceCall from "./call/VoiceCall.jsx";
import VideoCall from "./call/VideoCall.jsx";
import CheckConnect from "./common/CheckConnect.jsx";
import {
  CHECK_SYSTEM_CONNECT_ROUTE,
  CHECK_USER_EXISTS_ROUTE,
  HOST,
} from "../utils/ApiRoutes.js";
import axios from "axios";
import { notification } from "antd";
import { useStateProvider } from "../context/StateContext.jsx";
import { reducerCases } from "../context/constants.js";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/FirebaseConfig.js";
import { onAuthStateChangedAll } from "../utils/StateChanged.js";
import { getEmailAndLoginMode } from "../utils/TokenUtils.js";
import { checkEmailError } from "../utils/errors/Error.js";
import { io } from "socket.io-client";
import WrittingStatus from "./common/WrittingStatus.jsx";
import BuildPeerConnection, { IceServer } from "../utils/PeerConfiguration.js";

function Main() {
  const timeConstansts = {
    codeTime: constantsFormatTime.codeTime,
    codeDay: constantsFormatTime.codeDay,
    yesterday: constantsFormatTime.yesterday,
    daysOfWeek: constantsFormatTime.weekDayLetter,
  };
  const [notErrorConfig, setNotErrorConfig] = useState(false);
  const [everOneError, setEverOneError] = useState(false);
  const [socketEvent, setSocketEvent] = useState(false);
  const [writtingStatus, setWrittingStatus] = useState({
    message: "",
    profilePicture: "",
    isWritting: false,
  });

  //const crypto = myCrypto(KEY_SECRET_CRYPTO);
  const [
    {
      myUserInfo,
      currentChatUser,
      messagesSearch,
      incomingVoiceCall,
      ringingCall,
      voiceCall,
      videoCall,
      incomingVideoCall,
    },
    dispatch,
  ] = useStateProvider();
  const token = localStorage.getItem("token");
  const loginWithGoogleAccount = getEmailAndLoginMode(token, myUserInfo);
  const [redirectLogin, setRedirectLogin] = useState(false);
  const connectionRef = useRef(null); //The peer connection
  const socket = useRef(); //Socket
  const myVideoRef = useRef(); //Your video
  const peerVideoRef = useRef(); //The other user video
  const myStreamRef = useRef(); //Our video stream
  const [infoCaller, setInfoCaller] = useState({
    emitCallUsers: undefined,
    recieverCallUsers: undefined,
  });

  useEffect(() => {
    const checkControl = async () => {
      try {
        const response = await axios.get(CHECK_SYSTEM_CONNECT_ROUTE);

        if (response.status === 200 || response.status === 201) {
          setNotErrorConfig(response.data.connected);
        }
      } catch (err) {
        setNotErrorConfig(false);
        console.log(err);
      }
    };

    if (typeof myUserInfo === "undefined") {
      checkControl();
    }
  }, [myUserInfo]);

  useEffect(() => {
    if (notErrorConfig === true) {
      setEverOneError(false);
      notification.success({
        message: "Chargement des paramètres de configuration réussi",
      });
    } else if (notErrorConfig === false) {
      setEverOneError(true);
    }
  }, [notErrorConfig]);

  useEffect(() => {
    console.log(redirectLogin);
  }, [redirectLogin]);

  onAuthStateChangedAll(
    loginWithGoogleAccount.loginWithAccountGoogle,
    async () => {
      if (!myUserInfo && notErrorConfig === true) {
        try {
          const email = loginWithGoogleAccount.email;
          const fieldEmail = "email";
          const errorHandledObject = {
            empty: "Veuillez obligatoirement fournir une adresse Email",
            noMatch:
              "L'adresse Email que vous avez fourni possède des caractères invalides (L'adresse email doit posséder les caractères @ et .)",
            noError: "",
          };

          const errorHandled = checkEmailError(email, errorHandledObject);

          const formDataEmail = {
            email: email,
            fieldEmail: fieldEmail,
          };

          const response = await axios.post(
            CHECK_USER_EXISTS_ROUTE,
            formDataEmail
          );

          const status = response.status;
          const message = response.data.message;
          const userFound = response.data.user;

          if (message !== "" && errorHandled !== "") {
            dispatch({
              type: reducerCases.SET_MY_USER_INFO,
              myUserInfo: undefined,
            });
          } else if (errorHandled === "") {
            if (
              status === 201 &&
              message === "Identifiants invalides ou incorrectes" &&
              userFound === null
            ) {
              dispatch({
                type: reducerCases.SET_MY_USER_INFO,
                myUserInfo: undefined,
              });
            } else if (
              status === 200 &&
              message === "Utilisateur trouvé" &&
              userFound !== null
            ) {
              dispatch({
                type: reducerCases.SET_MY_USER_INFO,
                myUserInfo: {
                  id: userFound.id,
                  name: userFound.name,
                  email: userFound.email,
                  status: userFound.about,
                  profilePicture: userFound.profilePicture,
                  loginWithAccountGoogle:
                    loginWithGoogleAccount.loginWithAccountGoogle,
                },
              });
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
    () => {
      onAuthStateChanged(firebaseAuth, async (currentUser) => {
        if (!currentUser) {
          setRedirectLogin(true);
        }

        if (!myUserInfo && currentUser?.email && notErrorConfig === true) {
          try {
            const email =
              loginWithGoogleAccount.email !== "" &&
              loginWithGoogleAccount.email === currentUser?.email
                ? currentUser?.email
                : loginWithGoogleAccount.email;
            const fieldEmail = "email";
            const errorHandledObject = {
              empty: "Veuillez obligatoirement fournir une adresse Email",
              noMatch:
                "L'adresse Email que vous avez fourni possède des caractères invalides (L'adresse email doit posséder les caractères @ et .)",
              noError: "",
            };

            const errorHandled = checkEmailError(email, errorHandledObject);

            const formDataEmail = {
              email: email,
              fieldEmail: fieldEmail,
            };

            const response = await axios.post(
              CHECK_USER_EXISTS_ROUTE,
              formDataEmail
            );

            const status = response.status;
            const message = response.data.message;
            const userFound = response.data.user;

            if (message !== "" && errorHandled !== "") {
              dispatch({
                type: reducerCases.SET_MY_USER_INFO,
                myUserInfo: undefined,
              });
            } else if (errorHandled === "") {
              if (
                status === 201 &&
                message === "Identifiants invalides ou incorrectes" &&
                userFound === null
              ) {
                dispatch({
                  type: reducerCases.SET_MY_USER_INFO,
                  myUserInfo: undefined,
                });
              } else if (
                status === 200 &&
                message === "Utilisateur trouvé" &&
                userFound !== null
              ) {
                dispatch({
                  type: reducerCases.SET_MY_USER_INFO,
                  myUserInfo: {
                    id: userFound.id,
                    name: userFound.name,
                    email: userFound.email,
                    status: userFound.about,
                    profilePicture: userFound.profilePicture,
                    loginWithAccountGoogle:
                      loginWithGoogleAccount.loginWithAccountGoogle,
                  },
                });
              }
            }
          } catch (err) {
            console.log(err);
          }
        }
      });
    },
    setRedirectLogin
  );

  //Defines socket and Actions

  useEffect(() => {
    if (myUserInfo) {
      socket.current = io(HOST);
      socket.current.emit("add-user", myUserInfo?.id);
      dispatch({
        type: reducerCases.SET_SOCKET,
        socket,
      });
    }
  }, [dispatch, myUserInfo]);

  useEffect(() => {
    if (myUserInfo) {
      socket.current.emit(
        "auth-online-offline",
        myUserInfo?.id,
        myUserInfo?.isOnline
      );
    }
  }, [socket, myUserInfo]);

  useEffect(() => {
    if (socket.current && !socketEvent) {
      socket.current.on("msg-recieve", (data) => {
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...data.message,
          },
        });
      });

      socket.current.on("history-call-recieve", ({ from, historyCall }) => {
        dispatch({
          type: reducerCases.ADD_HISTORY_CALL,
          newHistoryCall: {
            ...historyCall,
          },
        });
      });

      socket.current.on("receive-writing-status", (data) => {
        setWrittingStatus({
          ...writtingStatus,
          message: data.message,
          profilePicture: data.profilePicture,
          isWritting: true,
        });
      });

      socket.current.on("finishing-writting-status", () => {
        setWrittingStatus({
          ...writtingStatus,
          message: "",
          profilePicture: "",
          isWritting: false,
        });
      });

      socket.current.on("unread-messages-view", () => {
        console.log("unread");
      });

      //

      setSocketEvent(true);
    }
  }, [dispatch, socketEvent, writtingStatus]);

  useEffect(() => {
    socket.current?.on("users-online", ({ connectUsers }) => {
      //console.log(connectUsers);
      dispatch({
        type: reducerCases.SET_CONNECT_USERS,
        connectUsers: connectUsers,
      });
    });
  }, [dispatch, socket]);

  useEffect(() => {
    socket.current?.on("online-users", ({ onlineUsers }) => {
      //console.log(onlineUsers);
      dispatch({
        type: reducerCases.SET_ONLINE_USERS,
        onlineUsers,
      });
    });

    socket.current?.on("incoming-id-call", ({ idCall }) => {
      dispatch({
        type: reducerCases.SET_ID_CALL,
        idCall: idCall,
      });
    });

    socket.current?.on("incoming-voice-call", ({ from, callType }) => {
      dispatch({
        type: reducerCases.SET_INCOMING_VOICE_CALL,
        incomingVoiceCall: {
          ...from,
          callType,
        },
      });

      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: true,
      });
    });

    /*Listen the evenment "incoming-video-call" */
    socket.current?.on("incoming-video-call", ({ from, callType }) => {
      dispatch({
        type: reducerCases.SET_INCOMING_VIDEO_CALL,
        incomingVideoCall: {
          ...from,
          callType,
        },
      });

      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: true,
      });
    });

    socket.current?.on("voice-call-rejected", () => {
      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: undefined,
      });
      dispatch({
        type: reducerCases.END_CALL,
      });
    });

    socket.current?.on("video-call-rejected", () => {
      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: undefined,
      });
      dispatch({
        type: reducerCases.END_CALL,
      });
    });

    socket.current?.on("voice-call-rejected-byerror", () => {
      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: undefined,
      });
      dispatch({
        type: reducerCases.END_CALL,
      });
    });

    socket.current?.on("video-call-rejected-byerror", () => {
      dispatch({
        type: reducerCases.SET_RINGING_CALL,
        ringingCall: undefined,
      });
      dispatch({
        type: reducerCases.END_CALL,
      });
    });
  }, [
    socket,
    incomingVideoCall,
    incomingVoiceCall,
    videoCall,
    voiceCall,
    dispatch,
  ]);

  useEffect(() => {
    socket.current?.on(
      "receive-call",
      (id, from, emitCallUser, recieveCallUser) => {
        setInfoCaller({
          ...infoCaller,
          emitCallUsers: emitCallUser,
          recieverCallUsers: recieveCallUser,
        });
        /*console.log({
          to: id,
          from: from,
          emitCallUser: emitCallUser,
          recieveCallUser: recieveCallUser,
        });*/
        //console.log(id);
        //console.log(myUserInfo);
        //console.log(from);
        //id= currentChatUser
        //connectUsers: connectUsers,
        connectionRef.current = BuildPeerConnection(
          socket,
          IceServer,
          peerVideoRef,
          id
        );

        if (from === myUserInfo?.id) {
          console.log(connectionRef);
        }
      }
    );

    socket.current?.on("init-call-id", (emitCallUser, recieveCallUser) => {
      /*console.log({
          to: to,
          from: from,
          emitCallUser: emitCallUser,
          recieveCallUser: recieveCallUser,
        });*/

      setInfoCaller({
        ...infoCaller,
        emitCallUsers: emitCallUser,
        recieverCallUsers: recieveCallUser,
      });
    });
  }, [socket, myUserInfo, dispatch, infoCaller]);

  useEffect(() => {
    console.log(infoCaller);
  }, [infoCaller]);

  useEffect(() => {
    socket.current?.on("handle-offer", (data) => {
      //console.log("offer creates by user emiting calling");
      /*console.log({
        myStreamRef: myStreamRef,
        connectionRef: connectionRef,
      });*/

      console.log(myStreamRef);

      myStreamRef.current?.getTracks().forEach((element) => {
        //Storing the stream of the host in the connectionRef
        //connectionRef
        connectionRef.current?.addTrack(element, myStreamRef.current);
      });

      connectionRef.current
        ?.createOffer()
        .then((offer) => {
          //console.log(offer);

          connectionRef.current?.setLocalDescription(offer);

          socket.current.emit(
            "offer",
            offer,
            data.to,
            data.callType,
            data.from
          );
        })
        .catch((err) => {
          console.log(err);
        });

      //console.log(connectionRef);
    });
  }, [myStreamRef, socket, connectionRef]);

  useEffect(() => {
    socket.current?.on("open-peer-stream", (callType) => {
      //Getting our audio (and video)

      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: callType === "voice" ? false : true,
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
    });
  }, [socket]);

  useEffect(() => {
    //Getting the offer
    socket.current?.on("offer", (offer, idReceive) => {
      //console.log("receive offer to user is not host", idReceive, offer);
      connectionRef.current = BuildPeerConnection(
        socket,
        IceServer,
        peerVideoRef,
        idReceive
      );

      myStreamRef.current?.getTracks().forEach((element) => {
        //Storing the stream of the other user in the peerConnection
        connectionRef.current?.addTrack(element, myStreamRef.current);
      });

      connectionRef.current?.setRemoteDescription(offer);

      connectionRef.current
        ?.createAnswer()
        .then((answer) => {
          connectionRef.current?.setLocalDescription(answer);

          //Sending the answer to the server
          socket.current.emit("answer", answer, idReceive);
        })
        .catch((err) => {
          console.log(err);
        });

      console.log(connectionRef);
    });
  }, [myStreamRef, socket, myUserInfo]);

  useEffect(() => {
    socket.current?.on("ice-candidate", (incomingIce) => {
      console.log(
        "receiving new icecandidate for other user send the icecandiate",
        incomingIce
      );

      const candidate = new RTCIceCandidate(incomingIce);
      console.log(candidate);
      connectionRef.current?.addIceCandidate(candidate).catch((err) => {
        console.log(err);
      });
    });
  }, [connectionRef, socket]);

  useEffect(() => {
    socket.current?.on("answer", (answer) => {
      //console.log("receiving answer to the host that emit call", answer);

      connectionRef.current?.setRemoteDescription(answer).catch((err) => {
        console.log(err);
      });
    });
  }, [connectionRef, socket]);

  return (
    <>
      {!myUserInfo && <CheckConnect everOneError={everOneError} />}
      {writtingStatus.isWritting === true && (
        <WrittingStatus data={writtingStatus} />
      )}
      {incomingVoiceCall && <IncomingVoiceCall />}
      {voiceCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VoiceCall myStreamRef={myStreamRef} />
        </div>
      )}
      {ringingCall && (
        <audio src="/call-sound.mp3" hidden autoPlay loop playsInline></audio>
      )}
      {incomingVideoCall && <IncomingVideoCall />}
      {videoCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VideoCall myStreamRef={myStreamRef} />
        </div>
      )}
      {!videoCall && !voiceCall && (
        <div className="flex flex-row h-screen w-screen max-h-screen max-w-full overflow-auto">
          <ChatList
            codeDay={timeConstansts.codeDay}
            codeTime={timeConstansts.codeTime}
            daysOfWeek={timeConstansts.daysOfWeek}
            yesterday={timeConstansts.yesterday}
            myVideoRef={myVideoRef}
            peerVideoRef={peerVideoRef}
            infoCaller={infoCaller}
          />
          {currentChatUser ? (
            <div className="flex flex-row w-[70%]">
              <Chat
                codeDay={timeConstansts.codeDay}
                codeTime={timeConstansts.codeTime}
                daysOfWeek={timeConstansts.daysOfWeek}
                yesterday={timeConstansts.yesterday}
                myVideoRef={myVideoRef}
                peerVideoRef={peerVideoRef}
                widthOfBlock={messagesSearch ? "[50%]" : "full"}
                myStreamRef={myStreamRef}
                infoCaller={infoCaller}
              />
              {messagesSearch && (
                <SearchMessage
                  codeDay={timeConstansts.codeDay}
                  codeTime={timeConstansts.codeTime}
                  daysOfWeek={timeConstansts.daysOfWeek}
                  yesterday={timeConstansts.yesterday}
                />
              )}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      )}
    </>
  );
}

export default Main;
