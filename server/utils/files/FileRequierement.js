import path from "path-browserify";

const ImageExtName = [
  ".jpeg",
  ".bmp",
  ".png",
  ".gif",
  ".jpg",
  ".ico",
  ".tif",
  ".JPEG",
  ".BMP",
  ".PNG",
  ".GIF",
  ".JPG",
  ".ICO",
  ".TIF",
];

const DocumentExtName = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".pps",
  ".ppsx",
  ".txt",
  ".json",
  ".otp",
  ".csv",
  ".odg",
  ".odp",
  ".ods",
  ".odt",
  ".rtf",
  ".PDF",
  ".DOC",
  ".DOCX",
  ".XLS",
  ".XLSX",
  ".PPT",
  ".PPTX",
  ".PPS",
  ".PPSX",
  ".TXT",
  ".JSON",
  ".CSV",
  ".ODG",
  ".ODP",
  ".ODS",
  ".ODT",
  ".RTF",
  ".OTP",
];

const AudioExtName = [
  ".wav",
  ".mp3",
  ".mid",
  ".ogg",
  ".WAV",
  ".MP3",
  ".OGG",
  ".MID",
];

const VideoExtName = [
  ".mkv",
  ".mp4",
  ".avi",
  ".mpg",
  ".mpeg",
  ".flv",
  ".mov",
  ".wma",
  ".webm",
  ".ogg",
  ".ogv",
  ".ogm",
  ".MKV",
  ".MP4",
  ".AVI",
  ".MPEG",
  ".MPG",
  ".FLV",
  ".MOV",
  ".WMA",
  ".WEBM",
  ".OGG",
  ".OGV",
  ".OGM",
];

/**
 *  Determinned if the file is validated according to it's type and size
 *
 * Determine si le fichier est valide en fonction de son type et sa taille
 *
 * @param {any} file Parameter required, The object array contains the proprieties of file (name, size, etc....). L'objet tableau qui contient les propriétés du fichier (nom d'origine, taille, etc...)
 * @param {number} maxLength Parameter required, The accepted maximum length of file (or size of file). La taille maximum du fichier
 * @param {string} type Parameter facultatif, The type of file. Le type du fichier
 * @returns
 */

export const maximumLengthFile = (file, maxLength, type = "image") => {
  let extensionsArray;

  let extensionFile = path.extname(file.originalname);

  switch (type) {
    case "image":
      extensionsArray = ImageExtName;
      if (extensionsArray.includes(extensionFile)) {
        if (file.size <= maxLength) {
          return {
            correctLength: true,
            correctType: true,
          };
        } else {
          return {
            correctLength: false,
            correctType: true,
          };
        }
      } else {
        return {
          correctLength: false,
          correctType: false,
        };
      }
    case "sound":
      extensionsArray = AudioExtName;
      if (extensionsArray.includes(extensionFile)) {
        if (file.size <= maxLength) {
          return {
            correctLength: true,
            correctType: true,
          };
        } else {
          return {
            correctLength: false,
            correctType: true,
          };
        }
      } else {
        return {
          correctLength: false,
          correctType: false,
        };
      }
    case "video":
      extensionsArray = VideoExtName;
      if (extensionsArray.includes(extensionFile)) {
        if (file.size <= maxLength) {
          return {
            correctLength: true,
            correctType: true,
          };
        } else {
          return {
            correctLength: false,
            correctType: true,
          };
        }
      } else {
        return {
          correctLength: false,
          correctType: false,
        };
      }
    case "document":
      extensionsArray = DocumentExtName;
      if (extensionsArray.includes(extensionFile)) {
        if (file.size <= maxLength) {
          return {
            correctLength: true,
            correctType: true,
          };
        } else {
          return {
            correctLength: false,
            correctType: true,
          };
        }
      } else {
        return {
          correctLength: false,
          correctType: false,
        };
      }
    default:
      if (file.size <= maxLength) {
        return {
          correctLength: true,
          correctType: undefined,
        };
      } else {
        return {
          correctLength: false,
          correctType: undefined,
        };
      }
  }
};

export const checkTypeFile = (file, type = "image") => {
  let extensionsArray;

  let extensionFile = path.extname(file.originalname);

  switch (type) {
    case "image":
      extensionsArray = ImageExtName;
      if (extensionsArray.includes(extensionFile)) {
        return {
          correctType: true,
        };
      } else {
        return {
          correctType: false,
        };
      }
    case "sound":
      extensionsArray = AudioExtName;
      if (extensionsArray.includes(extensionFile)) {
        return {
          correctType: true,
        };
      } else {
        return {
          correctType: false,
        };
      }
    case "video":
      extensionsArray = VideoExtName;
      if (extensionsArray.includes(extensionFile)) {
        return {
          correctType: true,
        };
      } else {
        return {
          correctType: false,
        };
      }
    case "document":
      extensionsArray = DocumentExtName;
      if (extensionsArray.includes(extensionFile)) {
        return {
          correctType: true,
        };
      } else {
        return {
          correctType: false,
        };
      }
    default:
      return {
        correctType: undefined,
      };
  }
};
