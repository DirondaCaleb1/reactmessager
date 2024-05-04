import React, { useState, useEffect } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useStateProvider } from "../../context/StateContext.jsx";
import { reducerCases } from "../../context/constants.js";
import CallListItem from "./CallListItem.jsx";
import axios from "axios";
import { GET_ALL_CALLS } from "../../utils/ApiRoutes.js";

function CallList({
  codeTime,
  codeDay,
  yesterday,
  daysOfWeek,
  myVideoRef,
  peerVideoRef,
  infoCaller,
}) {
  const [{ myUserInfo, historyCalls }, dispatch] = useStateProvider();
  const [myId, setMyId] = useState(null);
  const [allCalls, setAllCalls] = useState([]);

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
    const getAllCalls = async () => {
      try {
        const response = await axios.get(`${GET_ALL_CALLS}/${myId}`);

        const statusResponse = response.status;

        let allResponse = [];

        if (statusResponse === 200) {
          allResponse = response.data.allCalls;
        }

        setAllCalls(allResponse);
      } catch (err) {
        console.log(err);
      }
    };

    if (myId !== null) {
      getAllCalls();
    }
  }, [myId, historyCalls]);

  useEffect(() => {
    console.log(allCalls);

    const iterateCall = () => {
      allCalls?.forEach((call) => {
        console.log({
          item: call.item,
          countItem: call.countItem,
        });
      });
    };

    if (allCalls?.length > 0) {
      iterateCall();
    }
  }, [allCalls, historyCalls]);

  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white">
          {/*  */}
          <BiArrowBack
            className="cursor-pointer text-xl"
            onClick={() =>
              dispatch({ type: reducerCases.SET_ALL_HISTORY_CALLS })
            }
          />
          <span>Appels récents</span>
        </div>
      </div>
      <div className="bg-search-input-container-background h-full flex-auto overflow-auto custom-scrollbar">
        <div>
          {allCalls?.length > 0 &&
            allCalls?.map((call, index) => (
              <CallListItem
                data={call.item}
                callTimes={call.countItem}
                codeTime={codeTime}
                codeDay={codeDay}
                yesterday={yesterday}
                daysOfWeek={daysOfWeek}
                myVideoRef={myVideoRef}
                peerVideoRef={peerVideoRef}
                infoCaller={infoCaller}
                key={index}
              />
            ))}
          {/**/}
        </div>
      </div>
    </div>
  );
}

export default CallList;
