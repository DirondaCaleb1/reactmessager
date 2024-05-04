import getPrismaInstance from "../utils/PrismaClient.js";

export const CheckService = async (_req, res, next) => {
  const clientPrisma = getPrismaInstance();

  if (clientPrisma !== null) {
    try {
      await clientPrisma.$connect();

      const users = await clientPrisma.users.findMany();

      if (users.length > 0) {
        return res.status(200).json({
          connected: true,
        });
      } else {
        return res.status(201).json({
          connected: true,
        });
      }
    } catch (err) {
      next(err);
    } finally {
      await clientPrisma.$disconnect();
    }
  }
};
