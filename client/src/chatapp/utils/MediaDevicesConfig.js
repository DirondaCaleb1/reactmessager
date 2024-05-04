export const getDevicesSupported = async () => {
  let deviceKinds = [];
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("Pas de fonction");
    return deviceKinds;
  } else {
    try {
      const enumerations = await navigator.mediaDevices.enumerateDevices();

      enumerations.forEach((enumeration) => {
        deviceKinds.push(enumeration.kind);
      });

      //"videoinput"
      return deviceKinds;
    } catch (err) {
      console.error(err);
    }
  }
};

export const setAudioObject = (urlAudio) => {
  const audioObject = new Audio(urlAudio);

  return audioObject;
};
