import { getDeviceId } from "/components/system/system.js";

const getSystemInfo = () => {
  let androidSystemInfo = window.speakease?.getVersion?.() ?? null;
  const { userAgent } = navigator;
  const { origin } = location;
  const re = /Chrome\/(?<version>\S+)/;
  const match = userAgent.match(re);
  const chromeVersion = match ? match.groups?.version : null;
  const screen = {
    width: window.outerWidth,
    height: window.outerHeight,
    pixelRatio: window.devicePixelRatio,
  }
  const deviceId = getDeviceId();
  return {
    androidSystemInfo,
    userAgent,
    screen,
    chromeVersion,
    deviceId,
    origin,
  };
}

export default {
    getSystemInfo
}
