import { PrismaClient } from "@prisma/client";
import getPrismaInstance from "../utils/PrismaClient.js";
import AuthError from "../utils/Inputs/AuthError.js";
import bcrypt from "bcrypt";
const OnBoardUserService = async (req: any, res: any, next: any) => {
  const clientPrisma: PrismaClient | null = getPrismaInstance();
  const {
    email,
    name,
    about,
    fieldName,
    fieldAbout,
    googleWithAccountGoogle,
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
          let data: any;

          if (googleWithAccountGoogle === true) {
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
          } else if (googleWithAccountGoogle === false) {
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

const GetInitialContactsWithMessages = async (req, res, next) => {
  const prisma: PrismaClient = getPrismaInstance();

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

    let messages: any[];

    if (user !== null) {
      messages = [...user.sentMessages, ...user.recievedMessages];
    } else {
      messages = [];
    }

    if (messages.length > 0) {
      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const users = new Map();
      const messagesStatusChange: any[] = [];

      messages.forEach((msg: any) => {
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
        onlineUsers: [] /*Array.from(onlineUsers.keys())*/,
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

export const GetTotalMessageUnread = async (req, res, next) => {
  const { from, to, incrementNotification } = req.params;

  const prisma: PrismaClient = getPrismaInstance();

  try {
    await prisma.$connect();

    const userId = parseInt(req.params.from);

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

    /*const user = await prisma.users.findUnique({
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
    }*/
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const OnlineUserConnectUpdate = async (req, res, next) => {
  const prisma: PrismaClient = getPrismaInstance();

  try {
    const { email, updateOnline } = req.body;

    await prisma.$connect();

    const updateOnlineUser = await prisma.users.update({
      data: {
        isConnect: true,
      },
      where: {
        email: email,
      },
      select: {
        isConnect: updateOnline,
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

export const SaveCalls = async (req, res, next) => {
  const prisma: PrismaClient = getPrismaInstance();

  try {
    await prisma.$connect();
    /*

    outgoingCallId   from
  incomingCallId   to
  typeCall         callType
  callerStatus     @default("missed") callerStatus
  totalDuration    
  startCallingTime DateTime @default(now())
  endCallingTime DateTime @default(now())


    */

    const { from, to, callType, callerStatus, startCallingTime } = req.body;

    const callCreate = await prisma.hystoryCalls.create({
      data: {
        outgoingCallId: from,
        incomingCallId: to,
        typeCall: callType,
        callerStatus: callerStatus,
        totalDuration: "0",
        startCallingTime: startCallingTime,
      },
      select: {
        incomingUser: true,
        outgoingUser: true,
        totalDuration: true,
        callerStatus: true,
        typeCall: true,
        endCallingTime: true,
      },
    });

    if (callCreate) {
      return res.status(200).json({
        call: callCreate,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const UpdateCallFinishing = async (req, res, next) => {
  const prisma: PrismaClient = getPrismaInstance();

  try {
    await prisma.$connect();
    const { id, from, to, totalDuration, endingCallingTime } = req.body;

    const callUpdate = await prisma.hystoryCalls.update({
      where: {
        id: parseInt(id),
        incomingCallId: parseInt(to),
        outgoingCallId: parseInt(from),
      },
      data: {
        totalDuration: totalDuration,
        endCallingTime: endingCallingTime,
      },
      select: {
        incomingUser: true,
        outgoingUser: true,
        totalDuration: true,
        startCallingTime: true,
        endCallingTime: true,
        callerStatus: true,
        typeCall: true,
      },
    });

    if (callUpdate) {
      const callUpdateData = {
        incomingUserId: callUpdate.incomingUser.id,
        outgoingUserId: callUpdate.outgoingUser.id,
        incomingUserName: callUpdate.incomingUser.name,
        outgoingUserName: callUpdate.outgoingUser.name,
        incomingUserProfilePicture: callUpdate.incomingUser.profilePicture,
        outgoingUserProfilePcture: callUpdate.outgoingUser.profilePicture,
        totalDuration: callUpdate.totalDuration,
        startCallingTime: callUpdate.startCallingTime,
        endingCallingTime: callUpdate.endCallingTime,
        callerStatus: callUpdate.callerStatus,
        typeCall: callUpdate.typeCall,
      };

      return res.status(200).json({
        callUpdate: callUpdateData,
      });
    } else {
      return res.status(201).json({
        callUpdate: null,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const GetAllCalls = async (req, res, next) => {
  const prisma: PrismaClient = getPrismaInstance();

  try {
    await prisma.$connect();
    const { from } = req.params;

    const allCalls = await prisma.hystoryCalls.findMany({
      where: {
        OR: [
          {
            incomingCallId: parseInt(from),
          },
          {
            outgoingCallId: parseInt(from),
          },
        ],
        callerStatus: {
          not: "",
        },
      },
      select: {
        incomingUser: true,
        outgoingUser: true,
        totalDuration: true,
        startCallingTime: true,
        endCallingTime: true,
        callerStatus: true,
        typeCall: true,
      },
      orderBy: {
        startCallingTime: "desc",
      },
    });

    let callings: any[] = [];

    if (allCalls.length > 0) {
      allCalls.forEach((call) => {
        /*

        {
          name: data.name,
          about: data.about,
          profilePicture: data.profilePicture,
          email: data.email,
          id:
            myUserInfo?.id === data.senderId ? data.recieverId : data.senderId,
        }

        */

        const callUpdate = {
          incomingUserId: call.incomingUser.id,
          outgoingUserId: call.outgoingUser.id,
          incomingUserName: call.incomingUser.name,
          outgoingUserName: call.outgoingUser.name,
          incomingUserProfilePicture: call.incomingUser.profilePicture,
          outgoingUserProfilePcture: call.outgoingUser.profilePicture,
          totalDuration: call.totalDuration,
          startCallingTime: call.startCallingTime,
          endingCallingTime: call.endCallingTime,
          callerStatus: call.callerStatus,
          typeCall: call.typeCall,
          incomingUserAbout: call.incomingUser.about,
          outgoingUserAbout: call.outgoingUser.about,
          incomingUserEmail: call.incomingUser.email,
          outgoingUserEmail: call.outgoingUser.email,
        };

        callings.push(callUpdate);
      });
    }

    let allCallUpdate: any[] = [];
    let lenghCallsEmiting = 0;
    let lenghCallsReceived = 0;
    let allCallsIncomingUserId: any[] = [];
    let allCallsOutgoingUserId: any[] = [];
    let othersCall: any[] = [];

    if (callings.length > 0) {
      callings.forEach((calling) => {
        if (calling.incomingUserId !== from) {
          allCallsIncomingUserId.push(calling.incomingUserId);
        } else if (calling.outgoingUserId !== from) {
          allCallsOutgoingUserId.push(calling.outgoingUserId);
        }
      });

      /*let sameAllCallsIncomingUserId: any[] = [];
      let otherAllCallsIncomingUserId: any[] = [];
      let sameAllCallsOutgoingUserId: any[] = [];
      let otherAllCallsOutgoingUserId: any[] = [];

      for (let i = 0; i < allCallsIncomingUserId.length; i++){
        let j = i+1;
        while (j < allCallsIncomingUserId.length) {
          if (allCallsIncomingUserId[i] === allCallsIncomingUserId[j]) {
            sameAllCallsIncomingUserId.push(allCallsIncomingUserId[i]);
          } else {
            otherAllCallsIncomingUserId.push(allCallsIncomingUserId[i]);
          }
          j++;
        }
      }*/

      /*callings.forEach((calling) => {
        if (calling.incomingUserId === to && calling.outgoingUserId === from) {
          allCallsEmiting.push(calling);
          lenghCallsEmiting++;
        } else if (
          calling.incomingUserId === from &&
          calling.outgoingUserId === to
        ) {
          allCallsReceived.push(calling);
          lenghCallsReceived++;
        } else {
           othersCall
        }
      });*/

      //for (let i = 0; i <allCallsEmiting)
    } else {
      allCallUpdate = [];
    }

    /*if (calls.has("full")) {
      //messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const callsEmit = Array.from(calls.values());
      const callsE = callsEmit[0];

      if (callsE?.length >0) {
        callsE?.sort(
          (a, b) => b.startCallingTime.getTime() - a.startCallingTime.getTime()
        );
      }
    } else {
      
    }*/

    /*

    const callUpdateData = {
        incomingUserId: call.incomingUser.id,
        outgoingUserId: call.outgoingUser.id,
        incomingUserName: call.incomingUser.name,
        outgoingUserName: call.outgoingUser.name,
        incomingUserProfilePicture: call.incomingUser.profilePicture,
        outgoingUserProfilePcture: call.outgoingUser.profilePicture,
        totalDuration: call.totalDuration,
        startCallingTime: call.startCallingTime,
        endingCallingTime: call.endCallingTime,
        callerStatus: call.callerStatus,
        typeCall: call.typeCall,
      };


    */

    return res.status(200).json({
      allCalls: allCalls,
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};
