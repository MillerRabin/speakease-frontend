import loader from '/components/loader/loader.js';
import sRecorder from '/components/speakeaseRecorder/speakeaseRecorder.js';
const noiseThreshold = 129;
const levelTimeout = 200;
const quietWaitTimeout = 1000;
const sampleRate = 16000;
const ENOUGH_LEVELS = 5;

const quietThreshold = Math.ceil(quietWaitTimeout / levelTimeout);
const loudThreshold = 1;


class Recognition extends EventTarget{  
  #recorder = null;
  #stream = null;
  #qCount = 0;
  #lCount = 0;
  #levels = 0;
  #enabled = false;  
  #context = null;  
  #recording = false;
  #statusEvent = 'recorder.status';
  
  #checkQuiet() {
    return (this.#qCount >= quietThreshold);
  }

  #checkLoud() {
    return (this.#lCount >= loudThreshold);
  }

  #sendData(data) {
    const event = new CustomEvent('speakend', { detail: data });
    this.dispatchEvent(event);
  }

  #updateRecorderStatus() {
    const event = new Event(this.#statusEvent)
    event.data = { recording: this.#recording };
    this.dispatchEvent(event);
  }

  #resetSoundCounter() {
    this.#qCount = 0;
    this.#lCount = 0;
    this.#levels = 0;
  }

  #soundIterate(level) {
    if (level > noiseThreshold) {
      this.#qCount = 0;
      this.#lCount++;
      this.#levels++;
      return;
    }
    this.#lCount = 0;
    this.#qCount++;
  }

  async #recognizeRecord() {
    if (!this.#enabled) return;
    this.#recorder.exportWAV(async (blob) => {      
      this.#sendData(blob);
      this.stop();
    });
  }

  async #monitor() {
    try {
      if (this.#enabled) return;
      this.#resetSoundCounter();
      this.#enabled = true;
      this.#recorder.clear();
      const source = this.#context.createMediaStreamSource(this.#stream);
      const analyser = this.#context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let isRecordAvailable = false;
      while (this.#enabled) {
        analyser.getByteTimeDomainData(dataArray);
        const max = Math.max.apply(null, dataArray);
        this.#soundIterate(max);
        if (!isRecordAvailable && this.#checkLoud()) {
          this.#recorder.record();
          isRecordAvailable = true;
        }

        if (this.#checkQuiet()) {
          if (isRecordAvailable) {
            if (this.#levels >= ENOUGH_LEVELS) {
              this.#resetSoundCounter();
              isRecordAvailable = false;
              this.#recognizeRecord();
            }
          } else
            this.#recorder.clear();
        }
        await loader.sleep(levelTimeout);
      }
    } catch (e) {
      this.#enabled = false;
      throw e;
    } finally {
      this.#recorder.stop();
      this.#recorder.clear();
    }
  }

  async #createRecorder() {
    let stream = null;
    do {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch(err) {
        console.error('capturing audio error', err);
        await loader.sleep(1000);
        stream = null;
      }
    } while (!stream);
    this.#context = new AudioContext({ sampleRate });
    const input = this.#context.createMediaStreamSource(stream);
    this.#recorder = new window.Recorder(input,{ numChannels: 1 });
    this.#stream = stream;
  }

  on = {
    updateStatus: this.#onUpdateStatus.bind(this)
  }

  off = {
    updateStatus: this.#offUpdateStatus.bind(this)
  }

  #onUpdateStatus (callback) {
    this.addEventListener(this.#statusEvent, callback);
  }

  #offUpdateStatus (callback) {
    this.removeEventListener(this.#statusEvent, callback);
  }

  async start() {
    if (this.#enabled) return;
    await this.#createRecorder();
    this.#monitor();
    this.#recording = true;
    this.#updateRecorderStatus();
  }

  async stop() {
    this.#enabled = false;
    this.#context?.close();
    this.#recording = false;
    this.#updateRecorderStatus();
  }

  get isRecording() {
    return this.#recording;
  }
}

let recognition = null;
function get() {
  if (sRecorder.available())
    return sRecorder;
  if (recognition != null) {    
    return recognition;
  }
  recognition = new Recognition();
  return recognition;
}

export default {
  get
}
