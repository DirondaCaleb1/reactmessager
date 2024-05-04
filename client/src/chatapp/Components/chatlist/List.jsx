import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatListItem from "./ChatListItem.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { GET_INITIAL_CONTACTS_ROUTE } from "../../utils/ApiRoutes.js";

function List({ codeTime, codeDay, yesterday, daysOfWeek }) {
  const [{ myUserInfo, userContacts, filteredContacts, messages }, dispatch] =
    useStateProvider();

    const [statusMessage, setStatusMessage] = useState("sent");

  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await axios.get(
          `${GET_INITIAL_CONTACTS_ROUTE}/${myUserInfo?.id}`
        );

        //console.log(response);

        const statusResponse = response.status;
        let onlineUsers;
        let contactUsers;

        if (statusResponse === 200) {
          onlineUsers = response.data.onlineUsers;
          contactUsers = response.data.user;
        } else {
          onlineUsers = [];
          contactUsers = [];
        }

        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers: onlineUsers,
        });

        dispatch({
          type: reducerCases.SET_USER_CONTACTS,
          userContacts: contactUsers,
        });
      } catch (err) {
        console.log(err);
      }
    };

    if (myUserInfo?.id) {
      getContacts();
    }
  }, [dispatch, myUserInfo]);

  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await axios.get(
          `${GET_INITIAL_CONTACTS_ROUTE}/${myUserInfo?.id}`
        );

        const statusResponse = response.status;
        let onlineUsers;
        let contactUsers;

        if (statusResponse === 200) {
          onlineUsers = response.data.onlineUsers;
          contactUsers = response.data.user;
        } else {
          onlineUsers = [];
          contactUsers = [];
        }

        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers: onlineUsers,
        });

        dispatch({
          type: reducerCases.SET_USER_CONTACTS,
          userContacts: contactUsers,
        });
      } catch (err) {
        console.log(err);
      }
    };

    if (myUserInfo?.id) {
      getContacts();
    }
  }, [dispatch, myUserInfo, messages]);

  useEffect(()=>{
    for (let i = messages.length - 1; i >= 0; i--) {
      const lastElement = messages[messages.length - 1];
      if(lastElement.messageStatus === "sent"){
         setStatusMessage("sent");
      }else if(lastElement.messageStatus === "delivered"){
         setStatusMessage("delivered");
      }else if(lastElement.messageStatus === "read"){
         setStatusMessage("read");
      }
    }
  }, [messages]);

  useEffect(()=>{
    const getContacts = async () => {
      try {
        const response = await axios.get(
          `${GET_INITIAL_CONTACTS_ROUTE}/${myUserInfo?.id}`
        );

        const statusResponse = response.status;
        let onlineUsers;
        let contactUsers;

        if (statusResponse === 200) {
          onlineUsers = response.data.onlineUsers;
          contactUsers = response.data.user;
        } else {
          onlineUsers = [];
          contactUsers = [];
        }

        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers: onlineUsers,
        });

        dispatch({
          type: reducerCases.SET_USER_CONTACTS,
          userContacts: contactUsers,
        });
      } catch (err) {
        console.log(err);
      }
    };

    if (myUserInfo?.id) {
      getContacts();
    }
  }, [dispatch, myUserInfo, statusMessage])

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full">
      {filteredContacts && filteredContacts.length > 0
        ? filteredContacts.map((contact) => (
            <ChatListItem
              data={contact}
              codeTime={codeTime}
              codeDay={codeDay}
              yesterday={yesterday}
              daysOfWeek={daysOfWeek}
              key={contact.id}
            />
          ))
        : userContacts?.map((contact) => (
            <ChatListItem
              data={contact}
              codeTime={codeTime}
              codeDay={codeDay}
              yesterday={yesterday}
              daysOfWeek={daysOfWeek}
              key={contact.id}
            />
          ))}
    </div>
  );
}

export default List;
