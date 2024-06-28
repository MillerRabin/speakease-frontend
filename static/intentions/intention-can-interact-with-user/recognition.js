import voiceRecorder from "/components/voiceRecorder/voiceRecorder.js";
import config from '/config.js';

function tryJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      error: {
        message: text
      }
    }
  }
}

async function getJson(res) {
  const text = await res.text();
  const data = tryJson(text);
  if (res.ok)
    return data;
  else
    throw {
      error: data
    }
}


class Recognition extends EventTarget{
  #language = 'en-US';
  #recorder = voiceRecorder.get();
  #enabled = false;
  #speechInterval = 100;
  
  #throwError(data) {
    if (data.error != null) {
      const event = new ErrorEvent('error', {
        error: data.error
      })
      this.dispatchEvent(event);
      this.#speechInterval = 1000;
      return true;
    }
    this.#speechInterval = 100;
    return false;
  }

  #sendData(data) {
    const event = new CustomEvent('result', { detail: data });
    this.dispatchEvent(event);
  }
  
  #speakHandler = async (event) => {
    const res = await fetch(`${config.recognitionBackend}/recognize/${this.language}`, {
      method: 'POST',
      body: event.detail
    });
    const data = await getJson(res);
    if (!this.#throwError(data))
      this.#sendData(data); 
    setTimeout(() => {
      this.start();
    }, this.#speechInterval);
  };
  
  constructor(language) {
    super();
    this.language = language;
    this.#recorder.addEventListener('speakend', this.#speakHandler);
  }

  set language(value) {
    this.#language = value;
  }

  get language() { return this.#language };

  start() {    
    if (!this.#enabled) return;
    this.#recorder.start();
  }

  async stop() {
    this.#enabled = false;
    this.#recorder.stop();
  }

  set enabled(value) {
    if (this.#enabled && value) return;    
    this.#enabled = value;    
    if (value)
      this.start();
    else
      this.stop();
  }

  get enabled() {
    return this.#enabled;
  }
}

let recognition = null;
function get(lang) {
  if (recognition != null) {
    recognition.language = lang
    return recognition;
  }
  return new Recognition(lang);
}


export default {
  get
}
