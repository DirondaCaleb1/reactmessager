import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StateProvider } from "./context/StateContext.jsx";
import reducer, { initialState } from "./context/StateReducer.js";
import Index from "./pages/Index.jsx";
import Auth from "./pages/Auth.jsx";
import OnBoarding from "./pages/OnBoarding.jsx";
import Logout from "./pages/Logout.jsx";
import { getExplodeToken } from "./utils/TokenUtils.js";

function ChatApp() {
  const urlRedirectError = () => {
    const token = localStorage.getItem("token");
    const explodeToken = getExplodeToken(token);
    const authentif = token === null && explodeToken === null;

    const onboard =
      token !== null &&
      explodeToken !== null &&
      explodeToken.isUserConnect === false &&
      explodeToken.isCreated === true &&
      explodeToken.isNotComplete === true;

    const index =
      token !== null &&
      explodeToken !== null &&
      explodeToken.isUserConnect === true &&
      explodeToken.isCreated === false &&
      explodeToken.isNotComplete === false;
    let url = "";
    if (authentif === true && onboard !== true && index !== true) {
      url += "/authentif";
    } else if (authentif !== true && onboard === true && index !== true) {
      url += "/traitement";
    } else if (authentif !== true && onboard !== true && index === true) {
      url += "/";
    }

    return url;
  };

  const url = urlRedirectError();

  return (
    <div>
      <StateProvider initialState={initialState} reducer={reducer}>
        <>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/authentif" element={<Auth />} />
              <Route path="/traitement" element={<OnBoarding />} />
              <Route path="/deconnexion" element={<Logout />} />
              <Route path="*" element={<Navigate replace to={url} />} />
            </Routes>
          </BrowserRouter>
        </>
      </StateProvider>
    </div>
  );
}

export default ChatApp;
