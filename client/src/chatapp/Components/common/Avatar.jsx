import React, { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import axios from "axios";
import Image from "./Image.jsx";
import PhotoPicker from "./PhotoPicker.jsx";
import PhotoLibrairy from "./PhotoLibrairy.jsx";
import CapturePhoto from "./CapturePhoto.jsx";
import ContextMenu from "./ContextMenu.jsx";
import { notification } from "antd";
import {
  HOST,
  UPLOAD_PROFILE_IMAGE_ROUTE,
  DELETE_PROFILE_IMAGE_ROUTE,
} from "../../utils/ApiRoutes.js";

function Avatar({ type, image, setImage, colorText = "" }) {
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({
    x: 0,
    y: 0,
  });

  const [grabPhoto, setGrabPhoto] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [filePartial, setFilePartial] = useState("");

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCoordinates({
      x: e.pageX,
      y: e.pageY,
    });
    setIsContextMenuVisible(true);
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

  const contextMenuOptions = [
    {
      name: "Prendre une photo",
      callback: () => {
        setShowCapturePhoto(true);
      },
    },
    {
      name: "Depuis la librairie",
      callback: () => {
        setShowPhotoLibrary(true);
      },
    },
    {
      name: "Téléverser(Uploader) une photo",
      callback: () => {
        setGrabPhoto(true);
      },
    },
    {
      name: "Supprimer une photo",
      callback: async () => {
        setImage("/default_avatar.png");

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
      },
    },
  ];

  const photoPickerChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(UPLOAD_PROFILE_IMAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const message = response.data.message;

      let fileNamePartial;
      let fileName;

      if (response.status === 200) {
        fileNamePartial = response.data.fileName;
      } else if (response.status === 201) {
        notification.error({
          message: message,
        });
        fileNamePartial = "/default_avatar.png";
      } else {
        fileNamePartial = "/default_avatar.png";
      }

      if (fileNamePartial !== "/default_avatar.png") {
        const imag = `${HOST}/${fileNamePartial}`;

        fileName = imag;

        setFilePartial(fileNamePartial);
      } else {
        fileName = "/default_avatar.png";
      }

      setTimeout(() => {
        setImage(fileName);
      }, 100);

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
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="flex items-center justify-center">
        {type === "sm" && (
          <div className="relative h-10 w-10">
            <Image
              src={image}
              alt="avatar"
              className="rounded-full w-full h-full"
              crossOrigin="anonymous"
              width={20}
              height={20}
            />
          </div>
        )}

        {type === "lg" && (
          <div className="relative h-14 w-14">
            <Image
              src={image}
              alt="avatar"
              className="rounded-full w-full h-full"
              crossOrigin="anonymous"
              width={40}
              height={40}
            />
          </div>
        )}
        {type === "xl" && (
          <div
            className="relative cursor-pointer z-0"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div
              className={`z-10 bg-photopicker-overlay-background h-60 w-60 absolute top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2  
            ${hover ? "visible" : "hidden"}`}
              onClick={(e) => showContextMenu(e)}
              id="context-opener"
            >
              <FaCamera
                className={`text-2xl ${colorText}`}
                id="context-opener"
                onClick={(e) => showContextMenu(e)}
              />
              <span
                id="context-opener"
                className={`${colorText}`}
                onClick={(e) => showContextMenu(e)}
              >
                Changer la <br />
                photo de <br />
                profil
              </span>
            </div>
            <div className="flex items-center justify-center h-60 w-60">
              <img
                crossOrigin="anonymous"
                src={image}
                alt="avatar"
                className="rounded-full h-full w-full"
              />
            </div>
          </div>
        )}
      </div>
      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          cordinates={contextMenuCoordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}

      {showCapturePhoto && (
        <CapturePhoto
          setImage={setImage}
          hide={setShowCapturePhoto}
          filePartial={filePartial}
          setFilePartial={setFilePartial}
        />
      )}

      {showPhotoLibrary && (
        <PhotoLibrairy
          setPhoto={setImage}
          hidePhotoLibrary={setShowPhotoLibrary}
          filePartial={filePartial}
          setFilePartial={setFilePartial}
        />
      )}

      {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
    </>
  );
}

export default Avatar;
