import fs from '/components/fs/fs.js';
import CacheFunction from '/components/cacheFunction/cacheFunction.js';

const fileName = 'settings';

function trySettings() {
  try {
    const rawSettings = fs.load(fileName);
    return JSON.parse(rawSettings) || {};
  } catch (e) {
    console.error(e);
    return {};
  }
}

function setDistance(value) {
  setProperty('distanceThreshold', value);
  return true;
}

function setMean(value) {
  setProperty('meanThreshold', value);
  return true;
}


window.setDistance = setDistance;
window.setMean = setMean;

export function setProperty(propName, value) {
  try {
    const settings = trySettings();
    settings[propName] = value;
    fs.save(fileName, JSON.stringify(settings));
    getSettingsCached.clear();
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }  
}

const getSettingsCached = new CacheFunction(() => {
  try {
    const rawSettings = fs.load(fileName);
    return JSON.parse(rawSettings);    
  } catch (err) {
    return {};
  }  
});

export function getProperty(propName) {
  try {
    const settings = getSettingsCached.call();
    return settings?.[propName] || null;
  } catch (err) {
    console.error(err);
  }
  return null;
}

export default {
  getProperty,
  setProperty,
  setMean,
  setDistance
}