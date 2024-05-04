import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import axios from "axios";
//import { notification } from "antd";
import { KEY_SECRET_CRYPTO } from "../../crypto/crypto-dev.js";
import myCrypto from "../../crypto";
import {
  CHECK_USER_EXISTS_ROUTE,
  LOGIN_USER_LOCAL_ROUTE,
  SIGNUP_USER_LOCAL_ROUTE,
  UPDATE_ONLINE_USER,
} from "../../utils/ApiRoutes.js";
import {
  SignUpError,
  checkEmailError,
  LoginError,
} from "../../utils/errors/Error.js";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";

function ModalAuth({ setShowModal }) {
  const crypto = myCrypto(KEY_SECRET_CRYPTO);
  const navigate = useNavigate();
  const [{ newUser }, dispatch] = useStateProvider();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState(false);

  const fieldEmail = "email";
  const [error, setError] = useState("");
  const [authBtn, setAuthBtn] = useState("AUTHENTIFIER");
  const [authAction, setAuthAction] = useState("");

  const handleClick = () => {
    setShowModal(false);
  };

  const handleChangeInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailExists = async () => {
    try {
      const errorHandledObject = {
        empty: "Veuillez obligatoirement fournir une adresse Email",
        noMatch:
          "L'adresse Email que vous avez fourni possède des caractères invalides (L'adresse email doit posséder les caractères @ et .)",
        noError: "",
      };

      const errorHandled = checkEmailError(formData.email, errorHandledObject);

      const formDataEmail = {
        email: formData.email,
        fieldEmail: fieldEmail,
      };

      const response = await axios.post(CHECK_USER_EXISTS_ROUTE, formDataEmail);

      const status = response.status;
      const message = response.data.message;
      const userFound = response.data.user;

      if (message !== "" && errorHandled !== "") {
        setError(errorHandled);
        setAuthBtn("AUTHENTIFIER");
        setAuthAction("");
      } else if (errorHandled === "") {
        if (
          status === 201 &&
          message === "Identifiants invalides ou incorrectes" &&
          userFound === null
        ) {
          setError(errorHandled);
          setAuthBtn("INSCRIPTION");
          setAuthAction("signup");
        } else if (
          status === 200 &&
          message === "Utilisateur trouvé" &&
          userFound !== null
        ) {
          setError(errorHandled);
          setAuthBtn("CONNEXION");
          setAuthAction("login");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handlerRequestServer = async () => {
    await handleEmailExists();
  };

  useEffect(() => {
    console.log(newUser);
  }, [newUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let dataForm;
    let fieldsName;

    if (authAction !== "" && authAction === "signup") {
      try {
        dataForm = {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        };

        fieldsName = {
          email: "email",
          password: "Mot de passe",
          confirmPassword: "Confirmation de mot de passe",
        };

        const dataSignUp = {
          email: dataForm.email,
          password: dataForm.password,
          confirmPassword: dataForm.confirmPassword,
          fieldEmail: fieldsName.email,
          fieldPassword: fieldsName.password,
          fieldConfirmPassword: fieldsName.confirmPassword,
        };

        const response = await axios.post(SIGNUP_USER_LOCAL_ROUTE, dataSignUp);
        let isValidInputs = SignUpError(dataForm, fieldsName);

        const statusResponse = response.status;
        const status = response.data.status;
        const message = response.data.message;
        const userCreate = response.data.user;
        const fieldErrors = response.data.fieldErrors;

        if (statusResponse === 201 && userCreate === null && status === false) {
          if (
            (fieldErrors.length > 0 &&
              fieldErrors.includes(fieldsName.email)) ||
            (isValidInputs.fieldErrors.length > 0 &&
              isValidInputs.fieldErrors.includes(fieldsName.email))
          ) {
            setErrorEmail(true);
          }

          if (
            (fieldErrors.length > 0 &&
              fieldErrors.includes(fieldsName.password)) ||
            (isValidInputs.fieldErrors.length > 0 &&
              isValidInputs.fieldErrors.includes(fieldsName.password))
          ) {
            setErrorPassword(true);
          }

          if (
            (fieldErrors.length > 0 &&
              fieldErrors.includes(fieldsName.confirmPassword)) ||
            (isValidInputs.fieldErrors.length > 0 &&
              isValidInputs.fieldErrors.includes(fieldsName.confirmPassword))
          ) {
            setErrorConfirmPassword(true);
          }

          if (isValidInputs.message === message && message !== "") {
            setError(isValidInputs.message);
          }
        } else {
          setErrorEmail(false);
          setErrorPassword(false);
          setErrorConfirmPassword(false);
          setError("");

          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: true,
          });
          dispatch({
            type: reducerCases.SET_MY_USER_INFO,
            myUserInfo: {
              id: userCreate.id,
              name: userCreate.name,
              email: userCreate.email,
              status: userCreate.about,
              profilePicture: userCreate.profilePicture,
              loginWithAccountGoogle: false,
            },
          });

          const token = crypto.encrypt(
            JSON.stringify({
              emailSave: userCreate.email,
              loginWithAccountGoogle: false,
              isCreated: true,
              isNotComplete: true,
              isUserConnect: false,
            })
          );

          localStorage.setItem("token", token);

          navigate("/traitement");
        }
      } catch (err) {
        console.log(err);
      }
    } else if (authAction !== "" && authAction === "login") {
      try {
        dataForm = {
          email: formData.email,
          password: formData.password,
        };

        fieldsName = {
          email: "email",
          password: "Mot de passe",
        };

        const dataLogin = {
          email: dataForm.email,
          password: dataForm.password,
          fieldEmail: fieldsName.email,
          fieldPassword: fieldsName.password,
        };

        const response = await axios.post(LOGIN_USER_LOCAL_ROUTE, dataLogin);
        let isValidInputs = LoginError(dataForm, fieldsName);

        const statusResponse = response.status;
        const status = response.data.status;
        const message = response.data.message;
        const userFound = response.data.user;
        const fieldErrors = response.data.fieldErrors;

        if (statusResponse === 201 && userFound === null && status === false) {
          if (
            (fieldErrors.length > 0 &&
              fieldErrors.includes(fieldsName.email)) ||
            (isValidInputs.fieldErrors.length > 0 &&
              isValidInputs.fieldErrors.includes(fieldsName.email))
          ) {
            setErrorEmail(true);
          }

          if (
            (fieldErrors.length > 0 &&
              fieldErrors.includes(fieldsName.password)) ||
            (isValidInputs.fieldErrors.length > 0 &&
              isValidInputs.fieldErrors.includes(fieldsName.password))
          ) {
            setErrorPassword(true);
          }

          if (
            (fieldErrors.length > 0 &&
              fieldErrors.includes(fieldsName.confirmPassword)) ||
            (isValidInputs.fieldErrors.length > 0 &&
              isValidInputs.fieldErrors.includes(fieldsName.confirmPassword))
          ) {
            setErrorConfirmPassword(true);
          }

          if (isValidInputs.message === message && message !== "") {
            setError(isValidInputs.message);
          }
        } else {
          setErrorEmail(false);
          setErrorPassword(false);
          setErrorConfirmPassword(false);
          setError("");

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
              loginWithAccountGoogle: false,
              isOnline: isOnline,
            },
          });

          const token = crypto.encrypt(
            JSON.stringify({
              emailSave: userFound.email,
              loginWithAccountGoogle: false,
              isCreated: false,
              isNotComplete: false,
              isUserConnect: true,
              isOnline: isOnline,
            })
          );

          localStorage.setItem("token", token);

          navigate("/");
        }

        //console.log(response);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        event.target.id !== "email" ||
        event.target.id !== "password" ||
        event.target.id !== "confirmPassword"
      ) {
        setErrorEmail(false);
        setErrorPassword(false);
        setErrorConfirmPassword(false);
        setError("");
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="absolute left-0 right-0 top-[40px] ml-auto mr-auto max-w-[320px] h-[400px] bg-white rounded-xl ">
      <div
        className="rounded-full w-[60px] h-[60px] border-0 border-none bg-white text-red-700 float-right cursor-pointer"
        onClick={handleClick}
      >
        <IoClose className="text-red-700 text-4xl" />
      </div>
      <h2 className="text-2xl pl-4"> AUTHENTIFICATION </h2>
      <form
        className="flex w-full flex-col px-7"
        onSubmit={(e) => handleSubmit(e)}
      >
        <input
          type="email"
          id="email"
          name="email"
          placeholder={"Votre adresse email"}
          className={`py-[8px] mb-4 text-[17px] px-[8px] ${
            errorEmail === true ? "border-2 border-red-600" : ""
          }`}
          value={formData.email}
          onChange={handleChangeInput}
          onBlur={handlerRequestServer}
          required={true}
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder={"Votre mot de passe"}
          className={`py-[8px] mb-4 text-[17px] px-[8px] ${
            errorPassword === true ? "border-2 border-red-600" : ""
          }`}
          value={formData.password}
          onChange={handleChangeInput}
          onFocus={handlerRequestServer}
          required={true}
        />
        {authAction !== "" && authAction === "signup" && (
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder={"Retapez votre mot de passe"}
            className={`py-[8px] mb-4 text-[17px] px-[8px] ${
              errorConfirmPassword === true ? "border-2 border-red-600" : ""
            }`}
            value={formData.confirmPassword}
            onChange={handleChangeInput}
            required={true}
          />
        )}
        <input
          className="rounded-md bg-blue-700 text-white outline-2 outline-blue-700 hover:bg-white hover:text-blue-700 cursor-pointer"
          value={authBtn}
          type="submit"
        />
      </form>
      {error !== "" && (
        <div>
          <h2 className="text-red-700 text-center text-xl">{error}</h2>
        </div>
      )}
    </div>
  );
}

export default ModalAuth;
