import getPrismaInstance from "../utils/PrismaClient.js";
import { KEY_SECRET_CRYPTO } from "../utils/crypto/crypto-dev.js";
import myCrypto from "../utils/crypto/index.js";
import { renameSync } from "fs";
import { maximumLengthFile } from "../utils/files/FileRequierement.js";

export const GetInitialContactsWithMessages = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    const userId = parseInt(req.params.from);
    await prisma.$connect();

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        sentMessages: {
          include: {
            reciever: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        recievedMessages: {
          include: {
            reciever: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    let messages;

    if (user) {
      messages = [...user.sentMessages, ...user.recievedMessages];
    } else {
      messages = [];
    }

    if (messages.length > 0) {
      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const users = new Map();
      const messagesStatusChange = [];

      messages.forEach((msg) => {
        const isSender = msg.senderId === userId;
        const calculatedId = isSender ? msg.recieverId : msg.senderId;
        if (msg.messageStatus === "sent") {
          messagesStatusChange.push(msg.id);
        }

        const {
          id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          recieverId,
        } = msg;

        if (!users.get(calculatedId)) {
          let user = {
            messageId: id,
            type,
            message,
            messageStatus,
            createdAt,
            senderId,
            recieverId,
          };

          if (isSender) {
            user = {
              ...user,
              ...msg.reciever,
              totalUnreadMessages: 0,
            };
          } else {
            user = {
              ...user,
              ...msg.sender,
              totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
            };
          }
          users.set(calculatedId, { ...user });
        } else if (messageStatus !== "read" && !isSender) {
          const user = users.get(calculatedId);
          users.set(calculatedId, {
            ...user,
            totalUnreadMessages: user.totalUnreadMessages + 1,
          });
        }
      });

      if (messagesStatusChange.length) {
        await prisma.messages.updateMany({
          where: {
            id: {
              in: messagesStatusChange,
            },
          },
          data: {
            messageStatus: "delivered",
          },
        });
      }

      return res.status(200).json({
        user: Array.from(users.values()),
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    } else {
      return res.status(201).json({
        user: null,
        onlineUsers: null,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const GetTotalUnreadMessage = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    const userId = parseInt(req.params.from);
    await prisma.$connect();

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        recievedMessages: {
          include: {
            reciever: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    /*

    sentMessages: {
          include: {
            reciever: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },


    */

    let messages;

    if (user) {
      messages = [...user.recievedMessages];
    } else {
      messages = [];
    }

    let unreadMessage = 0;

    if (messages.length > 0) {
      messages.forEach((msg) => {
        if (msg.messageStatus !== "read") {
          unreadMessage = unreadMessage + 1;
        }
      });
    }

    /*console.log({
      totalUnreadMessages: unreadMessage,
    });*/

    return res.status(200).json({
      totalUnreadMessages: unreadMessage,
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const GetAllMessages = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    const { from, to } = req.params;

    if (from && to) {
      const messages = await prisma.messages.findMany({
        where: {
          OR: [
            {
              senderId: parseInt(from),
              recieverId: parseInt(to),
            },
            {
              senderId: parseInt(to),
              recieverId: parseInt(from),
            },
          ],
        },
        orderBy: {
          id: "asc",
        },
      });

      const unReadMessages = [];

      messages.forEach((message, index) => {
        if (
          message.messageStatus !== "read" &&
          message.senderId === parseInt(to)
        ) {
          messages[index].messageStatus = "read";
          unReadMessages.push(message.id);
        }
      });

      await prisma.messages.updateMany({
        where: {
          id: {
            in: unReadMessages,
          },
        },
        data: {
          messageStatus: "read",
        },
      });

      /*console.log({
        messages: messages,
      });*/

      res.status(200).json({
        messages: messages,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

/* TEXT MESSAGES */
export const AddMessageText = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    const { message, from, to } = req.body;

    const crypto = myCrypto(KEY_SECRET_CRYPTO);

    const getUser = onlineUsers.get(to);

    if (message && from && to) {
      const cryptedMessage = crypto.encrypt(message);

      const newMessage = await prisma.messages.create({
        data: {
          message: cryptedMessage,
          sender: {
            connect: {
              id: parseInt(from),
            },
          },
          reciever: {
            connect: {
              id: parseInt(to),
            },
          },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: {
          sender: true,
          reciever: true,
        },
      });

      /*console.log({
        message: newMessage,
        error: "",
      });*/

      return res.status(200).send({
        message: newMessage,
        error: "",
      });
    } else {
      /*console.log({
        message: null,
        error: "",
      });*/
      return res.status(201).send({
        message: null,
        error:
          "L'emetteur du message, le recepteur du message et le message doivent être fournis obligaroirement",
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

/* Recordings (Vocal Message) Messages */
export const VocalRecordingMessage = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    //console.log(req.file);

    if (req.file) {
      //console.log(req.file);

      const date = Date.now();
      const { from, to } = req.query;
      let fileName = "uploads/recordings/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);

      if (from && to) {
        const newMessage = await prisma.messages.create({
          data: {
            message: fileName,
            sender: {
              connect: {
                id: parseInt(from),
              },
            },
            reciever: {
              connect: {
                id: parseInt(to),
              },
            },
            type: "audio",
          },
        });
        /*console.log({
          message: newMessage,
          error: "",
        });*/

        return res.status(200).send({
          message: newMessage,
          error: "",
        });
      } else {
        /*console.log({
          message: null,
          error:
            "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
        });*/
        return res.status(201).send({
          message: null,
          error:
            "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
        });
      }
    } else {
      /*console.log({
        message: null,
        error: "L'audio doit obligatoirement fourni",
      });*/
      return res.status(201).send({
        message: null,
        error: "L'audio doit obligatoirement fourni",
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

/* Audio  Messages */
export const AudioAttachMessage = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    //console.log(req.file);

    if (req.file) {
      //console.log(req.file);

      let isValid = maximumLengthFile(req.file, 51199953, "sound");

      if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === true &&
        isValid.correctLength === true
      ) {
        const date = Date.now();
        const { from, to } = req.query;
        let fileName =
          "uploads/recordings/audio/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);

        if (from && to) {
          const newMessage = await prisma.messages.create({
            data: {
              message: fileName,
              sender: {
                connect: {
                  id: parseInt(from),
                },
              },
              reciever: {
                connect: {
                  id: parseInt(to),
                },
              },
              type: "audio",
            },
          });
          /*console.log({
            message: newMessage,
            error: "",
            type: null,
          });*/

          return res.status(200).send({
            message: newMessage,
            error: "",
            type: null,
          });
        } else {
          /*console.log({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });*/
          return res.status(201).send({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });
        }
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === false &&
        isValid.correctLength === true
      ) {
        /*console.log({
          message: null,
          error: "Seul les sons sont autorisés",
          type: {
            type: true,
            length: false,
          },
        });*/
        return res.status(201).send({
          message: null,
          error: "Seul les sons sont autorisés",
          type: {
            type: true,
            length: false,
          },
        });
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === true &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === false &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error: "Seul les sons de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: true,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error: "Seul les sons de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: true,
            length: true,
          },
        });
      }
    } else {
      /*console.log({
        message: null,
        error: "L'audio doit obligatoirement fourni",
        type: null,
      });*/
      return res.status(201).send({
        message: null,
        error: "L'audio doit obligatoirement fourni",
        type: null,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

/* Video Messages */
export const VideoAttachMessage = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    //console.log(req.file);

    if (req.file) {
      //console.log(req.file);

      let isValid = maximumLengthFile(req.file, 51199953, "video");

      if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === true &&
        isValid.correctLength === true
      ) {
        const date = Date.now();
        const { from, to } = req.query;
        let fileName =
          "uploads/recordings/video/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);

        if (from && to) {
          const newMessage = await prisma.messages.create({
            data: {
              message: fileName,
              sender: {
                connect: {
                  id: parseInt(from),
                },
              },
              reciever: {
                connect: {
                  id: parseInt(to),
                },
              },
              type: "video",
            },
          });
          /*console.log({
            message: newMessage,
            error: "",
            type: null,
          });*/

          return res.status(200).send({
            message: newMessage,
            error: "",
            type: null,
          });
        } else {
          /*console.log({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });*/
          return res.status(201).send({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });
        }
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === false &&
        isValid.correctLength === true
      ) {
        /*console.log({
          message: null,
          error: "Seul les videos sont autorisées",
          type: {
            type: true,
            length: false,
          },
        });*/
        return res.status(201).send({
          message: null,
          error: "Seul les videos sont autorisées",
          type: {
            type: true,
            length: false,
          },
        });
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === true &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === false &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error:
            "Seul les videos de moins de 50 MegaOctets (Mo) sont autorisées",
          type: {
            type: true,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error:
            "Seul les videos de moins de 50 MegaOctets (Mo) sont autorisées",
          type: {
            type: true,
            length: true,
          },
        });
      }
    } else {
      /*console.log({
        message: null,
        error: "La video doit obligatoirement être fournie",
        type: null,
      });*/
      return res.status(201).send({
        message: null,
        error: "La video doit obligatoirement être fournie",
        type: null,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

/* Document Message */
export const DocumentAttachMessage = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    //console.log(req.file);

    if (req.file) {
      //console.log(req.file);

      let isValid = maximumLengthFile(req.file, 51199953, "document");

      if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === true &&
        isValid.correctLength === true
      ) {
        const date = Date.now();
        const { from, to } = req.query;
        let fileName =
          "uploads/recordings/documents/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);

        if (from && to) {
          const newMessage = await prisma.messages.create({
            data: {
              message: fileName,
              sender: {
                connect: {
                  id: parseInt(from),
                },
              },
              reciever: {
                connect: {
                  id: parseInt(to),
                },
              },
              type: "document",
            },
          });
          /*console.log({
            message: newMessage,
            error: "",
            type: null,
          });*/

          return res.status(200).send({
            message: newMessage,
            error: "",
            type: null,
          });
        } else {
          /*console.log({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });*/
          return res.status(201).send({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });
        }
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === false &&
        isValid.correctLength === true
      ) {
        /*console.log({
          message: null,
          error: "Seul les documents sont autorisés",
          type: {
            type: true,
            length: false,
          },
        });*/
        return res.status(201).send({
          message: null,
          error: "Seul les documents sont autorisés",
          type: {
            type: true,
            length: false,
          },
        });
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === true &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === false &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error:
            "Seul les documents de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: true,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error:
            "Seul les documents de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: true,
            length: true,
          },
        });
      }
    } else {
      /*console.log({
        message: null,
        error: "Le document doit obligatoirement être fourni",
        type: null,
      });*/
      return res.status(201).send({
        message: null,
        error: "Le document doit obligatoirement être fourni",
        type: null,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

/* Image Message */
export const ImageAttachMessage = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    //console.log(req.file);

    if (req.file) {
      //console.log(req.file);

      let isValid = maximumLengthFile(req.file, 51199953);

      if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === true &&
        isValid.correctLength === true
      ) {
        const date = Date.now();
        const { from, to } = req.query;
        let fileName = "uploads/images/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);

        if (from && to) {
          const newMessage = await prisma.messages.create({
            data: {
              message: fileName,
              sender: {
                connect: {
                  id: parseInt(from),
                },
              },
              reciever: {
                connect: {
                  id: parseInt(to),
                },
              },
              type: "image",
            },
          });
          /*console.log({
            message: newMessage,
            error: "",
            type: null,
          });*/

          return res.status(200).send({
            message: newMessage,
            error: "",
            type: null,
          });
        } else {
          /*console.log({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });*/
          return res.status(201).send({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });
        }
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === false &&
        isValid.correctLength === true
      ) {
        /*console.log({
          message: null,
          error: "Seul les images sont autorisés",
          type: {
            type: true,
            length: false,
          },
        });*/
        return res.status(201).send({
          message: null,
          error: "Seul les images sont autorisés",
          type: {
            type: true,
            length: false,
          },
        });
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === true &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctType === false &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error:
            "Seul les images de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: true,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error:
            "Seul les images de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: true,
            length: true,
          },
        });
      }
    } else {
      /*console.log({
        message: null,
        error: "L'image doit obligatoirement être fourni",
        type: null,
      });*/
      return res.status(201).send({
        message: null,
        error: "L'image doit obligatoirement être fourni",
        type: null,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

/* Other File Message */
export const OtherFileAttachMessage = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();

    //console.log(req.file);

    if (req.file) {
      //console.log(req.file);

      let isValid = maximumLengthFile(req.file, 51199953, "other");
      if (
        typeof isValid.correctType === "undefined" &&
        isValid.correctLength === true
      ) {
        const date = Date.now();
        const { from, to } = req.query;
        let fileName =
          "uploads/recordings/others/" + date + req.file.originalname;
        renameSync(req.file.path, fileName);

        if (from && to) {
          const newMessage = await prisma.messages.create({
            data: {
              message: fileName,
              sender: {
                connect: {
                  id: parseInt(from),
                },
              },
              reciever: {
                connect: {
                  id: parseInt(to),
                },
              },
              type: "other",
            },
          });
          /*console.log({
            message: newMessage,
            error: "",
            type: null,
          });*/

          return res.status(200).send({
            message: newMessage,
            error: "",
            type: null,
          });
        } else {
          /*console.log({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });*/
          return res.status(201).send({
            message: null,
            error:
              "L'emetteur du message et le recepteur du message  doivent être fournis obligaroirement",
            type: null,
          });
        }
      } else if (
        typeof isValid.correctType !== "undefined" &&
        isValid.correctLength === false
      ) {
        /*console.log({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });*/
        return res.status(201).send({
          message: null,
          error:
            "Seul les fichiers de moins de 50 MegaOctets (Mo) sont autorisés",
          type: {
            type: false,
            length: true,
          },
        });
      }
    } else {
      /*console.log({
        message: null,
        error: "Un fichier doit obligatoirement être fourni",
        type: null,
      });*/
      return res.status(201).send({
        message: null,
        error: "Un fichier doit obligatoirement être fourni",
        type: null,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};
