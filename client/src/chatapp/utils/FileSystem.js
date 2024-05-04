import JsFileDownloader from "js-file-downloader";
import {notification} from "antd";

export const DownloaderFile = async (urlFile, messageSuccess="") => {
  try {
    const downloader = new JsFileDownloader({
      url: urlFile,
      autoStart: false,
      contentTypeDetermination: "header",
      headers: [
        {
          name: "Authorization",
          value: "file",
        },
      ],
    });

    await downloader.start();

    if (messageSuccess !== "") {
      notification.success({
        message: messageSuccess,
      });
    }

      
  } catch (err) {
    console.log(err);
  }
};
