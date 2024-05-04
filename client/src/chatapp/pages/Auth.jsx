import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiFillMail } from "react-icons/ai";
import ModalAuth from "../Components/common/ModalAuth.jsx";
import { notification } from "antd";
import { KEY_SECRET_CRYPTO } from "../crypto/crypto-dev.js";
import myCrypto from "../crypto/index.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CheckConnect from "../Components/common/CheckConnect.jsx";
import {
  CHECK_SYSTEM_CONNECT_ROUTE,
  CHECK_USER_LOGIN_ROUTE,
  UPDATE_ONLINE_USER,
} from "../utils/ApiRoutes.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "../utils/FirebaseConfig.js";
import { checkEmailError } from "../utils/errors/Error.js";
import { useStateProvider } from "../context/StateContext.jsx";
import { reducerCases } from "../context/constants.js";
import { getExplodeToken } from "../utils/TokenUtils.js";

function Auth() {
  const crypto = myCrypto(KEY_SECRET_CRYPTO);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [notErrorConfig, setNotErrorConfig] = useState(false);
  const [everOneError, setEverOneError] = useState(false);
  const [{ newUser }, dispatch] = useStateProvider();
  //, myUserInfo
  const token = localStorage.getItem("token");
  const explodeToken = getExplodeToken(token);

  useEffect(() => {
    if (
      token !== null &&
      explodeToken !== null &&
      explodeToken.isUserConnect === true &&
      explodeToken.isCreated === false &&
      explodeToken.isNotComplete === false
    ) {
      navigate("/");
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

  useEffect(() => {
    const checkControl = async () => {
      try {
        const response = await axios.get(CHECK_SYSTEM_CONNECT_ROUTE);

        if (response.status === 200 || response.status === 201) {
          setNotErrorConfig(response.data.connected);
        }
      } catch (err) {
        setNotErrorConfig(false);
        console.log(err);
      }
    };

    checkControl();
  }, []);

  useEffect(() => {
    if (notErrorConfig === true) {
      setEverOneError(false);
      notification.success({
        message: "Chargement des paramètres de configuration réussi",
      });
    } else if (notErrorConfig === false) {
      setEverOneError(true);
    }
  }, [notErrorConfig]);

  const handleLoginWithGoogleFirebase = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const {
        user: { displayName: name, email, photoURL: profilePicture },
      } = await signInWithPopup(firebaseAuth, provider);

      const errorHandledObject = {
        empty: "L'adresse email doit obligatoirement être fournie",
        noMatch:
          "L'adresse Email que vous avez fourni possède des caractères invalides (L'adresse email doit posséder les caractères @ et .)",
        noError: "",
      };

      const errorHandled = checkEmailError(email, errorHandledObject);

      const formDataEmail = {
        email: email,
        fieldEmail: "L'adresse email",
      };

      const response = await axios.post(CHECK_USER_LOGIN_ROUTE, formDataEmail);

      const statusResponse = response.status;
      const status = response.data.status;
      const userFound = response.data.user;
      const message = response.data.message;

      if (errorHandled === "") {
        if (
          statusResponse === 201 &&
          message === "Identifiants invalides ou incorrectes" &&
          userFound === null &&
          status === false
        ) {
          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: true,
          });
          dispatch({
            type: reducerCases.SET_MY_USER_INFO,
            myUserInfo: {
              id: 0,
              name: name,
              email: email,
              status: "",
              profilePicture: profilePicture,
              loginWithAccountGoogle: true,
            },
          });

          const token = crypto.encrypt(
            JSON.stringify({
              emailSave: email,
              loginWithAccountGoogle: true,
              isCreated: true,
              isNotComplete: true,
              isUserConnect: false,
            })
          );

          localStorage.setItem("token", token);

          navigate("/traitement");
        } else if (
          statusResponse === 200 &&
          message === "Utilisateur trouvé" &&
          userFound !== null &&
          status === true
        ) {
          const formData = {
            email: userFound.email,
            updateOnline: true,
          };
          const responseUpdate = await axios.put(UPDATE_ONLINE_USER, formData);

          let isOnline;

          const statusOnlineRespone = responseUpdate.status;

          if (statusOnlineRespone === 200) {
            isOnline = responseUpdate.data.isConnected;
          } else {
            isOnline = undefined;
          }

          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: false,
          });
          dispatch({
            type: reducerCases.SET_MY_USER_INFO,
            myUserInfo: {
              id: userFound.id,
              name: userFound.name,
              email: userFound.email,
              status: userFound.about,
              profilePicture: userFound.profilePicture,
              loginWithAccountGoogle: true,
              isOnline: isOnline,
            },
          });

          const token = crypto.encrypt(
            JSON.stringify({
              emailSave: userFound.email,
              loginWithAccountGoogle: true,
              isCreated: false,
              isNotComplete: false,
              isUserConnect: true,
              isOnline: isOnline,
            })
          );

          localStorage.setItem("token", token);

          navigate("/");
        }
      }
    } catch (err) {
      console.log(err);
      notification.error({
        message:
          "Veuillez vous connecter à Internet pour vous connecter grâce à votre compte Google",
      });
    }
  };

  useEffect(() => {
    console.log(newUser);
  }, [newUser]);

  const handleConnectOffline = () => {
    setShowModal(true);
  };

  return (
    <>
      {notErrorConfig === false && <CheckConnect everOneError={everOneError} />}
      <div className="flex flex-col justify-center items-center bg-panel-header-background h-screen w-screen gap-6">
        <div className="flex items-center justify-center gap-2 text-white">
          <span className="text-4xl">APPLICATION DE CHAT</span>
        </div>
        <button
          className="flex flex-row justify-center items-center gap-7 bg-search-input-container-background rounded-lg h-max w-max p-5"
          disabled={notErrorConfig === false ? true : false}
          onClick={handleLoginWithGoogleFirebase}
        >
          <FcGoogle className="text-4xl" />
          <span className="text-white text-2xl">Se connecter avec Google</span>
        </button>
        <button
          className="flex flex-row justify-center items-center gap-7  bg-search-input-container-background rounded-lg h-max w-max p-5"
          disabled={notErrorConfig === false ? true : false}
          onClick={handleConnectOffline}
        >
          <AiFillMail className="text-white text-4xl" />
          <span className="text-white text-2xl">
            Se connecter avec son adresse Email
          </span>
        </button>
        {showModal && <ModalAuth setShowModal={setShowModal} />}
      </div>
    </>
  );
}

export default Auth;
