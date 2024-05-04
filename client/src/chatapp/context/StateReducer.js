import { reducerCases } from "./constants.js";

export const initialState = {
  myUserInfo:
    undefined /* Defines the user information to Host (Client of Web Application) */,
  newUser: false /* Defines the user is created */,
  contactsPage: false /* Defines the contact page */,
  currentChatUser: undefined /* Defines the user to Chat */,
  socket:
    undefined /* Defines the socket to initialize the asynchronous bidirectionnal communication */,
  messages: [] /* Defines the array Messages to includes the message */,
  unreadMessages: 0 /* Defines all unread Messages */,
  messagesSearch: false /* Defines search Message */,
  allMessagesSearch: [],
  myStream: undefined /* Defines the stram of user */,
  logoutAccess: false /* Defines the parameter to access to logout page */,
  userContacts: [] /* Defines the contacts, the host to chat */,
  onlineUsers: [] /* Defines the users is connected, that is not Host */,
  connectUsers: [] /* Defines the users is connected, that is not Host */,
  filteredContacts: [] /* Defines the result of filtering */,
  ringingCall: undefined /* Defines the ringing Call */,
  incomingVoiceCall: undefined /* Defines incoming Voice Call */,
  incomingVideoCall: undefined /* Defines incoming Video Call */,
  videoCall: undefined /* Defines Video Call */,
  voiceCall: undefined /* Defines Voice Call */,
  idCall: undefined /* Defines id Call to save History Call */,
  historyCalls: [] /* Defines the array Messages to includes the message */,
  historyCallsPage: false /* Defines the contact page */,
};

//SET_ALL_MESSAGES_SEARCH

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_MY_USER_INFO:
      return {
        ...state,
        myUserInfo: action.myUserInfo,
      };
    case reducerCases.SET_NEW_USER:
      return {
        ...state,
        newUser: action.newUser,
      };
    case reducerCases.SET_ALL_CONTACTS_PAGE:
      return {
        ...state,
        contactsPage: !state.contactsPage,
      };
    case reducerCases.CHANGE_CURRENT_CHAT_USER:
      return {
        ...state,
        currentChatUser: action.user,
      };
    case reducerCases.SET_SOCKET:
      return {
        ...state,
        socket: action.socket,
      };
    case reducerCases.SET_MESSAGES:
      return {
        ...state,
        messages: action.messages,
      };
    case reducerCases.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.newMessage],
      };
    case reducerCases.SET_UNREAD_MESSAGE:
      return {
        ...state,
        unreadMessages: 0 + action.unreadMessages,
      };
    case reducerCases.ADD_UNREAD_MESSAGE:
      return {
        ...state,
        unreadMessages: state.unreadMessages + 1,
      };
    case reducerCases.SET_MESSAGE_SEARCH:
      return {
        ...state,
        messagesSearch: !state.messagesSearch,
      };
    case reducerCases.SET_ALL_MESSAGES_SEARCH:
      return {
        ...state,
        allMessagesSearch: action.allMessagesSearch,
      };
    case reducerCases.SET_MY_STREAM:
      return {
        ...state,
        myStream: action.myStream,
      };
    case reducerCases.SET_LOGOUT_ACCESS:
      return {
        ...state,
        logoutAccess: action.logoutAccess,
      };
    case reducerCases.SET_USER_CONTACTS:
      return {
        ...state,
        userContacts: action.userContacts,
      };
    case reducerCases.SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: action.onlineUsers,
      };
    case reducerCases.SET_CONNECT_USERS:
      return {
        ...state,
        connectUsers: action.connectUsers,
      };
    case reducerCases.SET_CONTACT_SEARCH:
      const filteredContacts = state.userContacts.filter((contact) =>
        contact.name.toLowerCase().includes(action.contactSearch.toLowerCase())
      );
      return {
        ...state,
        contactSearch: action.contactSearch,
        filteredContacts,
      };
    case reducerCases.SET_INCOMING_VOICE_CALL:
      return {
        ...state,
        incomingVoiceCall: action.incomingVoiceCall,
      };
    case reducerCases.SET_INCOMING_VIDEO_CALL:
      return {
        ...state,
        incomingVideoCall: action.incomingVideoCall,
      };
    case reducerCases.SET_RINGING_CALL:
      return {
        ...state,
        ringingCall: action.ringingCall,
      };
    case reducerCases.SET_VIDEO_CALL:
      return {
        ...state,
        videoCall: action.videoCall,
      };
    case reducerCases.SET_VOICE_CALL:
      return {
        ...state,
        voiceCall: action.voiceCall,
      };
    case reducerCases.SET_ID_CALL:
      return {
        ...state,
        idCall: action.idCall,
      };
    case reducerCases.SET_HISTORY_CALLS:
      return {
        ...state,
        historyCalls: action.historyCalls,
      };
    case reducerCases.ADD_HISTORY_CALL:
      return {
        ...state,
        historyCalls: [...state.historyCalls, action.newHistoryCall],
      };
    case reducerCases.SET_ALL_HISTORY_CALLS:
      return {
        ...state,
        historyCallsPage: !state.historyCallsPage,
      };
    case reducerCases.END_CALL:
      return {
        ...state,
        voiceCall: undefined,
        videoCall: undefined,
        incomingVideoCall: undefined,
        incomingVoiceCall: undefined,
        ringingCall: undefined,
      };
    case reducerCases.SET_EXIT_CHAT:
      return {
        ...state,
        currentChatUser: undefined,
      };
    default:
      return state;
  }
};

export default reducer;
