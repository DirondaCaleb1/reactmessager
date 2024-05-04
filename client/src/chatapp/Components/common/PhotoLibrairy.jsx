import React from "react";
import { IoClose } from "react-icons/io5";
import Image from "./Image.jsx";
import axios from "axios";
import { DELETE_PROFILE_IMAGE_ROUTE } from "../../utils/ApiRoutes.js";

function PhotoLibrairy({
  setPhoto,
  filePartial,
  setFilePartial,
  hidePhotoLibrary,
}) {
  const images = [
    "/avatars/1.png",
    "/avatars/2.png",
    "/avatars/3.png",
    "/avatars/4.png",
    "/avatars/5.png",
    "/avatars/6.png",
    "/avatars/7.png",
    "/avatars/8.png",
    "/avatars/9.png",
  ];

  const deletePhotoProfile = async (fileName, setFilePart) => {
    if (fileName !== "") {
      axios
        .post(DELETE_PROFILE_IMAGE_ROUTE, {
          fileName: fileName,
        })
        .then(() => {
          setFilePart("");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  return (
    <div className="fixed top-0 left-0 max-h-[100vh] max-w-[100vw] h-full w-full flex justify-center items-center">
      <div className="h-max w-max bg-gray-900 gap-6 rounded-lg p-4">
        <div
          className="pt-2 pe-2 cursor-pointer flex items-end justify-end"
          onClick={() => hidePhotoLibrary(false)}
        >
          <IoClose className="w-10 h-10 cursor-pointer" />
        </div>
        <div className="grid grid-cols-3 justify-center gap-16 p-20 w-full">
          {images &&
            images.map((image, index) => (
              <div
                onClick={() => {
                  setPhoto(images[index]);
                  deletePhotoProfile(filePartial, setFilePartial);
                  hidePhotoLibrary(false);
                }}
                key={index}
              >
                <div className="h-24 w-24 relative cursor-pointer">
                  <Image
                    src={image}
                    alt="avatar"
                    width={50}
                    height={50}
                    className="rounded-full w-full h-full"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default PhotoLibrairy;
