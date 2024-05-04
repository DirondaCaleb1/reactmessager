import { existsSync } from "fs";

export const errorsAllFieldsEmpty = (arrayDataForm) => {
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

export const errorChanges = (name, errorArrayMessages) => {
  return {
    empty: `Le champ ${name} ${errorArrayMessages.empty}`,
    excessiveLength: `Le champ ${name} ${errorArrayMessages.excessiveLength}`,
    smallLength: `Le champ ${name} ${errorArrayMessages.smallLength}`,
    noMatchesRegExp: `Le champ ${name} ${errorArrayMessages.noMatchesRegExp}`,
    noError: errorArrayMessages.noError,
  };
};

export const matchesPassword = (passwordFirstInput, passwordSecondInput) => {
  if (passwordFirstInput === passwordSecondInput) {
    return true;
  } else {
    return false;
  }
};

export const fileExists = (filePath) => {
  if (existsSync(filePath)) {
    return filePath;
  } else {
    throw new Error("Fichier inexistants ou introuvable");
  }
};

/**
 *
 * @param {any} fieldValue
 * @param {RegExp | undefined} regExpValidate
 * @param {number} lengthAuthorizate
 * @param {any} errorMessage
 */

export const errorHandledByOneField = (
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
