export const checkEmailError = (email, errorHandled) => {
  if (typeof errorHandled !== "object") {
    throw new Error("Seul un objet tableau doit être fourni");
  } else {
    if (email.length === 0) {
      return errorHandled?.empty;
    } else if (email.length !== 0) {
      if (!/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(email)) {
        return errorHandled?.noMatch;
      } else {
        return errorHandled?.noError;
      }
    }
  }
};

const errorsAllFieldsEmpty = (arrayDataForm) => {
  if (typeof arrayDataForm !== "object") {
    throw new Error("Veuillez fournir un tableau");
  }

  let isEmpty;
  let totalEmpty = 0;

  for (let i = 0; i < arrayDataForm.length; i++) {
    let element = arrayDataForm[i];
    if (element === "") {
      totalEmpty += 1;
    }
  }

  //const lengthArray = arrayDataForm.length;

  if (totalEmpty === arrayDataForm.length) {
    isEmpty = true;
  } else {
    isEmpty = false;
  }

  return {
    isEmpty: isEmpty,
  };
};

const errorChanges = (name, errorArrayMessages) => {
  return {
    empty: `Le champ ${name} ${errorArrayMessages.empty}`,
    excessiveLength: `Le champ ${name} ${errorArrayMessages.excessiveLength}`,
    smallLength: `Le champ ${name} ${errorArrayMessages.smallLength}`,
    noMatchesRegExp: `Le champ ${name} ${errorArrayMessages.noMatchesRegExp}`,
    noError: errorArrayMessages.noError,
  };
};

const matchesPassword = (passwordFirstInput, passwordSecondInput) => {
  if (passwordFirstInput === passwordSecondInput) {
    return true;
  } else {
    return false;
  }
};

const errorHandledByOneField = (
  fieldValue,
  errorMessage,
  regExpValidate = undefined,
  lengthAuthorizate = 0
) => {
  if (typeof fieldValue !== "string" && typeof errorMessage === "object") {
    throw new Error(
      "Ce paramètre doit être de type 'string' ou chaine de caractère"
    );
  }

  if (typeof errorMessage !== "object" && typeof fieldValue === "string") {
    throw new Error("Ce paramètre doit être un objet");
  }

  if (typeof errorMessage !== "object" && typeof fieldValue !== "string") {
    throw new Error(
      "Le paramètre errorMessage doit être un objet et le paramètre fieldValue  doit être de type 'string' ou chaine de caractère"
    );
  }

  let error;
  if (fieldValue === "") {
    if (typeof errorMessage.empty !== "undefined") {
      error = { empty: errorMessage.empty };
    } else {
      throw new Error("Veuillez définir le paramètre empty");
    }
  } else {
    if (isNaN(lengthAuthorizate)) {
      throw new Error("Le paramètre lengthAuthorizate doit être un nombre");
    } else {
      if (lengthAuthorizate !== 0) {
        if (
          (typeof regExpValidate === "undefined" ||
            typeof regExpValidate !== "undefined") &&
          lengthAuthorizate < 0
        ) {
          throw new Error(
            "Le paramètre lengthAuthorizate doit être obligatoirement un nombre supérieur à 0"
          );
        } else if (
          lengthAuthorizate > 0 &&
          typeof regExpValidate === "undefined"
        ) {
          if (fieldValue.length !== lengthAuthorizate) {
            if (fieldValue.length > lengthAuthorizate) {
              if (typeof errorMessage.excessiveLength !== "undefined") {
                error = {
                  excessiveLength:
                    errorMessage.excessiveLength +
                    ` et le nombre de caractères doit être égale à ${lengthAuthorizate}`,
                };
              } else {
                throw new Error(
                  "Veuillez définir le paramètre excessiveLength"
                );
              }
            } else {
              if (typeof errorMessage.smallLength !== "undefined") {
                error = {
                  smallLength:
                    errorMessage.smallLength +
                    ` et le nombre de caractères doit être égale à ${lengthAuthorizate}`,
                };
              } else {
                throw new Error("Veuillez définir le paramètre smallLength");
              }
            }
          } else {
            if (typeof errorMessage.noError !== "undefined") {
              error = { noError: errorMessage.noError };
            } else {
              throw new Error("Veuillez définir le paramètre noError");
            }
          }
        } else if (
          lengthAuthorizate > 0 &&
          typeof regExpValidate !== "undefined"
        ) {
          if (fieldValue.length !== lengthAuthorizate) {
            if (
              fieldValue.length > lengthAuthorizate &&
              !regExpValidate.test(fieldValue)
            ) {
              if (
                typeof errorMessage.excessiveLength !== "undefined" &&
                typeof errorMessage.noMatchesRegExp !== "undefined"
              ) {
                error = {
                  excessiveLength:
                    errorMessage.excessiveLength +
                    ` et le nombre de caractères doit être égale à ${lengthAuthorizate}`,
                  noMatchesRegExp: errorMessage.noMatchesRegExp,
                };
              } else {
                throw new Error(
                  "Veuillez définir les paramètre excessiveLength et noMatchesRegExp"
                );
              }
            } else if (
              fieldValue.length > lengthAuthorizate &&
              regExpValidate.test(fieldValue)
            ) {
              if (
                typeof errorMessage.excessiveLength !== "undefined" &&
                typeof errorMessage.noMatchesRegExp !== "undefined"
              ) {
                error = {
                  excessiveLength:
                    errorMessage.excessiveLength +
                    ` et le nombre de caractères doit être égale à ${lengthAuthorizate}`,
                  noMatchesRegExp: "",
                };
              } else {
                throw new Error(
                  "Veuillez définir les paramètre excessiveLength et noMatchesRegExp"
                );
              }
            } else if (
              fieldValue.length < lengthAuthorizate &&
              !regExpValidate.test(fieldValue)
            ) {
              if (
                typeof errorMessage.smallLength !== "undefined" &&
                typeof errorMessage.noMatchesRegExp !== "undefined"
              ) {
                error = {
                  excessiveLength:
                    errorMessage.smallLength +
                    ` et le nombre de caractères doit être égale à ${lengthAuthorizate}`,
                  noMatchesRegExp: errorMessage.noMatchesRegExp,
                };
              } else {
                throw new Error(
                  "Veuillez définir les paramètre smallLength et noMatchesRegExp"
                );
              }
            } else if (
              fieldValue.length < lengthAuthorizate &&
              regExpValidate.test(fieldValue)
            ) {
              if (
                typeof errorMessage.smallLength !== "undefined" &&
                typeof errorMessage.noMatchesRegExp !== "undefined"
              ) {
                error = {
                  excessiveLength:
                    errorMessage.smallLength +
                    ` et le nombre de caractères doit être égale à ${lengthAuthorizate}`,
                  noMatchesRegExp: "",
                };
              } else {
                throw new Error(
                  "Veuillez définir les paramètre smallLength et noMatchesRegExp"
                );
              }
            }
          } else {
            if (!regExpValidate.test(fieldValue)) {
              if (typeof errorMessage.noMatchesRegExp !== "undefined") {
                error = { noMatchesRegExp: errorMessage.noMatchesRegExp };
              } else {
                throw new Error(
                  "Veuillez définir le paramètre noMatchesRegExp"
                );
              }
            } else {
              if (typeof errorMessage.noError !== "undefined") {
                error = { noError: errorMessage.noError };
              } else {
                throw new Error("Veuillez définir le paramètre noError");
              }
            }
          }
        }
      } else {
        if (typeof regExpValidate === "undefined") {
          if (typeof errorMessage.noError !== "undefined") {
            error = { noError: errorMessage.noError };
          } else {
            throw new Error("Veuillez définir le paramètre noError");
          }
        } else {
          if (!regExpValidate.test(fieldValue)) {
            if (typeof errorMessage.noMatchesRegExp !== "undefined") {
              error = {
                noMatchesRegExp: errorMessage.noMatchesRegExp,
              };
            } else {
              throw new Error("Veuillez définir le paramètre noMatchesRegExp");
            }
          } else {
            if (typeof errorMessage.noError !== "undefined") {
              error = { noError: errorMessage.noError };
            } else {
              throw new Error("Veuillez définir le paramètre noError");
            }
          }
        }
      }
    }
  }

  return error;
};

const validateLength = (input, minLength) => {
  if (input.length < minLength) {
    return false;
  } else {
    return true;
  }
};

export const SignUpError = (dataAuth, fieldsName) => {
  const arrayData = [
    dataAuth?.email,
    dataAuth?.password,
    dataAuth?.confirmPassword,
  ];

  const arrayFieldNames = {
    email: fieldsName?.email,
    password: fieldsName?.password,
    confirmPassword: fieldsName?.confirmPassword,
  };

  try {
    const isAllEmpty = errorsAllFieldsEmpty(arrayData);

    let fieldErrors = [];

    if (isAllEmpty.isEmpty) {
      fieldErrors.push(arrayFieldNames?.email);
      fieldErrors.push(arrayFieldNames?.password);
      fieldErrors.push(arrayFieldNames?.confirmPassword);
      return {
        message: "Tous les champs doivent obligatoirement être fournis",
        fieldErrors: fieldErrors,
      };
    } else {
      const errorArrayMessages = {
        empty: "doit obligatoirement être fourni",
        excessiveLength:
          "possède un nombre de caractère supérieur à celui demandé",
        smallLength:
          "possède un nombre de caractère  inférieur à celui demandé",
        noMatchesRegExp: "possède des caractères invalides ou non autorisés",
        noError: "",
      };

      const objectErrorEmail = errorChanges(
        arrayFieldNames.email,
        errorArrayMessages
      );
      const objectErrorPassword = errorChanges(
        arrayFieldNames.password,
        errorArrayMessages
      );
      const objectErrorConfirmPassword = errorChanges(
        arrayFieldNames.confirmPassword,
        errorArrayMessages
      );

      const regExpEmail = RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$");
      const errorEmailHandled = errorHandledByOneField(
        dataAuth?.email,
        objectErrorEmail,
        regExpEmail,
        0
      );
      const errorPasswordHandled = errorHandledByOneField(
        dataAuth?.password,
        objectErrorPassword,
        undefined,
        0
      );
      const errorConfirmPasswordHandled = errorHandledByOneField(
        dataAuth?.confirmPassword,
        objectErrorConfirmPassword,
        undefined,
        0
      );

      let error = {
        errorEmailHandled: errorEmailHandled,
        errorPasswordHandled: errorPasswordHandled,
        errorConfirmPasswordHandled: errorConfirmPasswordHandled,
      };

      let errorMessage = "";

      let concactError = [];

      if (typeof error.errorEmailHandled.noError === "undefined") {
        fieldErrors.push(arrayFieldNames?.email);
      }

      if (typeof error.errorPasswordHandled.noError === "undefined") {
        fieldErrors.push(arrayFieldNames?.password);
      }

      if (
        typeof error.errorPasswordHandled.noError !== "undefined" &&
        !matchesPassword(dataAuth?.password, dataAuth?.confirmPassword)
      ) {
        fieldErrors.push(arrayFieldNames?.password);
      }

      if (typeof error.errorConfirmPasswordHandled.noError === "undefined") {
        fieldErrors.push(arrayFieldNames?.confirmPassword);
      }

      if (
        typeof error.errorConfirmPasswordHandled.noError !== "undefined" &&
        !matchesPassword(dataAuth?.password, dataAuth?.confirmPassword)
      ) {
        fieldErrors.push(arrayFieldNames?.confirmPassword);
      }

      if (
        typeof error.errorEmailHandled.noMatchesRegExp !== "undefined" &&
        typeof error.errorPasswordHandled.empty !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.empty !== "undefined"
      ) {
        concactError.push(
          error.errorEmailHandled.noMatchesRegExp +
            "(l'email doit comporter les caractères @ et .) " +
            ", "
        );
        concactError.push(error.errorPasswordHandled.empty + " et ");
        concactError.push(error.errorConfirmPasswordHandled.empty);
      } else if (
        typeof error.errorEmailHandled.noError !== "undefined" &&
        typeof error.errorPasswordHandled.empty !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.empty !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.noError);
        concactError.push(error.errorPasswordHandled.empty + " et ");
        concactError.push(error.errorConfirmPasswordHandled.empty);
      } else if (
        typeof error.errorEmailHandled.empty !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.empty !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.empty + " et ");
        concactError.push(error.errorPasswordHandled.noError);
        concactError.push(error.errorConfirmPasswordHandled.empty);
      } else if (
        typeof error.errorEmailHandled.empty !== "undefined" &&
        typeof error.errorPasswordHandled.empty !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.empty + " et ");
        concactError.push(
          "veuillez obligatoirement fournir un mot de passe afin de le confirmer" +
            " et "
        );
      } else if (
        typeof error.errorEmailHandled.noMatchesRegExp !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.empty !== "undefined"
      ) {
        concactError.push(
          error.errorEmailHandled.noMatchesRegExp +
            "(l'email doit comporter les caractères @ et .) " +
            " et "
        );
        concactError.push(error.errorPasswordHandled.noError);
        concactError.push(error.errorConfirmPasswordHandled.empty);
      } else if (
        typeof error.errorEmailHandled.noError !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.empty !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.noError);
        concactError.push(error.errorPasswordHandled.noError);
        concactError.push(error.errorConfirmPasswordHandled.empty);
      } else if (
        typeof error.errorEmailHandled.noMatchesRegExp !== "undefined" &&
        typeof error.errorPasswordHandled.empty !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.noMatchesRegExp + " et ");
        concactError.push(
          "veuillez obligatoirement fournir un mot de passe afin de le confirmer"
        );
      } else if (
        typeof error.errorEmailHandled.noError !== "undefined" &&
        typeof error.errorPasswordHandled.empty !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.noError);
        concactError.push(
          "Veuillez obligatoirement fournir un mot de passe afin de le confirmer"
        );
      } else if (
        typeof error.errorEmailHandled.empty !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.empty);
        if (
          typeof error.errorPasswordHandled.noError !== "undefined" &&
          typeof error.errorConfirmPasswordHandled.noError !== "undefined"
        ) {
          if (matchesPassword(dataAuth?.password, dataAuth?.confirmPassword)) {
            concactError.push("");
          } else {
            concactError.push(
              " et les deux mots de passe doivent correspondre(les deux mots de passe doivent être identiques)"
            );
          }
        }
      } else if (
        typeof error.errorEmailHandled.noMatchesRegExp !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(
          error.errorEmailHandled.noMatchesRegExp +
            "(l'email doit comporter les caractères @ et .) "
        );
        if (
          typeof error.errorPasswordHandled.noError !== "undefined" &&
          typeof error.errorConfirmPasswordHandled.noError !== "undefined"
        ) {
          if (matchesPassword(dataAuth?.password, dataAuth?.confirmPassword)) {
            concactError.push("");
          } else {
            concactError.push(
              " et les deux mots de passe doivent correspondre(les deux mots de passe doivent être identiques) "
            );
          }
        }
      } else if (
        typeof error.errorEmailHandled.noError !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined" &&
        typeof error.errorConfirmPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.noError);
        if (
          typeof error.errorPasswordHandled.noError !== "undefined" &&
          typeof error.errorConfirmPasswordHandled.noError !== "undefined"
        ) {
          if (matchesPassword(dataAuth?.password, dataAuth?.confirmPassword)) {
            concactError.push("");
          } else {
            concactError.push(
              " Les deux mots de passe doivent correspondre(les deux mots de passe doivent être identiques) "
            );
          }
        }
      }

      if (concactError.length > 0) {
        concactError.forEach((value) => {
          errorMessage += value;
        });
      }
      return { message: errorMessage, fieldErrors: fieldErrors };
    }
  } catch (err) {
    console.log(err);
  }
};

export const LoginError = (dataAuth, fieldsName) => {
  const arrayData = [dataAuth?.email, dataAuth?.password];

  const arrayFieldNames = {
    email: fieldsName?.email,
    password: fieldsName?.password,
  };

  try {
    const isAllEmpty = errorsAllFieldsEmpty(arrayData);

    let fieldErrors = [];

    if (isAllEmpty.isEmpty) {
      fieldErrors.push(arrayFieldNames?.email);
      fieldErrors.push(arrayFieldNames?.password);
      return {
        message: "Tous les champs doivent obligatoirement être fournis",
        fieldErrors: fieldErrors,
      };
    } else {
      const errorArrayMessages = {
        empty: "doit obligatoirement être fourni",
        excessiveLength:
          "possède un nombre de caractère supérieur à celui demandé",
        smallLength:
          "possède un nombre de caractère  inférieur à celui demandé",
        noMatchesRegExp: "possède des caractères invalides ou non autorisés",
        noError: "",
      };

      const objectErrorEmail = errorChanges(
        arrayFieldNames.email,
        errorArrayMessages
      );
      const objectErrorPassword = errorChanges(
        arrayFieldNames.password,
        errorArrayMessages
      );

      const regExpEmail = RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$");
      const errorEmailHandled = errorHandledByOneField(
        dataAuth?.email,
        objectErrorEmail,
        regExpEmail,
        0
      );
      const errorPasswordHandled = errorHandledByOneField(
        dataAuth?.password,
        objectErrorPassword,
        undefined,
        0
      );

      let error = {
        errorEmailHandled: errorEmailHandled,
        errorPasswordHandled: errorPasswordHandled,
      };

      let errorMessage = "";

      let concactError = [];

      if (typeof error.errorEmailHandled.noError === "undefined") {
        fieldErrors.push(arrayFieldNames?.email);
      }

      if (typeof error.errorPasswordHandled.noError === "undefined") {
        fieldErrors.push(arrayFieldNames?.password);
      }

      if (
        typeof error.errorEmailHandled.noMatchesRegExp !== "undefined" &&
        typeof error.errorPasswordHandled.empty !== "undefined"
      ) {
        concactError.push(
          error.errorEmailHandled.noMatchesRegExp +
            "(l'email doit comporter les caractères @ et .) " +
            " et "
        );
        concactError.push(error.errorPasswordHandled.empty);
      } else if (
        typeof error.errorEmailHandled.noError !== "undefined" &&
        typeof error.errorPasswordHandled.empty !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.noError);
        concactError.push(error.errorPasswordHandled.empty);
      } else if (
        typeof error.errorEmailHandled.empty !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.empty);
        concactError.push(error.errorPasswordHandled.noError);
      } else if (
        typeof error.errorEmailHandled.noMatchesRegExp !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(
          error.errorEmailHandled.noMatchesRegExp +
            "(l'email doit comporter les caractères @ et .) " +
            ""
        );
        concactError.push(error.errorPasswordHandled.noError);
      } else if (
        typeof error.errorEmailHandled.noError !== "undefined" &&
        typeof error.errorPasswordHandled.noError !== "undefined"
      ) {
        concactError.push(error.errorEmailHandled.noError);
        concactError.push(error.errorPasswordHandled.noError);
      }

      if (concactError.length > 0) {
        concactError.forEach((value) => {
          errorMessage += value;
        });
      }
      return { message: errorMessage, fieldErrors: fieldErrors };
    }
  } catch (err) {
    console.log(err);
  }
};

export const OnBoardUserError = (dataAuth, fieldsName, minLength) => {
  const arrayData = [dataAuth?.name, dataAuth?.about];

  const arrayFieldNames = {
    name: fieldsName?.name,
    about: fieldsName?.about,
  };

  const validateLengthName = validateLength(dataAuth?.name, minLength);

  try {
    const isAllEmpty = errorsAllFieldsEmpty(arrayData);

    let fieldErrors = [];

    if (isAllEmpty.isEmpty) {
      fieldErrors.push(arrayFieldNames?.name);
      fieldErrors.push(arrayFieldNames?.about);
      return {
        message: "Tous les champs doivent obligatoirement être fournis",
        fieldErrors: fieldErrors,
      };
    } else {
      const errorArrayMessages = {
        empty: "doit obligatoirement être fourni",
        excessiveLength:
          "possède un nombre de caractère supérieur à celui demandé",
        smallLength:
          "possède un nombre de caractère  inférieur à celui demandé",
        noMatchesRegExp: "possède des caractères invalides ou non autorisés",
        noError: "",
      };

      const objectErrorName = errorChanges(
        arrayFieldNames.name,
        errorArrayMessages
      );
      const objectErrorAbout = errorChanges(
        arrayFieldNames.about,
        errorArrayMessages
      );

      const errorNameHandled = errorHandledByOneField(
        dataAuth?.name,
        objectErrorName,
        undefined,
        0
      );
      const errorAboutHandled = errorHandledByOneField(
        dataAuth?.about,
        objectErrorAbout,
        undefined,
        0
      );

      let error = {
        errorNameHandled: errorNameHandled,
        errorAboutHandled: errorAboutHandled,
      };

      let errorMessage = "";

      let concactError = [];

      if (
        typeof error.errorNameHandled.noError === "undefined" ||
        validateLengthName === false
      ) {
        fieldErrors.push(arrayFieldNames?.name);
      }

      if (typeof error.errorAboutHandled.noError === "undefined") {
        fieldErrors.push(arrayFieldNames?.about);
      }

      if (
        typeof error.errorNameHandled.empty !== "undefined" &&
        typeof error.errorAboutHandled.empty !== "undefined"
      ) {
        concactError.push(error.errorNameHandled.empty + " et ");
        concactError.push(error.errorAboutHandled.empty);
      } else if (
        typeof error.errorNameHandled.empty !== "undefined" &&
        typeof error.errorAboutHandled.noError !== "undefined"
      ) {
        concactError.push(error.errorNameHandled.empty);
        concactError.push(error.errorAboutHandled.noError);
      } else if (
        typeof error.errorNameHandled.noError !== "undefined" &&
        typeof error.errorAboutHandled.empty !== "undefined"
      ) {
        if (validateLengthName === false) {
          concactError.push(
            "Votre nom d'utilisateur doit posséder plus de " +
              minLength +
              " caractères et "
          );
        } else {
          concactError.push(error.errorNameHandled.noError);
        }
        concactError.push(error.errorAboutHandled.empty);
      } else if (
        typeof error.errorNameHandled.noError !== "undefined" &&
        typeof error.errorAboutHandled.noError !== "undefined"
      ) {
        if (validateLengthName === false) {
          concactError.push(
            "Votre nom d'utilisateur doit posséder plus de " +
              minLength +
              " caractères"
          );
        } else {
          concactError.push(error.errorNameHandled.noError);
        }
        concactError.push(error.errorAboutHandled.noError);
      }

      if (concactError.length > 0) {
        concactError.forEach((value) => {
          errorMessage += value;
        });
      }
      return { message: errorMessage, fieldErrors: fieldErrors };
    }
  } catch (err) {
    console.log(err);
  }
};
