import React, { useEffect } from "react";

function Input({
  name,
  state,
  setState,
  label = false,
  textPlaceholder = "",
  id = "",
  errorInput = false,
  setErrorInput = undefined,
}) {
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (id !== "") {
        if (event.target.id !== id) {
          if (typeof setErrorInput !== "undefined") {
            setErrorInput(false);
          }
        }
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [id, setErrorInput]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-teal-light text-lg px-1">
          {name}
        </label>
      )}
      <div>
        <input
          type="text"
          name={name}
          placeholder={textPlaceholder}
          value={state}
          id={id}
          onChange={(e) => setState(e.target.value)}
          className={`bg-input-background text-start focus:outline-none text-white h-10 rounded-lg px-4 py-5 w-full ${
            errorInput === true ? "border-2 border-red-600" : ""
          }`}
        />
      </div>
    </div>
  );
}

export default Input;
