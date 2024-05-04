import CryptoJS from "crypto-js";

export const KEY_SECRET_CRYPTO = "emailToken458971dev";

class MyCryptoJS {
  constructor(keySecret) {
    this.encrypt = function (data) {
      const bufferCrypt = CryptoJS.AES.encrypt(data, keySecret);
      return bufferCrypt.toString();
    };

    this.decrypt = function (encryptData) {
      if (typeof encryptData !== "string") {
        const encryptString = encryptData.toString();
        let bytesDecrypt = CryptoJS.AES.decrypt(encryptString, keySecret);
        return bytesDecrypt.toString(CryptoJS.enc.Utf8);
      } else if (typeof encryptData === "string") {
        let bytesDecrypt = CryptoJS.AES.decrypt(encryptData, keySecret);
        return bytesDecrypt.toString(CryptoJS.enc.Utf8);
      }
    };
  }
}

export default MyCryptoJS;
