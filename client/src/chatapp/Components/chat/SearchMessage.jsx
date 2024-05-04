import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { BiSearchAlt2 } from "react-icons/bi";
import myCrypto from "../../crypto";
import { KEY_SECRET_CRYPTO } from "../../crypto/crypto-dev.js";
import { calculateTime } from "../../utils/CalculateTime.js";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import { GET_ALL_MESSAGES_ROUTE } from "../../utils/ApiRoutes.js";
import axios from "axios";

function SearchMessage({ codeTime, codeDay, yesterday, daysOfWeek }) {
  const crypto = myCrypto(KEY_SECRET_CRYPTO);
  const [searchTerm, setSearchTerm] = useState(""); //setSearchTerm(e.target.value);
  const [searchedMessages, setSearchedMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [{ currentChatUser, messages, allMessagesSearch, myUserInfo }, dispatch] = useStateProvider();


  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axios.get(
          `${GET_ALL_MESSAGES_ROUTE}/${myUserInfo?.id}/${currentChatUser?.id}`
        );

        const statusResponse = response.status;
        let messagesDB;

        if (statusResponse === 200) {
          messagesDB = response.data.messages;
        }

        
        setAllMessages(messagesDB);
      } catch (err) {
        console.log(err);
      }
    };

    if (currentChatUser?.id) {
      getMessages();
    }
  }, [currentChatUser, messages, myUserInfo]);

  

  /*useEffect(()=>{
    if(searchTerm){
      if (allMessages.length >0) {
        setSearchedMessages(allMessages.filter((value) => {
          return (
            value.type === "text" &&
            crypto.decrypt(value.message).includes(searchTerm)
          );
        }));
      }else{
        setSearchedMessages([])
      }
    }else{
      setSearchedMessages([])
    }

    
  }, [allMessages, crypto, searchTerm, setSearchedMessages]);*/

  const searchTermMessage = (e)=>{
    const termSearch = e.target.value;
    setSearchTerm(termSearch);

    if(termSearch){
      if(allMessages.length >0){
        setSearchedMessages(allMessages.filter((value) => {
          return (
            value.type === "text" &&
            crypto.decrypt(value.message).includes(termSearch)
          );
        }));
      }else{
        setSearchedMessages([])
      }      
    }else{
      setSearchedMessages([])
    }
                  
  }

  useEffect(()=>{
    console.log(searchTerm);
    console.log(searchedMessages);
  }, [searchTerm, searchedMessages])




  

  return (
    <div className="border-conversation-border border-l  bg-conversation-panel-background flex flex-col z-10 h-full w-[50%]">
      <div className="h-16 px-4 py-5 flex gap-10 items-center bg-panel-header-background text-primary-strong">
        <IoClose
          className="cursor-pointer text-icon-lighter text-2xl"
          onClick={() => {
            dispatch({
              type: reducerCases.SET_MESSAGE_SEARCH,
            });
          }}
        />
        <span>Recherche des Messages</span>
      </div>
      <div className="h-full overflow-auto custom-scrollbar">
        <div className="flex flex-col items-center w-full">
          <div className="flex px-5 items-center gap-3 h-14 w-full">
            <div className="bg-panel-header-background flex flex-grow items-center gap-5 px-3 py-1 rounded-lg">
              <div>
                <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-lg" />
              </div>
              <div className="w-full">
                <input
                  type="text"
                  placeholder={"Recherche un message..."}
                  className="bg-transparent text-sm focus:outline-none text-white w-full"
                  onChange={searchTermMessage}
                />
              </div>
            </div>
          </div>
          <span className="mt-10 text-secondary">
            {!searchTerm.length &&
              `Recherche des messages textuels de votre fil de discussion avec ${currentChatUser?.name}`}
          </span>
        </div>
        <div className="flex justify-center h-full flex-col">
          {searchTerm.length > 0 && !searchedMessages.length && (
            <span className="text-secondary w-full flex justify-center">
              Aucun message trouvé
            </span>
          )}
          <div className="flex flex-col w-full h-full">
            {searchedMessages.length > 0 &&
              searchedMessages?.map((message, index) => (
                <div
                  className="flex cursor-pointer justify-center flex-col hover:bg-background-default-hover w-full px-5 border-b-[0.1px] border-secondary py-5"
                  key={index}
                >
                  <div className="text-sm text-secondary">
                    {calculateTime(
                      message.createdAt,
                      codeTime,
                      codeDay,
                      yesterday,
                      daysOfWeek
                    )}
                  </div>
                  <div className="text-icon-green">
                    {crypto.decrypt(message.message)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchMessage;
