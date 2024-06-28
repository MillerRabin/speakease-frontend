class SpeakeaseRecorder extends EventTarget{
  #tryJSON(text) {
    try {
      return JSON.parse(text)
    } catch (e) {
      return {}
    }
  }
  
  #b64toBlob(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }
  
  #onData = (event) => {
    const sd = event.data;
    const obj = this.#tryJSON(sd);
    if (obj.source != 'recorder') return;
    const audioBlob = this.#b64toBlob(obj.data, 'audio/wav');
    const ce = new CustomEvent('speakend', { detail: audioBlob });
    this.dispatchEvent(ce);
  }

  available() {
    return window.speakease?.recorderStart != null
  }
  
  start() {        
    if (window.speakease?.recorderStart == null) return;    
    window.speakease.recorderStart();
    window.addEventListener('message', this.#onData);
  }

  stop() {
    if (window.speakease?.recorderStop == null) return;
    console.log('recorder stop')
    window.removeEventListener('message', this.#onData);
    window.speakease.recorderStop();    
  }

  #statusEvent = 'recorder.status';
  #onUpdateStatus = (callback) => {
    this.addEventListener(this.#statusEvent, callback);
  }

  #offUpdateStatus = (callback) => {
    this.removeEventListener(this.#statusEvent, callback);
  }

  on = {
    updateStatus: this.#onUpdateStatus
  }

  off = {
    updateStatus: this.#offUpdateStatus
  }


}

const recorder = new SpeakeaseRecorder();

export default recorder;



