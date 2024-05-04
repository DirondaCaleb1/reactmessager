import React, { useRef, useEffect } from "react";
import { BiImage, BiVideo } from "react-icons/bi";
import { FcDocument } from "react-icons/fc";
import { FiMusic } from "react-icons/fi";
import { CgFile } from "react-icons/cg";

function ContextMenu({ options, cordinates, contextMenu, setContextMenu }) {
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "context-opener") {
        if (
          contextMenuRef.current &&
          !contextMenuRef.current?.contains(event.target)
        ) {
          setContextMenu(false);
        }
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [setContextMenu]);

  const handleClick = (e, callback) => {
    e.stopPropagation();
    setContextMenu(false);
    callback();
  };

  return (
    <div
      className="bg-dropdown-background fixed py-2 z-[100]"
      ref={contextMenuRef}
      style={{
        top: cordinates.y,
        left: cordinates.x,
      }}
    >
      <ul>
        {options &&
          options.map(({ name, callback, typeIcon = null }) => (
            <li
              key={name}
              onClick={(e) => handleClick(e, callback)}
              className="px-5 py-2 cursor-pointer hover:bg-background-default-hover"
            >
              <span className="text-white">
                {typeIcon !== null && typeIcon === "image" && (
                  <span className="text-white">
                    <BiImage /> {"  "}
                  </span>
                )}
                {typeIcon !== null && typeIcon === "video" && (
                  <span className="text-white">
                    <BiVideo /> {"  "}
                  </span>
                )}
                {typeIcon !== null && typeIcon === "document" && (
                  <span className="text-white">
                    <FcDocument /> {"  "}
                  </span>
                )}
                {typeIcon !== null && typeIcon === "audio-upload" && (
                  <span className="text-white">
                    <FiMusic /> {"  "}
                  </span>
                )}
                {typeIcon !== null && typeIcon === "other" && (
                  <span className="text-white">
                    <CgFile /> {"  "}
                  </span>
                )}
                {name}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default ContextMenu;
