export const HOST = "http://localhost:3010";

const CHECK_CONNECT_ROUTE = `${HOST}/api/check`;

const CHECK_USER_ROUTE = `${HOST}/api/checkuser`;

const AUTH_USER_ROUTE = `${HOST}/api/auth`;

const USER_ROUTE = `${HOST}/api/user`;

const MESSAGES_ROUTE = `${HOST}/api/messages`;

const CALLS_ROUTE = `${HOST}/api/calls`;

export const CHECK_SYSTEM_CONNECT_ROUTE = `${CHECK_CONNECT_ROUTE}/check-connect`;

export const CHECK_USER_EXISTS_ROUTE = `${CHECK_USER_ROUTE}/check-user-exists`;

export const SIGNUP_USER_LOCAL_ROUTE = `${AUTH_USER_ROUTE}/signup-local`;

export const LOGIN_USER_LOCAL_ROUTE = `${AUTH_USER_ROUTE}/login-local`;

export const CHECK_USER_LOGIN_ROUTE = `${AUTH_USER_ROUTE}/check-user`;

export const UPLOAD_PROFILE_IMAGE_ROUTE = `${AUTH_USER_ROUTE}/add-profile-image`;

export const DELETE_PROFILE_IMAGE_ROUTE = `${AUTH_USER_ROUTE}/delete-profile-image`;

export const ONBOARD_USER_LOCAL_ROUTE = `${AUTH_USER_ROUTE}/onboard-user-local`;

export const ONBOARD_USER_FIREBASE_ROUTE = `${AUTH_USER_ROUTE}/onboard-user-firebase`;

export const UPDATE_ONLINE_USER = `${AUTH_USER_ROUTE}/update-user-online`;

export const GET_ALL_CONTACTS_ROUTE = `${USER_ROUTE}/user-contacts`;

export const GET_INITIAL_CONTACTS_ROUTE = `${MESSAGES_ROUTE}/get-initial-contacts`;

export const GET_TOTAL_UNREADMESSAGE_ROUTE = `${MESSAGES_ROUTE}/get-unread-message`;

export const GET_ALL_MESSAGES_ROUTE = `${MESSAGES_ROUTE}/get-messages`;

export const ADD_TEXT_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-text-message`;

export const ADD_RECORDING_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-recording-message`;

export const ADD_AUDIO_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-audio-message`;

export const ADD_VIDEO_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-video-message`;

export const ADD_DOCUMENT_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-document-message`;

export const ADD_IMAGE_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-image-message`;

export const ADD_OTHER_FILE_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-file-any-message`;

export const SAVE_CALLS_ROUTE = `${CALLS_ROUTE}/save-call`;

export const UPDATE_FINISHING_CALLS = `${CALLS_ROUTE}/update-finish-call`;

export const GET_ALL_CALLS = `${CALLS_ROUTE}/get-all-calls`;
