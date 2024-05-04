import getPrismaInstance from "../utils/PrismaClient.js";
import AuthError from "../utils/Inputs/AuthError.js";

export const checkUserEmailExist = async (req, res, next) => {
  const clientPrisma = getPrismaInstance();
  const { email, fieldEmail } = req.body;

  if (clientPrisma !== null) {
    try {
      await clientPrisma.$connect();

      const dataProvider = {
        email: email,
      };

      const fieldsProvider = {
        email: fieldEmail,
      };

      const error = new AuthError(dataProvider, fieldsProvider, next);

      let errorHandled = error.checkUserExistsError();
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
              profilePicture: true,
              connectWithLogin: true,
            },
          });

          if (userFound) {
            return res.status(200).json({
              user: userFound,
              message: "Utilisateur trouvé",
              status: errorHandled.status,
            });
          } else {
            return res.status(201).json({
              user: null,
              message: "Identifiants invalides ou incorrectes",
              status: errorHandled.status,
            });
          }
        } else {
          return res.status(201).json({
            user: null,
            message: errorHandled.message,
            status: errorHandled.status,
          });
        }
      } else {
        return res.status(201).json({
          user: null,
          message: "",
          status: false,
        });
      }
    } catch (err) {
      next(err);
    } finally {
      await clientPrisma.$disconnect();
    }
  }
};
