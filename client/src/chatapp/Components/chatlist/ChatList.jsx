import React, { useState, useEffect } from "react";
import ChatListHeader from "./ChatListHeader.jsx";
import SearchBar from "./SearchBar.jsx";
import List from "./List.jsx";
import ContactsList from "./ContactsList.jsx";
import { useStateProvider } from "../../context/StateContext.jsx";
import CallList from "./CallList.jsx";

function ChatList({
  codeTime,
  codeDay,
  yesterday,
  daysOfWeek,
  myVideoRef,
  peerVideoRef,
  infoCaller,
}) {
  const [pageType, setPageType] = useState("default");
  const [{ contactsPage, historyCallsPage }] = useStateProvider();

  useEffect(() => {
    if (contactsPage) {
      setPageType("all-contacts");
    } else {
      if (historyCallsPage) {
        setPageType("all-calls-history");
      } else {
        setPageType("default");
      }
    }
  }, [contactsPage, historyCallsPage]);

  return (
    <div className="bg-panel-header-background flex flex-col max-h-full z-20 w-[30%]">
      {pageType === "all-calls-history" && (
        <>
          <CallList
            codeTime={codeTime}
            codeDay={codeDay}
            yesterday={yesterday}
            daysOfWeek={daysOfWeek}
            myVideoRef={myVideoRef}
            peerVideoRef={peerVideoRef}
            infoCaller={infoCaller}
          />
        </>
      )}
      {pageType === "default" && (
        <>
          <ChatListHeader />
          <SearchBar />
          <List
            codeTime={codeTime}
            codeDay={codeDay}
            yesterday={yesterday}
            daysOfWeek={daysOfWeek}
          />
        </>
      )}
      {pageType === "all-contacts" && (
        <ContactsList
          codeTime={codeTime}
          codeDay={codeDay}
          yesterday={yesterday}
          daysOfWeek={daysOfWeek}
        />
      )}
    </div>
  );
}

export default ChatList;
