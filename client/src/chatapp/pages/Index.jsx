import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExplodeToken } from "../utils/TokenUtils.js";
import Main from "../Components/Main.jsx";

function Index() {
  const token = localStorage.getItem("token");
  const explodeToken = getExplodeToken(token);
  const navigate = useNavigate();

  useEffect(() => {
    if (token === null && explodeToken === null) {
      navigate("/authentif");
    } else if (
      token !== null &&
      explodeToken !== null &&
      explodeToken.isUserConnect === false &&
      explodeToken.isCreated === true &&
      explodeToken.isNotComplete === true
    ) {
      navigate("/traitement");
    }
  }, [token, explodeToken, navigate]);

  
  const isApp = () => {
    let isConnect =
      token !== null &&
      explodeToken !== null &&
      explodeToken.isUserConnect === true &&
      explodeToken.isCreated === false &&
      explodeToken.isNotComplete === false;
    return isConnect;
  };

  const appIs = isApp();

  return <>{appIs && <Main />}</>;
}

export default Index;
