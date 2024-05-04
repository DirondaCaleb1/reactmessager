import React, { useState, useEffect, useRef } from "react";
import MessageStatus from "../common/MessageStatus.jsx";
import { calculateTime } from "../../utils/CalculateTime.js";
import { formatTime } from "../../utils/FormatTime.js";
import WaveSurfer from "wavesurfer.js";
import Avatar from "../common/Avatar.jsx";
import { FaPlay, FaStop } from "react-icons/fa";
import { useStateProvider } from "../../context/StateContext.jsx";
import { HOST } from "../../utils/ApiRoutes.js";
import { DownloaderFile } from "../../utils/FileSystem.js";
import { GoDownload } from "react-icons/go";

function VoiceMessage({ message, codeTime, codeDay, yesterday, daysOfWeek }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [audioMessage, setAudioMessage] = useState(null);
  const [waveform, setWaveForm] = useState(null);
  const [{ myUserInfo, currentChatUser }] = useStateProvider();

  const waveFormRef = useRef(null);

  const downloadFile = async () => {
    const urlDocument = `${HOST}/${message.message}`;
    const messageSuccess = "Téléchargement réussi";
    await DownloaderFile(urlDocument, messageSuccess);
  };

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

  useEffect(() => {
    //
    const audioURL = `${HOST}/${message.message}`;
    const audio = new Audio(audioURL);
    audio.crossOrigin = "anonymous";
    setAudioMessage(audio);
    if (waveform !== null) {
      waveform.load(audioURL);
      waveform.on("ready", () => {
        setTotalDuration(waveform.getDuration());
      });
    }
  }, [message.message, waveform]);

  useEffect(() => {
    if (audioMessage) {
      const updatePlayBackTime = () => {
        setCurrentPlaybackTime(audioMessage.currentTime);
      };

      audioMessage.addEventListener("timeupdate", updatePlayBackTime);

      return () => {
        audioMessage.removeEventListener("timeupdate", updatePlayBackTime);
      };
    }
  }, [audioMessage]);

  const handlePlayAudio = () => {
    if (audioMessage) {
      if (waveform !== null) {
        waveform.stop();
        waveform.play();
      }
      audioMessage.play();
      setIsPlaying(true);
    }
  };

  const handlePauseAudio = () => {
    if (waveform !== null) {
      waveform.stop();
    }
    audioMessage.pause();
    setIsPlaying(false);
  };

  return (
    <div
      className={`flex items-center gap-5 text-white px-4 pr-2 py-4 text-sm rounded-md  ${
        message.senderId === currentChatUser?.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      } `}
    >
      <div>
        <Avatar
          type="lg"
          image={currentChatUser?.profilePicture}
          setImage={() => {}}
        />
      </div>
      <div className="cursor-pointer text-xl">
        {!isPlaying ? (
          <FaPlay onClick={handlePlayAudio} />
        ) : (
          <FaStop onClick={handlePauseAudio} />
        )}
      </div>
      <div className="relative">
        <div className="w-60" ref={waveFormRef} />
        <div className="text-bubble-meta text-[11px] pt-1 justify-between absolute bottom-[-22px] w-full ">
          <span className="text-red-800">
            {formatTime(isPlaying ? currentPlaybackTime : totalDuration)}
          </span>
          <div className="flex gap-1">
            <span>
              {calculateTime(
                message.createdAt,
                codeTime,
                codeDay,
                yesterday,
                daysOfWeek
              )}
            </span>
            <span
              className="rounded-md border-2 border-bubble-meta cursor-pointer"
              title="Si vous voulez sauvegarder ce fichier sur votre disque dur, veuillez cliquer ci-dessus"
              id="preview_app"
            >
              <GoDownload
                className="text-3xl"
                id="preview"
                onClick={downloadFile}
              />
            </span>
            <span className="text-bubble-meta text-[11px] pt-1 min-w-[10px]">
              {message.senderId === currentChatUser?.id ? "" : "Vous"}
            </span>
            {message.senderId === myUserInfo?.id && (
              <MessageStatus messageStatus={message.messageStatus} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceMessage;
