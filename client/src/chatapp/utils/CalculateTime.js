import { dayOfWeekInYourLangage } from "./Days.js";

/**
 * Returns Time Local in the personnal format
 *
 * @param inputDateStr  Parameter required : It's returning default time by JS engine stocked in database. C'est la date retournée par défaut par Javascript et stockée dans la base de données
 * @param localesTime   Parameter facultatif: It's format time code of Locale Time of client device. C'est le code du format du temps local de l'appareil du client. By default, it's equal to "en-US". Par défaut, sa valeur est "en-US"
 * @param localesDate   Parameter facultatif: It's format date code of Locale Time of client device. C'est le code du format de la date local de l'appareil du client. By default, it's equal to "en-GB". Par défaut, sa valeur est "en-GB"
 * @param yesterdayInYourLangage Parameter facultatif: It's a string including the name of day going before today. C'est la chaine de caractère qui contient le nom du jour qui vient avant aujourd'hui. By default, it's equal to "Yesterday". Par defaut sa valeur est "Yesterday"
 * @param dayOfWeek Parameter facultatif: It's an array including the names of day of week, each name of day of week is including in the string. C'est le tableau qui contient les noms des jours de semaines, chaque nom d'un jour d'une semaine est contenue dans une chaine de caractères. By default, it's equal to ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]. Par defaut sa valeur est ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 * @returns
 */

export const calculateTime = (
  inputDateStr,
  localesTime = "en-US",
  localesDate = "en-GB",
  yesterdayInYourLangage = "Yesterday",
  dayOfWeek = dayOfWeekInYourLangage.english
) => {
  // Assuming the input date string is in UTC format
  const inputDate = new Date(inputDateStr);

  // Get current date
  const currentDate = new Date();

  // Set up date formats
  const timeFormat = { hour: "numeric", minute: "numeric" };
  const dateFormat = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  // Check if it's today, tomorrow, or more than one day ago
  if (
    inputDate.getUTCDate() === currentDate.getUTCDate() &&
    inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
    inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
  ) {
    // Today: Convert to AM/PM format
    const ampmTime = inputDate.toLocaleTimeString(localesTime, timeFormat);
    return ampmTime;
  } else if (
    inputDate.getUTCDate() === currentDate.getUTCDate() - 1 &&
    inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
    inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
  ) {
    // Tomorrow: Show "Yesterday"

    return yesterdayInYourLangage;
  } else if (
    Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24)) > 1 &&
    Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24)) <= 7
  ) {
    const timeDifference = Math.floor(
      (currentDate - inputDate) / (1000 * 60 * 60 * 24)
    );

    const targetDate = new Date();
    targetDate.setDate(currentDate.getDate() - timeDifference);

    const daysOfWeekInner = dayOfWeek;
    const targetDay = daysOfWeekInner[targetDate.getDay()];

    return targetDay;
  } else {
    // More than 7 days ago: Show date in DD/MM/YYYY format
    const formattedDate = inputDate.toLocaleDateString(localesDate, dateFormat);
    return formattedDate;
  }
};
