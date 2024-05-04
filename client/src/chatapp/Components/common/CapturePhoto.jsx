import React, { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { DELETE_PROFILE_IMAGE_ROUTE } from "../../utils/ApiRoutes.js";
import { getDevicesSupported } from "../../utils/MediaDevicesConfig.js";

function CapturePhoto({ setImage, hide, filePartial, setFilePartial }) {
  const videoRef = useRef(null);
  const [toAutoPlay, setToAutoPlay] = useState(false);

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

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      const configStream = await getDevicesSupported();
      const errorHandlerInputVideo = await errorHandlerByMultimediaAbsent(
        configStream,
        "videoinput"
      );

      if (errorHandlerInputVideo) {
        setToAutoPlay(false);
      } else {
        try {
          setToAutoPlay(true);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          let videoCurrent = videoRef.current;
          if (videoCurrent) {
            videoCurrent.srcObject = stream;
          }
        } catch (err) {
          console.log(err);
        }
      }
    };

    try {
      startCamera();
      return () => {
        const destroyEffect = async () => {
          const configStream = await getDevicesSupported();
          const errorHandlerInputVideo = await errorHandlerByMultimediaAbsent(
            configStream,
            "videoinput"
          );
          if (!errorHandlerInputVideo) {
            stream?.getTracks().forEach((track) => track.stop());
          }
        };

        destroyEffect();
      };
    } catch (err) {
      setToAutoPlay(false);
      console.log(err);
    }
  }, []);

  const capturePhoto = async () => {
    const canvas = document.createElement("canvas");

    let canvasImage = videoRef?.current;
    canvas.getContext("2d")?.drawImage(canvasImage, 0, 0, 300, 150);
    setImage(canvas.toDataURL("image/jpeg"));
    if (filePartial !== "") {
      axios
        .post(DELETE_PROFILE_IMAGE_ROUTE, {
          fileName: filePartial,
        })
        .then(() => {
          setFilePartial("");
        })
        .catch((err) => {
          console.log(err);
        });
    }
    hide(false);
  };
  return (
    <div className="absolute h-4/6 w-2/6 top-1/4 left-1/3 bg-gray-900 gap-3 rounded-lg pt-2 flex items-center justify-center">
      <div className="flex flex-col gap-2 w-full items-center justify-center">
        <div
          className="pt-2 pr-2 cursor-pointer flex items-end justify-end"
          onClick={() => hide(false)}
        >
          <IoClose className="w-10 h-10 cursor-pointer" />
        </div>
        <div className="flex justify-center">
          {toAutoPlay ? (
            <video
              id="video"
              width="400"
              autoPlay={toAutoPlay}
              ref={videoRef}
            ></video>
          ) : (
            <div>
              <h2>
                Fonctionnalités (caméra) absentes
                <br /> de votre appareil.
                <br /> Vous ne pouvez pas effectuer
                <br /> cette opération
              </h2>
            </div>
          )}
        </div>
        {toAutoPlay ? (
          <button
            className="h-16 w-16 bg-white rounded-full cursor-pointer border-8 border-teal-light p-2 mb-10"
            onClick={capturePhoto}
          ></button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default CapturePhoto;
