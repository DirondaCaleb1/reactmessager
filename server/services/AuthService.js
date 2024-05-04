import getPrismaInstance from "../utils/PrismaClient.js";
import AuthError from "../utils/Inputs/AuthError.js";
import bcrypt from "bcrypt";
import { renameSync, unlinkSync, existsSync } from "fs";
import { checkTypeFile } from "../utils/files/FileRequierement.js";

export const SignupService = async (req, res, next) => {
  const clientPrisma = getPrismaInstance();
  const {
    email,
    password,
    confirmPassword,
    fieldEmail,
    fieldPassword,
    fieldConfirmPassword,
  } = req.body;

  if (clientPrisma !== null) {
    try {
      await clientPrisma.$connect();

      const dataProvider = {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      };

      const fieldsProvider = {
        email: fieldEmail,
        password: fieldPassword,
        confirmPassword: fieldConfirmPassword,
      };

      const error = new AuthError(dataProvider, fieldsProvider, next);

      let errorHandled = error.signUpUserError();
      if (errorHandled) {
        if (errorHandled.message === "") {
          const userFound = await clientPrisma.users.findUnique({
            where: {
              email: email,
            },
            select: {
              id: true,
              name: true,
              email: true,
              about: true,
              phone: true,
              profilePicture: true,
            },
          });

          if (userFound === null) {
            const hashPassword = await bcrypt.hash(password, 12);

            const userToCreate = await clientPrisma.users.create({
              data: {
                email: email,
                name: "",
                password: hashPassword,
                about: "",
                phone: "",
                profilePicture: "",
                connectWithLogin: false,
              },
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                phone: true,
                profilePicture: true,
                connectWithLogin: true,
              },
            });

            return res.status(200).json({
              user: userToCreate,
              status: true,
              message: "Utilisateur créé",
              fieldErrors: errorHandled.fieldErrors,
            });
          } else {
            return res.status(201).json({
              user: null,
              status: false,
              message: "Identifiants déja présents dans le système",
              fieldErrors: errorHandled.fieldErrors,
            });
          }
        } else {
          return res.status(201).json({
            user: null,
            status: false,
            message: errorHandled.message,
            fieldErrors: errorHandled.fieldErrors,
          });
        }
      }
    } catch (err) {
      next(err);
    } finally {
      await clientPrisma.$disconnect();
    }
  }
};

export const LoginService = async (req, res, next) => {
  const clientPrisma = getPrismaInstance();
  const { email, password, fieldEmail, fieldPassword } = req.body;

  if (clientPrisma !== null) {
    try {
      await clientPrisma.$connect();

      const dataProvider = {
        email: email,
        password: password,
      };

      const fieldsProvider = {
        email: fieldEmail,
        password: fieldPassword,
      };

      const error = new AuthError(dataProvider, fieldsProvider, next);

      let errorHandled = error.loginUserError();
      if (errorHandled) {
        if (errorHandled.message === "") {
          const userFound = await clientPrisma.users.findUnique({
            where: {
              email: email,
            },
            select: {
              id: true,
              name: true,
              email: true,
              about: true,
              phone: true,
              password: true,
              profilePicture: true,
              connectWithLogin: true,
            },
          });

          if (userFound !== null) {
            const hashedPassword = userFound.password;

            const correctPassword = await bcrypt.compare(
              password,
              hashedPassword
            );

            if (correctPassword) {
              const userFind = {
                id: userFound.id,
                name: userFound.name,
                email: userFound.email,
                about: userFound.about,
                phone: userFound.phone,
                profilePicture: userFound.profilePicture,
              };
              return res.status(200).json({
                user: userFind,
                status: true,
                message: errorHandled.message,
                fieldErrors: errorHandled.fieldErrors,
              });
            } else {
              return res.status(201).json({
                user: null,
                status: false,
                message: "Identifiants invalides ou incorrects",
                fieldErrors: errorHandled.fieldErrors,
              });
            }
          } else {
            return res.status(201).json({
              user: null,
              status: false,
              message: "Identifiants invalides ou incorrects",
              fieldErrors: errorHandled.fieldErrors,
            });
          }
        } else {
          return res.status(201).json({
            user: null,
            status: false,
            message: errorHandled.message,
            fieldErrors: errorHandled.fieldErrors,
          });
        }
      }
    } catch (err) {
      next(err);
    } finally {
      await clientPrisma.$disconnect();
    }
  }
};

export const UploadProfileImage = async (req, res, next) => {
  //console.log(req.file);
  try {
    if (req.file) {
      //console.log(req.file);
      let validType = checkTypeFile(req.file, "image");

      if (
        typeof validType.correctType !== "undefined" &&
        validType.correctType === true
      ) {
        const date = Date.now();
        let fileName =
          "uploads/images/profiles/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);
        return res.status(200).json({
          fileName: fileName,
          message: "",
        });
      } else if (
        typeof validType.correctType !== "undefined" &&
        validType.correctType !== true
      ) {
        return res.status(201).json({
          fileName: "",
          message:
            "Veuillez fournir une image d'extension valide (les extensions valides sont jpeg, bmp, png, gif, jpg, ico, tif, JPEG, BMP, PNG, GIF, JPG, ICO, TIF où le fichier porte le nom xxx.Y avec Y l'une des extensions citées précédemment)",
        });
      }
    }
    return res.status(400).send("L'image doit être obligatoirement fourni");
  } catch (err) {
    next(err);
  }
};

export const DeleteProfileImage = async (req, res, next) => {
  try {
    let fileName = req.body.fileName;

    console.log(fileName);

    if (existsSync(fileName)) {
      unlinkSync(fileName);
    }

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const OnBoardUserService = async (req, res, next) => {
  const clientPrisma = getPrismaInstance();
  const {
    email,
    name,
    about,
    fieldName,
    fieldAbout,
    loginWithAccountGoogle,
    image: profilePicture,
  } = req.body;
  if (clientPrisma !== null) {
    try {
      await clientPrisma.$connect();

      const dataProvider = {
        name: name,
        about: about,
      };

      const fieldsProvider = {
        name: fieldName,
        about: fieldAbout,
      };

      const error = new AuthError(dataProvider, fieldsProvider, next);

      let errorHandled = error.onBoardUserError();

      if (errorHandled) {
        if (errorHandled.message === "") {
          let data;

          if (loginWithAccountGoogle === true) {
            data = await clientPrisma.users.create({
              data: {
                name: name,
                about: about,
                email: email,
                password: "",
                phone: "",
                profilePicture: profilePicture,
                connectWithLogin: true,
              },
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
                connectWithLogin: true,
              },
            });
          } else if (loginWithAccountGoogle === false) {
            data = await clientPrisma.users.update({
              where: {
                email: email,
              },
              data: {
                name: name,
                about: about,
                profilePicture: profilePicture,
                connectWithLogin: false,
              },
              select: {
                id: true,
                name: true,
                email: true,
                about: true,
                profilePicture: true,
                connectWithLogin: true,
              },
            });
          }

          return res.status(200).json({
            user: data,
            status: true,
            message: "",
            fieldErrors: errorHandled.fieldErrors,
          });
        } else {
          return res.status(201).json({
            user: null,
            status: false,
            message: errorHandled.message,
            fieldErrors: errorHandled.fieldErrors,
          });
        }
      }
    } catch (err) {
      next(err);
    } finally {
      await clientPrisma.$disconnect();
    }
  }
};

export const OnlineUserConnectUpdate = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    const { email, updateOnline } = req.body;

    await prisma.$connect();

    const updateOnlineUser = await prisma.users.update({
      data: {
        isConnect: updateOnline,
      },
      where: {
        email: email,
      },
      select: {
        isConnect: true,
      },
    });

    console.log({
      isConnected: updateOnlineUser.isConnect,
    });

    return res.status(200).json({
      isConnected: updateOnlineUser.isConnect,
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};
