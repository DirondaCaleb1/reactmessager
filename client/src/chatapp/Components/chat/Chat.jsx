import React from "react";
import ChatHeader from "./ChatHeader.jsx";
import ChatContainer from "./ChatContainer.jsx";
import MessageBar from "./MessageBar.jsx";

function Chat({
  codeTime,
  codeDay,
  yesterday,
  daysOfWeek,
  myVideoRef,
  peerVideoRef,
  isCallExists,
  callIdentifs,
  myStreamRef,
  infoCaller,
  widthOfBlock = "full",
}) {
  return (
    <div
      className={`border-conversation-border border-l bg-conversation-panel-background flex flex-col z-10 h-full w-${widthOfBlock}`}
    >
      <ChatHeader
        myVideoRef={myVideoRef}
        peerVideoRef={peerVideoRef}
        isCallExists={isCallExists}
        callIdentifs={callIdentifs}
        myStreamRef={myStreamRef}
        infoCaller={infoCaller}
      />
      <ChatContainer
        codeTime={codeTime}
        codeDay={codeDay}
        yesterday={yesterday}
        daysOfWeek={daysOfWeek}
      />
      <MessageBar />
    </div>
  );
}

export default Chat;
