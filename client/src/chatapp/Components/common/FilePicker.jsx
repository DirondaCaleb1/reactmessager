import React from "react";
import ReactDOM from "react-dom";

function FilePicker({ onChange }) {
  const component = (
    <input
      type="file"
      hidden
      id="file-picker"
      name="file"
      onChange={onChange}
    />
  );

  return ReactDOM.createPortal(
    component,
    document.getElementById("file-picker-element")
  );
}

export default FilePicker;
