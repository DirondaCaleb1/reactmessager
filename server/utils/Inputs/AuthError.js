import {
  errorChanges,
  errorHandledByOneField,
  errorsAllFieldsEmpty,
  matchesPassword,
} from "./Errors.js";

class AuthError {
  constructor(dataAuth, fieldsName, next) {
    this.checkUserExistsError = () => {
      const arrayData = [dataAuth?.email];

      const arrayFieldNames = {
        email: fieldsName?.email || "email",
      };

      try {
        const isAllEmpty = errorsAllFieldsEmpty(arrayData);

        if (isAllEmpty.isEmpty) {
          return {
            message: "L'adresse email doit obligatoirement être fournie",
            status: false,
          };
        } else {
          const errorArrayMessages = {
            noMatchesRegExp:
              "possède des caractères invalides ou non autorisés",
            noError: "",
          };

          const objectErrorEmail = errorChanges(
            arrayFieldNames.email,
            errorArrayMessages
          );

          const regExpEmail = RegExp("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$");
          const errorEmailHandled = errorHandledByOneField(
            dataAuth?.email,
            objectErrorEmail,
            regExpEmail,
            0
          );

          let error = {
            errorEmailHandled: errorEmailHandled,
          };

          let errorMessage = "";

          let concactError = [];

          if (typeof error.errorEmailHandled.noMatchesRegExp !== "undefined") {
            concactError.push(
              error.errorEmailHandled.noMatchesRegExp +
                "(l'email doit comporter les caractères @ et .) "
            );
          } else if (typeof error.errorEmailHandled.noError !== "undefined") {
            concactError.push(error.errorEmailHandled.noError);
          }

          if (concactError.length > 0) {
            concactError.forEach((value) => {
              errorMessage += value;
            });
          }
          return {
            message: errorMessage,
            status: errorMessage === "" ? true : false,
          };
        }
      } catch (err) {
        next(err);
      }
    };

    this.signUpUserError = () => {
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
            noMatchesRegExp:
              "possède des caractères invalides ou non autorisés",
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

          if (
            typeof error.errorConfirmPasswordHandled.noError === "undefined"
          ) {
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
              if (
                matchesPassword(dataAuth?.password, dataAuth?.confirmPassword)
              ) {
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
              if (
                matchesPassword(dataAuth?.password, dataAuth?.confirmPassword)
              ) {
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
              if (
                matchesPassword(dataAuth?.password, dataAuth?.confirmPassword)
              ) {
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
        next(err);
      }
    };

    this.loginUserError = () => {
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
            noMatchesRegExp:
              "possède des caractères invalides ou non autorisés",
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
        next(err);
      }
    };

    this.onBoardUserError = () => {
      const arrayData = [dataAuth?.name, dataAuth?.about];

      const arrayFieldNames = {
        name: fieldsName?.name,
        about: fieldsName?.about,
      };

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
            noMatchesRegExp:
              "possède des caractères invalides ou non autorisés",
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

          if (typeof error.errorNameHandled.noError === "undefined") {
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
            concactError.push(error.errorNameHandled.noError);
            concactError.push(error.errorAboutHandled.empty);
          } else if (
            typeof error.errorNameHandled.noError !== "undefined" &&
            typeof error.errorAboutHandled.noError !== "undefined"
          ) {
            concactError.push(error.errorNameHandled.noError);
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
        next(err);
      }
    };
  }
}

export default AuthError;

/*






*/
