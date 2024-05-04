export const onAuthStateChangedAll = (
  loginWithGoogleAccount,
  callableLocal,
  callableFirebase,
  setRedirectLogin
) => {
  if (loginWithGoogleAccount !== null && loginWithGoogleAccount === false) {
    callableLocal();
  } else if (
    loginWithGoogleAccount !== null &&
    loginWithGoogleAccount === true
  ) {
    callableFirebase();
  } else if (loginWithGoogleAccount === null) {
    setRedirectLogin(true);
  }
};
