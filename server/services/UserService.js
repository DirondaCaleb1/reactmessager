import getPrismaInstance from "../utils/PrismaClient.js";

export const UserService = async (req, res, next) => {
  const id = parseInt(req.params.userId);

  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    const users = await prisma.users.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        profilePicture: true,
        connectWithLogin: true,
      },
      where: {
        id: {
          not: id,
        },
      },
    });

    const usersGroupedByInitialLetter = {};

    users.forEach((user) => {
      const initialLetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupedByInitialLetter[initialLetter]) {
        usersGroupedByInitialLetter[initialLetter] = [];
      }

      usersGroupedByInitialLetter[initialLetter].push(user);
    });

    //console.log({ users: usersGroupedByInitialLetter });

    res.status(200).send({ users: usersGroupedByInitialLetter });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};
