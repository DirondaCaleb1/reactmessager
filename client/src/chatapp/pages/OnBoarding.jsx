import React, { useState, useEffect } from "react";
import { notification } from "antd";
import { KEY_SECRET_CRYPTO } from "../crypto/crypto-dev.js";
import myCrypto from "../crypto/index.js";
import { useNavigate } from "react-router-dom";
import Avatar from "../Components/common/Avatar.jsx";
import Input from "../Components/common/Input.jsx";
//import Image from "../Components/common/Image.jsx";
import CheckConnect from "../Components/common/CheckConnect.jsx";
import axios from "axios";
import {
  CHECK_SYSTEM_CONNECT_ROUTE,
  ONBOARD_USER_LOCAL_ROUTE,
  ONBOARD_USER_FIREBASE_ROUTE,
  UPDATE_ONLINE_USER,
  CHECK_USER_EXISTS_ROUTE,
} from "../utils/ApiRoutes.js";
import { useStateProvider } from "../context/StateContext.jsx";
import { reducerCases } from "../context/constants.js";
import { OnBoardUserError } from "../utils/errors/Error.js";
import { getExplodeToken } from "../utils/TokenUtils.js";
import { getEmailAndLoginMode } from "../utils/TokenUtils.js";
import { checkEmailError } from "../utils/errors/Error.js";

function OnBoarding() {
  const crypto = myCrypto(KEY_SECRET_CRYPTO);
  const navigate = useNavigate();
  const [{ myUserInfo }, dispatch] = useStateProvider();
  const token = localStorage.getItem("token");
  const [name, setName] = useState(myUserInfo?.name || "");
  const [about, setAbout] = useState("");
  const [image, setImage] = useState("/default_avatar.png");
  const [notErrorConfig, setNotErrorConfig] = useState(false);
  const [everOneError, setEverOneError] = useState(false);
  const [errorName, setErrorName] = useState(false);
  const [errorAbout, setErrorAbout] = useState(false);
  const explodeToken = getExplodeToken(token);
  const loginWithGoogleAccount = getEmailAndLoginMode(token, myUserInfo);

  useEffect(() => {
    if (
      token !== null &&
      explodeToken !== null &&
      explodeToken.isUserConnect === true &&
      explodeToken.isCreated === false &&
      explodeToken.isNotComplete === false
    ) {
      console.log("in");
      navigate("/");
    } else if (token === null && explodeToken === null) {
      console.log("off");
      navigate("/authentif");
    } else if (
      token !== null &&
      explodeToken !== null &&
      explodeToken.isUserConnect === false &&
      explodeToken.isCreated === true &&
      explodeToken.isNotComplete === true
    ) {
      const refreshPageParams = async () => {
        try {
          const email = loginWithGoogleAccount.email;
          const fieldEmail = "email";
          const errorHandledObject = {
            empty: "Veuillez obligatoirement fournir une adresse Email",
            noMatch:
              "L'adresse Email que vous avez fourni possède des caractères invalides (L'adresse email doit posséder les caractères @ et .)",
            noError: "",
          };

          const errorHandled = checkEmailError(email, errorHandledObject);

          const formDataEmail = {
            email: email,
            fieldEmail: fieldEmail,
          };

          const response = await axios.post(
            CHECK_USER_EXISTS_ROUTE,
            formDataEmail
          );

          const status = response.status;
          const message = response.data.message;
          const userFound = response.data.user;

          if (message !== "" && errorHandled !== "") {
            dispatch({
              type: reducerCases.SET_MY_USER_INFO,
              myUserInfo: undefined,
            });
          } else if (errorHandled === "") {
            if (
              status === 201 &&
              message === "Identifiants invalides ou incorrectes" &&
              userFound === null
            ) {
              dispatch({
                type: reducerCases.SET_MY_USER_INFO,
                myUserInfo: undefined,
              });
            } else if (
              status === 200 &&
              message === "Utilisateur trouvé" &&
              userFound !== null
            ) {
              dispatch({
                type: reducerCases.SET_MY_USER_INFO,
                myUserInfo: {
                  id: userFound.id,
                  name: userFound.name,
                  email: userFound.email,
                  status: userFound.about,
                  profilePicture: userFound.profilePicture,
                  loginWithAccountGoogle:
                    loginWithGoogleAccount.loginWithAccountGoogle,
                },
              });
            }
          }
        } catch (err) {
          console.log(err);
        }
      };

      if (!myUserInfo) {
        refreshPageParams();
      }
    }
  }, [
    token,
    explodeToken,
    navigate,
    loginWithGoogleAccount.email,
    loginWithGoogleAccount.loginWithAccountGoogle,
    dispatch,
    myUserInfo,
  ]);

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

    if (!myUserInfo) {
      checkControl();
    }
  }, [myUserInfo]);

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

  const onBoardUserHandler = async () => {
    let jsonParse;
    let loginWithAccountGoogleJX;
    let loginWithAccountGoogle;
    let email;
    let dataForm;
    let fieldsName;
    let response;

    if (token !== null) {
      const decryptToken = crypto.decrypt(token);

      jsonParse = JSON.parse(decryptToken);
    } else {
      jsonParse = null;
    }

    if (jsonParse !== null && typeof myUserInfo === "undefined") {
      loginWithAccountGoogleJX = jsonParse.loginWithAccountGoogle;
      email = jsonParse.emailSave;
    } else if (jsonParse === null && typeof myUserInfo !== "undefined") {
      loginWithAccountGoogleJX = myUserInfo.loginWithAccountGoogle;
      email = myUserInfo.email;
    } else if (jsonParse !== null && typeof myUserInfo !== "undefined") {
      loginWithAccountGoogleJX = myUserInfo.loginWithAccountGoogle;
      email = myUserInfo.email;
    } else if (jsonParse === null && typeof myUserInfo === "undefined") {
      loginWithAccountGoogleJX = null;
      email = "";
    }

    if (loginWithAccountGoogleJX !== null) {
      loginWithAccountGoogle = loginWithAccountGoogleJX;
    } else {
      loginWithAccountGoogle = undefined;
    }

    if (typeof loginWithAccountGoogle !== "undefined" && email !== "") {
      try {
        dataForm = {
          name: name,
          about: about,
        };

        fieldsName = {
          name: "Nom d'utilisateur",
          about: "A propos de",
        };

        const dataOnBoard = {
          email: email,
          name: dataForm.name,
          about: dataForm.about,
          fieldName: fieldsName.name,
          fieldAbout: fieldsName.about,
          loginWithAccountGoogle: loginWithAccountGoogle,
          image: image,
        };

        let isValidOnBoard = OnBoardUserError(dataForm, fieldsName, 3);

        if (loginWithAccountGoogle === true) {
          response = await axios.post(ONBOARD_USER_FIREBASE_ROUTE, dataOnBoard);
        } else {
          response = await axios.put(ONBOARD_USER_LOCAL_ROUTE, dataOnBoard);
        }

        const statusResponse = response.status;
        const status = response.data.status;
        const message = response.data.message;
        const userFound = response.data.user;
        const fieldErrors = response.data.fieldErrors;

        if (statusResponse === 201 && userFound === null && status === false) {
          if (
            (fieldErrors.length > 0 && fieldErrors.includes(fieldsName.name)) ||
            (isValidOnBoard.fieldErrors.length > 0 &&
              isValidOnBoard.fieldErrors.includes(fieldsName.name))
          ) {
            setErrorName(true);
          }

          if (
            (fieldErrors.length > 0 &&
              fieldErrors.includes(fieldsName.about)) ||
            (isValidOnBoard.fieldErrors.length > 0 &&
              isValidOnBoard.fieldErrors.includes(fieldsName.about))
          ) {
            setErrorAbout(true);
          }

          if (isValidOnBoard.message === message && message !== "") {
            notification.error({
              message: isValidOnBoard.message,
            });
          }
        } else {
          setErrorName(false);
          setErrorAbout(false);

          const formData = {
            email: userFound.email,
            updateOnline: true,
          };
          const responseUpdate = await axios.put(UPDATE_ONLINE_USER, formData);

          console.log(responseUpdate);

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
              loginWithAccountGoogle: loginWithAccountGoogle,
              isOnline: isOnline,
            },
          });

          const Mytoken = crypto.encrypt(
            JSON.stringify({
              emailSave: userFound.email,
              loginWithAccountGoogle: loginWithAccountGoogle,
              isCreated: false,
              isNotComplete: false,
              isUserConnect: true,
              isOnline: isOnline,
            })
          );

          if (token !== null) {
            localStorage.removeItem("token");
          }

          localStorage.setItem("token", Mytoken);

          navigate("/");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      {!myUserInfo && <CheckConnect everOneError={everOneError} />}
      <div className="bg-panel-header-background h-screen w-screen text-white flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-7xl">Chat App</span>
        </div>
        <h2 className="text-2xl">Creer son profil</h2>
        <div className="flex gap-6 mt-6">
          <div className="flex flex-col items-center justify-center mt-5 gap-6">
            <Input
              name={"Votre nom"}
              state={name}
              setState={setName}
              label={true}
              textPlaceholder={"Votre nom..."}
              setErrorInput={setErrorName}
              id="name"
              errorInput={errorName}
            />
            <Input
              name={"A propos"}
              state={about}
              setState={setAbout}
              label={true}
              textPlaceholder={"A propos..."}
              setErrorInput={setErrorAbout}
              id="about"
              errorInput={errorAbout}
            />
            <div className="flex items-center justify-center">
              <button
                className="flex items-center justify-center gap-7 bg-search-input-container-background h-max w-max p-5 rounded-lg"
                onClick={onBoardUserHandler}
              >
                Creer son compte
              </button>
            </div>
          </div>
          <div>
            <Avatar type={"xl"} image={image} setImage={setImage} />
          </div>
        </div>
      </div>
    </>
  );
}

export default OnBoarding;
