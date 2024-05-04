import React, { useState, useRef, useEffect } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import { notification } from "antd";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import "emoji-picker-element";
import PhotoPicker from "../common/PhotoPicker.jsx";
import FilePicker from "../common/FilePicker.jsx";
import CaptureAudio from "../common/CaptureAudio.jsx";
import ContextMenu from "../common/ContextMenu.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import {
  ADD_TEXT_MESSAGE_ROUTE,
  ADD_AUDIO_MESSAGE_ROUTE,
  ADD_VIDEO_MESSAGE_ROUTE,
  ADD_DOCUMENT_MESSAGE_ROUTE,
  ADD_IMAGE_MESSAGE_ROUTE,
  ADD_OTHER_FILE_MESSAGE_ROUTE,
} from "../../utils/ApiRoutes.js";
import { getDevicesSupported } from "../../utils/MediaDevicesConfig.js";

//import {}

function MessageBar() {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [{ myUserInfo, socket, currentChatUser }, dispatch] =
    useStateProvider();
  const emojiPickerRef = useRef(null);
  const [grabPhoto, setGrabPhoto] = useState(false);
  const [grabDocument, setGrabDocument] = useState(false);
  const [grabSound, setGrabSound] = useState(false);
  const [grabOther, setGrabOther] = useState(false);
  const [grabVideo, setGrabVideo] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x: 0,
    y: 0,
  });

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCoordinates({
      x: e.pageX + 20,
      y: e.pageY - 350,
    });
    setIsContextMenuVisible(true);
  };

  const contextMenuOptions = [
    {
      name: "image",
      callback: () => {
        setGrabPhoto(true);
        setIsContextMenuVisible(false);
      },
      typeIcon: "image",
    },
    {
      name: "document",
      callback: () => {
        setGrabDocument(true);
        setIsContextMenuVisible(false);
      },
      typeIcon: "document",
    },
    {
      name: "video",
      callback: () => {
        setGrabVideo(true);
        setIsContextMenuVisible(false);
      },
      typeIcon: "video",
    },
    {
      name: "audio",
      callback: () => {
        setGrabSound(true);
        setIsContextMenuVisible(false);
      },
      typeIcon: "audio-upload",
    },
    {
      name: "autre",
      callback: () => {
        setGrabOther(true);
        setIsContextMenuVisible(false);
      },
      typeIcon: "other",
    },
  ];

  const filePickerChange = async (e, typeSendMessage = "audio") => {
    try {
      let URL_ROUTE = undefined;

      switch (typeSendMessage) {
        case "audio":
          URL_ROUTE = ADD_AUDIO_MESSAGE_ROUTE;
          break;
        case "video":
          URL_ROUTE = ADD_VIDEO_MESSAGE_ROUTE;
          break;
        case "document":
          URL_ROUTE = ADD_DOCUMENT_MESSAGE_ROUTE;
          break;
        case "image":
          URL_ROUTE = ADD_IMAGE_MESSAGE_ROUTE;
          break;
        case "file":
          URL_ROUTE = ADD_OTHER_FILE_MESSAGE_ROUTE;
          break;
        default:
          URL_ROUTE = ADD_AUDIO_MESSAGE_ROUTE;
          break;
      }

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append(typeSendMessage, file);

      if (typeof URL_ROUTE !== "undefined") {
        const response = await axios.post(URL_ROUTE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            from: myUserInfo?.id,
            to: currentChatUser?.id,
          },
        });
        const statusResponse = response.status;

        if (statusResponse === 200) {
          const messageSent = response.data.message;

          socket.current.emit("send-msg", {
            to: currentChatUser?.id,
            from: myUserInfo?.id,
            message: messageSent,
          });

          dispatch({
            type: reducerCases.ADD_MESSAGE,
            newMessage: {
              ...messageSent,
            },
            fromSelf: true,
          });
        } else if (statusResponse === 201) {
          const errorMessage = response.data.error;
          notification.error({
            message: errorMessage,
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const photoPickerChange = async (e) => {
    try {
      await filePickerChange(e, "image");
    } catch (err) {
      console.log(err);
    }
  };

  const soundPickerChange = async (e) => {
    try {
      await filePickerChange(e, "audio");
    } catch (err) {
      console.log(err);
    }
  };

  const documentPickerChange = async (e) => {
    try {
      await filePickerChange(e, "document");
    } catch (err) {
      console.log(err);
    }
  };

  const videoPickerChange = async (e) => {
    try {
      await filePickerChange(e, "video");
    } catch (err) {
      console.log(err);
    }
  };

  const otherFilePickerChange = async (e) => {
    try {
      await filePickerChange(e, "file");
    } catch (err) {
      console.log(err);
    }
  };

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

  const captureAudioShow = async () => {
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
          "Vous ne disposez pas de microphone, pour enregistrer un message vocal",
      });
    } else {
      setShowAudioRecorder(true);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "emoji-opener") {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target)
        ) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => (prevMessage += emoji.emoji));
  };

  const sendMessage = async () => {
    try {
      const response = await axios.post(ADD_TEXT_MESSAGE_ROUTE, {
        to: currentChatUser?.id,
        from: myUserInfo?.id,
        message: message,
      });

      //console.log(response);

      const statusResponse = response.status;

      if (statusResponse === 200) {
        const messageSent = response.data.message;

        socket.current.emit("send-msg", {
          to: currentChatUser?.id,
          from: myUserInfo?.id,
          message: messageSent,
        });

        socket.current.emit("update-unread-messages", {
          to: currentChatUser?.id,
        });

        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...messageSent,
          },
          fromSelf: true,
        });
      }

      socket.current.emit("finish-writting-status", {
        to: currentChatUser?.id,
      });

      setMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessageByEnter = async (e) => {
    if (message.length > 0) {
      if (e.key === "Enter") {
        await sendMessage();
      }
    }
  };

  const emitStatusWriting = () => {
    socket.current.emit("writting-status", {
      to: currentChatUser?.id,
      message: `${myUserInfo?.name} est en train d'écrire ....`,
      profilePicture: myUserInfo?.profilePicture,
    });
  };

  const finishStatusWritting = () => {
    socket.current.emit("finish-writting-status", {
      to: currentChatUser?.id,
    });
  };

  useEffect(() => {
    if (grabPhoto) {
      const data = document.getElementById("photo-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000);
      };
    }
  }, [grabPhoto]);

  useEffect(() => {
    if (grabSound) {
      const data = document.getElementById("file-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabSound(false);
        }, 1000);
      };
    } else if (grabDocument) {
      const data = document.getElementById("file-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabDocument(false);
        }, 1000);
      };
    } else if (grabVideo) {
      const data = document.getElementById("file-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabVideo(false);
        }, 1000);
      };
    } else if (grabOther) {
      const data = document.getElementById("file-picker");
      data.click();
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabOther(false);
        }, 1000);
      };
    }
  }, [grabSound, grabDocument, grabVideo, grabOther]);

  return (
    <div className="bg-panel-header-background h-20 flex items-center gap-6 relative">
      {!showAudioRecorder && (
        <>
          <div className="flex gap-6">
            <BsEmojiSmile
              className="text-panel-header-icon cursor-pointer text-xl"
              title={"Emoji"}
              id="emoji-opener"
              onClick={handleEmojiModal}
            />
            {showEmojiPicker && (
              <div
                className="absolute bottom-24 left-16 z-40"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}
            <ImAttachment
              className="text-panel-header-icon cursor-pointer text-xl"
              title={"Attacher un fichier"}
              id="context-opener"
              onClick={(e) => showContextMenu(e)}
            />
          </div>
          <div className="w-full rounded-lg h-10 flex items-center">
            <input
              type="text"
              placeholder={"Ecrire un message..."}
              className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onFocus={() => {
                emitStatusWriting();
              }}
              onBlur={() => {
                finishStatusWritting();
              }}
              onKeyUp={async (e) => {
                await sendMessageByEnter(e);
              }}
            />
          </div>
          <div className="flex w-10 items-center justify-center">
            <button>
              {message.length ? (
                <MdSend
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title={"Envoyer un message"}
                  onClick={sendMessage}
                />
              ) : (
                <FaMicrophone
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title={"Envoyer un  message vocal"}
                  onClick={() => captureAudioShow()}
                />
              )}
            </button>
          </div>
        </>
      )}

      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          cordinates={contextMenuCoordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}

      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
      {grabSound && <FilePicker onChange={soundPickerChange} />}
      {grabDocument && <FilePicker onChange={documentPickerChange} />}
      {grabVideo && <FilePicker onChange={videoPickerChange} />}
      {grabOther && <FilePicker onChange={otherFilePickerChange} />}

      {showAudioRecorder && <CaptureAudio hide={setShowAudioRecorder} />}
    </div>
  );
}

export default MessageBar;
