import React, { useEffect } from "react";
import { useStateProvider } from "../context/StateContext.jsx";
import { reducerCases } from "../context/constants.js";
import { useNavigate } from "react-router-dom";
import { getEmailAndLoginMode } from "../utils/TokenUtils.js";
import { firebaseAuth } from "../utils/FirebaseConfig.js";
import { signOut } from "firebase/auth";
import axios from "axios";
import { UPDATE_ONLINE_USER } from "../utils/ApiRoutes.js";

function Logout() {
  const [{ myUserInfo, socket, logoutAccess }, dispatch] = useStateProvider();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const loginWithGoogleAccount = getEmailAndLoginMode(token, myUserInfo);

  useEffect(() => {
    if (!logoutAccess && myUserInfo) {
      navigate("/");
    } else if (!logoutAccess && !myUserInfo) {
      navigate("/authentif");
    }
  }, [logoutAccess, myUserInfo, navigate]);

  useEffect(() => {
    if (logoutAccess && myUserInfo) {
      const setOnline = async () => {
        const formData = {
          email: myUserInfo.email,
          updateOnline: false,
        };
        const responseUpdate = await axios.put(UPDATE_ONLINE_USER, formData);

        let isOnline;

        const statusOnlineRespone = responseUpdate.status;

        if (statusOnlineRespone === 200) {
          isOnline = responseUpdate.data.isConnected;
        } else {
          isOnline = undefined;
        }

        console.log(isOnline);
        socket.current.emit("auth-online-offline", myUserInfo?.id, isOnline);
      };

      console.log(myUserInfo);

      socket.current.emit("signout", myUserInfo?.id);
      setOnline();

      dispatch({
        type: reducerCases.SET_MY_USER_INFO,
        userInfo: undefined,
      });

      const loginWithAccountGoogle =
        loginWithGoogleAccount.loginWithAccountGoogle;

      if (loginWithAccountGoogle !== null && loginWithAccountGoogle === true) {
        signOut(firebaseAuth);
        localStorage.removeItem("token");
        navigate("/authentif");
      } else if (
        loginWithAccountGoogle !== null &&
        loginWithAccountGoogle === false
      ) {
        localStorage.removeItem("token");
        navigate("/authentif");
      }
    } else if (logoutAccess && !myUserInfo) {
      navigate("/authentif");
    }
  }, [
    dispatch,
    loginWithGoogleAccount.loginWithAccountGoogle,
    logoutAccess,
    myUserInfo,
    navigate,
    socket,
  ]);

  return <div className="bg-conversation-panel-background"></div>;
}

export default Logout;
