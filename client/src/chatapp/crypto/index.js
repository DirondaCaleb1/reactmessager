import MyCryptoJS from "./crypto-dev.js";

export default function myCrypto(keySecret) {
  return new MyCryptoJS(keySecret);
}
