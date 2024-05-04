import React, { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaStop,
  FaTrash,
  FaMicrophone,
  FaPauseCircle,
} from "react-icons/fa";
import { notification } from "antd";
import axios from "axios";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import { formatTime } from "../../utils/FormatTime.js";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { ADD_RECORDING_MESSAGE_ROUTE } from "../../utils/ApiRoutes.js";

function CaptureAudio({ hide }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveform, setWaveForm] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState(null);
  const [{ myUserInfo, currentChatUser, socket }, dispatch] =
    useStateProvider();
  const [errorSend, setErrorSend] = useState(false);

  const audioRef = useRef(null);
  const mediaRecordRef = useRef(null);
  const waveFormRef = useRef(null);

  useEffect(() => {
    let interval;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) => {
          setTotalDuration(prevDuration + 1);
          return prevDuration + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
    });

    setWaveForm(wavesurfer);

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecordRef.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          const audioURL = URL.createObjectURL(blob);
          const audio = new Audio(audioURL);

          setRecordedAudio(audio);

          waveform.load(audioURL);
        };

        mediaRecorder.start();
      })
      .catch((error) => {
        console.log("Erreur d'accession au microphone ", error);
        notification.error({
          message: "Erreur d'accession au microphone",
        });
      });
  };

  useEffect(() => {
    if (waveform) handleStartRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waveform]);

  const handleStopRecording = () => {
    if (mediaRecordRef.current && isRecording) {
      mediaRecordRef.current.stop();
      setIsRecording(false);
      waveform.stop();

      const audioChunks = [];
      mediaRecordRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecordRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "recording.mp3");
        setRenderedAudio(audioFile);
      });

      if (errorSend === true) {
        setErrorSend(false);
      }
    }
  };

  useEffect(() => {
    if (recordedAudio) {
      const updatePlayBackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };

      recordedAudio.addEventListener("timeupdate", updatePlayBackTime);

      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlayBackTime);
      };
    }
  }, [recordedAudio]);

  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };

  const handlePauseRecording = () => {
    waveform.stop();
    recordedAudio.pause();
    setIsPlaying(false);
  };

  const sendRecording = async () => {
    try {
      const formData = new FormData();
      formData.append("audio", renderedAudio);

      const response = await axios.post(ADD_RECORDING_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: myUserInfo?.id,
          to: currentChatUser?.id,
        },
      });

      //console.log(response);

      const statusResponse = response.status;

      //console.log(statusResponse);

      if (statusResponse === 200) {
        if (errorSend === true) {
          setErrorSend(false);
        }

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
        hide();
      } else if (statusResponse === 201) {
        const errorMsg = response.data.error;

        if (errorMsg === "L'audio doit obligatoirement fourni") {
          setErrorSend(true);
          notification.error({
            message:
              "Veuillez arreter l'enregistrement  pour l'envoyer. Pour cela cliquer sur le bouton entouré d'un rectangle rouge",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex text-2xl w-full justify-end items-center">
      <div className="pt-1">
        <FaTrash
          className="text-panel-header-icon cursor-pointer"
          onClick={() => hide()}
        />
      </div>
      <div className="mx-4 px-4 py-2 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 animate-pulse z-[60] text-center">
            Enregistrement <span>{recordingDuration}s</span>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {!isPlaying ? (
                  <FaPlay onClick={handlePlayRecording} />
                ) : (
                  <FaStop onClick={handlePauseRecording} />
                )}
              </>
            )}
          </div>
        )}
        <div className="w-60" ref={waveFormRef} hidden={isRecording} />
        {recordedAudio && isPlaying && (
          <span>{formatTime(currentPlaybackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}
        <audio ref={audioRef} hidden />
      </div>
      <div
        className={`mr-4 ${
          errorSend === true ? "border-red-500 border-2" : ""
        }`}
      >
        {!isRecording ? (
          <FaMicrophone
            className="text-red-500"
            onClick={handleStartRecording}
          />
        ) : (
          <FaPauseCircle
            className="text-red-500"
            onClick={handleStopRecording}
          />
        )}
      </div>
      <div>
        <MdSend
          className="text-panel-header-icon cursor-pointer mr-4"
          title="Envoyer"
          onClick={sendRecording}
        />
      </div>
    </div>
  );
}

export default CaptureAudio;
