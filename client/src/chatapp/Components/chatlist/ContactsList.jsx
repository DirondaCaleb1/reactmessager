import React, { useEffect, useState } from "react";
import axios from "axios";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import ChatListItem from "./ChatListItem.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import { GET_ALL_CONTACTS_ROUTE } from "../../utils/ApiRoutes.js";
import { reducerCases } from "../../context/constants.js";
import { RiRefreshFill } from "react-icons/ri";

function ContactsList({ codeTime, codeDay, yesterday, daysOfWeek }) {
  const [allContacts, setAllContacts] = useState([]);
  const [{ myUserInfo }, dispatch] = useStateProvider();
  const [myId, setMyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchContacts, setSearchContacts] = useState([]);

  useEffect(() => {
    const getId = () => {
      if (myUserInfo) {
        const userId = myUserInfo.id;

        setMyId(userId);
      }
    };

    setTimeout(() => {
      if (myUserInfo) {
        getId();
      }
    });
  }, [myUserInfo]);

  useEffect(() => {
    if (searchTerm.length) {
      const filterData = {};
      Object.keys(allContacts).forEach((key) => {
        filterData[key] = allContacts[key].filter((obj) =>
          obj.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setSearchContacts(filterData);
    } else {
      setSearchContacts(allContacts);
    }
  }, [allContacts, searchTerm]);

  useEffect(() => {
    const getAllContacts = async () => {
      try {
        const response = await axios.get(`${GET_ALL_CONTACTS_ROUTE}/${myId}`);

        if (response.status === 200) {
          const users = response.data.users;

          setAllContacts(users);

          setSearchContacts(users);
        }
      } catch (err) {
        console.log(err);
      }
    };

    setTimeout(() => {
      if (myId !== null) {
        getAllContacts();
      }
    }, 1000);
  }, [myId]);

  const refreshContacts = async () => {
    if (myId !== null) {
      try {
        const response = await axios.get(`${GET_ALL_CONTACTS_ROUTE}/${myId}`);

        if (response.status === 200) {
          const users = response.data.users;

          setAllContacts(users);

          setSearchContacts(users);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white">
          <BiArrowBack
            className="cursor-pointer text-xl"
            onClick={() =>
              dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })
            }
          />
          <span>Nouvelle Discussion</span>
          {myId !== null && (
            <RiRefreshFill
              className="text-panel-header-icon cursor-pointer text-3xl"
              title={"Actualiser vos contacts"}
              onClick={refreshContacts}
            />
          )}
        </div>
      </div>
      <div className="bg-search-input-container-background h-full flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background flex flex-grow items-center gap-5 px-3 py-1 rounded-lg mx-4">
            <div>
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-lg" />
            </div>
            <div className="w-full">
              <input
                type="text"
                placeholder={"Rechercher un contact..."}
                className="bg-transparent text-sm focus:outline-none text-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        {Object.entries(searchContacts)?.map(([initialLetter, userList]) => {
          return (
            userList.length > 0 && (
              <div key={Date.now() + initialLetter}>
                <div className="text-teal-light pl-10 py-5">
                  {initialLetter}
                </div>
                {userList.map((contact) => {
                  return (
                    <ChatListItem
                      data={contact}
                      isContactPage={true}
                      codeTime={codeTime}
                      codeDay={codeDay}
                      yesterday={yesterday}
                      daysOfWeek={daysOfWeek}
                      key={contact.id}
                    />
                  );
                })}
              </div>
            )
          );
        })}
      </div>
    </div>
  );
}

export default ContactsList;
