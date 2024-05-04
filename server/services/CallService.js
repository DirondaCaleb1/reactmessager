import getPrismaInstance from "../utils/PrismaClient.js";

export const SaveCalls = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();
    const { from, to, callType, callerStatus } = req.body;

    const callCreate = await prisma.hystoryCalls.create({
      data: {
        outgoingCallId: from,
        incomingCallId: to,
        typeCall: callType,
        callerStatus: callerStatus,
        totalDuration: "00:00:00",
      },
      select: {
        id: true,
      },
    });

    if (callCreate) {
      return res.status(200).json({
        initCall: true,
        callCreate: callCreate,
      });
    }
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const UpdateCallFinishing = async (req, res, next) => {
  const prisma = getPrismaInstance();

  try {
    await prisma.$connect();
    const { id, from, to, totalDuration, endingCallingTime, callerStatus } =
      req.body;

    const callUpdate = await prisma.hystoryCalls.update({
      where: {
        id: parseInt(id),
        incomingCallId: parseInt(to),
        outgoingCallId: parseInt(from),
      },
      data: {
        totalDuration: totalDuration,
        endCallingTime: endingCallingTime,
        callerStatus: callerStatus,
      },
      select: {
        incomingUser: true,
        outgoingUser: true,
        totalDuration: true,
        endCallingTime: true,
        startCallingTime: true,
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
  const prisma = getPrismaInstance();

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

    const users = await prisma.users.findMany({
      select: {
        id: true,
      },
      where: {
        id: {
          not: parseInt(from),
        },
      },
    });

    let callings = [];
    let emitingUsersCall = new Map();
    let recievingUsersCall = new Map();
    let allCallUpdate = [];
    let allEmitingCalls;
    let allReceivedCalls;
    let valuesemitingUsersCall;
    let valuesReceivedUsersCall;

    if (allCalls.length > 0) {
      //Iterate allCalls to defines the necessary informations
      allCalls.forEach((call) => {
        const callUpdate = {
          incomingUserId: call.incomingUser.id,
          outgoingUserId: call.outgoingUser.id,
          incomingUserName: call.incomingUser.name,
          outgoingUserName: call.outgoingUser.name,
          incomingUserProfilePicture: call.incomingUser.profilePicture,
          outgoingUserProfilePcture: call.outgoingUser.profilePicture,
          incomingUserAbout: call.incomingUser.about,
          outgoingUserAbout: call.outgoingUser.about,
          incomingUserEmail: call.incomingUser.email,
          outgoingUserEmail: call.outgoingUser.email,
          totalDuration: call.totalDuration,
          startCallingTime: call.startCallingTime,
          endingCallingTime: call.endCallingTime,
          callerStatus: call.callerStatus,
          typeCall: call.typeCall,
        };

        //Insert each item in the array callings
        callings.push(callUpdate);
      });
    }

    //The callings Array contains an one less item
    if (callings.length > 0) {
      //Return the array contains all callings emitted by host(from)
      allEmitingCalls = callings.filter((calling) => {
        return parseInt(calling.incomingUserId) !== parseInt(from);
      });

      //Return the array contains all callings recieved by host(from)
      allReceivedCalls = callings.filter((calling) => {
        return parseInt(calling.incomingUserId) === parseInt(from);
      });

      for (let i = 0; i < users.length; i++) {
        //Iterate all callings emitted by host to set Map all calls
        allEmitingCalls.forEach((emitingCall) => {
          if (parseInt(emitingCall.incomingUserId) === parseInt(users[i].id)) {
            emitingUsersCall.set(users[i].id, {
              value: allEmitingCalls.filter((calling) => {
                return (
                  parseInt(calling.incomingUserId) === parseInt(users[i].id)
                );
              }),
              length: allEmitingCalls.filter((calling) => {
                return (
                  parseInt(calling.incomingUserId) === parseInt(users[i].id)
                );
              })?.length,
            });
          }
        });

        allReceivedCalls.forEach((recievedCall) => {
          if (parseInt(recievedCall.outgoingUserId) === parseInt(users[i].id)) {
            recievingUsersCall.set(users[i].id, {
              value: allReceivedCalls.filter((calling) => {
                return (
                  parseInt(calling.outgoingUserId) === parseInt(users[i].id)
                );
              }),
              length: allReceivedCalls.filter((calling) => {
                return (
                  parseInt(calling.outgoingUserId) === parseInt(users[i].id)
                );
              })?.length,
            });
          }
        });
      }

      valuesemitingUsersCall = Array.from(emitingUsersCall.values());

      valuesReceivedUsersCall = Array.from(recievingUsersCall.values());

      valuesemitingUsersCall.forEach((valuemitingUsersCall) => {
        const countItem = valuemitingUsersCall.length;
        const lastElement = valuemitingUsersCall.value[0];
        allCallUpdate.push({
          item: lastElement,
          countItem: countItem,
        });
      });

      valuesReceivedUsersCall.forEach((valueReceivedUsersCall) => {
        const lastElement = valueReceivedUsersCall.value[0];
        const countItem = valueReceivedUsersCall.length;
        allCallUpdate.push({
          item: lastElement,
          countItem: countItem,
        });
      });
    } else {
      allCallUpdate = [];
    }

    return res.status(200).json({
      allCalls: allCallUpdate,
    });
  } catch (err) {
    next(err);
  } finally {
    await prisma.$disconnect();
  }
};
