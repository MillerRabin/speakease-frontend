
function muteSound(value) {
  if (window.speakease == null) return;
  try {
    if (value)
      window.speakease.mute();
    else
      window.speakease.unmute();
  } catch (e) {
    console.log(e);
  }
}

/*function flat(results) {
  const values = Object.values(results);
  const res = [];
  for (const val of values)
    res.push(...val);
  return res.sort((a, b)=> {
    if (a.confidence > b.confidence) return -1;
    if (a.confidence < b.confidence) return 1;
    return 0;
  });
}*/


class Recogniser extends EventTarget {
  #lang = 'en-US';
  #recognition;
  #speechTimeout;
  #enabled;  
  #restartInterval = 100;
  #micStatusEvent = 'recognition.status';
  
  #dispatchSpeechResult = ((event) => {
    try {
      const fr = event.results[event.results.length - 1];
      const dataEvent = new Event('data');
      dataEvent.results = fr;
      this.dispatchEvent(dataEvent);
    } catch (e) {
        console.error(e);
    }  
  }).bind(this);

  #createRecognition(lang) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition == null) throw new Error('Speech recognition is not supported');
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.continuous = true;
    recognition.onresult = this.#dispatchSpeechResult;
    
    recognition.onstart = () => {
      muteSound(true);
    };
  
    
    recognition.onerror = (event) => {
      muteSound(false);
      console.error('Error occurred in recognition: ' + event.error);
      this.#restartError(event.error);
    };
  
    recognition.onend = () => {      
      muteSound(false);
      this.#recognition = null;
      this.#restart();
    };
  
    return recognition;
  }

  #get() {  
    if (this.#recognition == null)
      this.#recognition = this.#createRecognition(this.#lang);    
    return this.#recognition;
  }

  #updateSpeechStatus () {
    const event = new Event(this.#micStatusEvent)
    event.data = { enabled: this.enabled };
    this.dispatchEvent(event);
  }

  #enable() {
    if (recognition == null) return;
    this.#enabled = true;
    this.start();
    this.#updateSpeechStatus();
  }
  
  #disable() {
    this.#enabled = false;
    if (this.#recognition == null) return;
    this.#stop();
    this.#updateSpeechStatus();
  }

  on = {
    updateStatus: this.#onUpdateStatus.bind(this)
  }

  off = {
    updateStatus: this.#offUpdateStatus.bind(this)
  }

  #onUpdateStatus (callback) {
    this.addEventListener(this.#micStatusEvent, callback);
  }

  #offUpdateStatus (callback) {
    this.removeEventListener(this.#micStatusEvent, callback);
  }

  #stop() {
    if (this.#recognition == null) return;
    this.#recognition.abort();
  }

  #restart() {
    if (!this.#enabled) return;
    if (this.#speechTimeout == null)
      this.#speechTimeout = setTimeout(() => {
        this.start();
        this.#speechTimeout = null;
      }, this.#restartInterval);
  }
  
  #restartError(code) {
    this.#restartInterval = 1000;
    if (code == 'not-allowed') this.#restartInterval = 10000;     
    this.#restart();
    this.#restartInterval = 100;
  }

  set enabled(value) {
    if (value)
      return this.#enable();
    return this.#disable();
  }

  set language(value) {
    this.#stop();
    this.#lang = value;
  }

  get language() { return this.#lang };

  get enabled() { return this.#enabled };

  stop() {
    this.enabled = false;
  }
  
  start() {
    this.#get();
    if (!this.#enabled) {
      this.stop();
      return;
    }
    try {
      this.#recognition.start();
    } catch (e) {
      console.error(e.message);
    } finally {
      this.#restart();
    } 
  }
}

const recognition = new Recogniser();

export default recognition;