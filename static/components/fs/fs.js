export function save(key, data) {  
  if ((window.speakease != null) && (window.speakease.setValue != null)) {    
    return window.speakease.setValue(key, data);
  }
  localStorage.setItem(key, data);
  return true;
}

export function load(key) {  
  if ((window.speakease != null) && (window.speakease.getValue)) {    
    const data = window.speakease.getValue(key);    
    return data;
  }
  return localStorage.getItem(key);
}

export function remove(key) {
  if ((window.speakease != null) && (window.speakease.removeValue)) {
    return window.speakease.removeValue(key);
  }
  localStorage.removeItem(key);
  return true;
}

export default {
  save,
  load,
  remove
}