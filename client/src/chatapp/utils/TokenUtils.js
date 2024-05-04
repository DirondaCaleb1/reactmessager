import { KEY_SECRET_CRYPTO } from "../crypto/crypto-dev.js";
import myCrypto from "../crypto/index.js";

const crypto = myCrypto(KEY_SECRET_CRYPTO);

export const getExplodeToken = (token) => {
  let jsonParse;

  if (token !== null) {
    const decryptToken = crypto.decrypt(token);

    jsonParse = JSON.parse(decryptToken);
  } else {
    jsonParse = null;
  }

  return jsonParse;
};

export const getEmailAndLoginMode = (token, myUserInfo) => {
  const jsonParse = getExplodeToken(token);

  let loginWithAccountGoogleJX;
  let loginWithAccountGoogle;
  let email;

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
    loginWithAccountGoogle = null;
  }

  return {
    email: email,
    loginWithAccountGoogle: loginWithAccountGoogle,
  };
};
