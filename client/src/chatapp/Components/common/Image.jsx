import React from "react";

function Image({
  src,
  width,
  height,
  alt = "",
  className = "",
  crossOrigin = "",
  onChange = null,
}) {
  return (
    <>
      <img
        src={src}
        alt={alt}
        height={height}
        width={width}
        className={className !== "" ? className : undefined}
        onChange={onChange !== null ? onChange : undefined}
        crossOrigin={crossOrigin}
      />
    </>
  );
}

export default Image;
