import React, { useState } from "react";
import { RiRefreshFill } from "react-icons/ri";

function CheckConnect({ everOneError }) {
  const reload = () => {
    window.location.reload();
  };

  return (
    <div className="absolute top-[43%] left-[30%] border-2 border-icon-green bg-conversation-panel-background w-[500px] h-40 rounded-md">
      <div className="w-full h-full  flex flex-col items-center">
        <span className="text-2xl text-white text-center">
          Veuillez attendre le chargement des paramètres de Configuration...
        </span>
        {everOneError && (
          <button
            className="rounded-md p-2 w-max text-white flex flex-col text-xl bg-green-700"
            onClick={reload}
          >
            <span>
              <RiRefreshFill />
            </span>
            <span> Recharger la page...</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default CheckConnect;
