class AudioPlayer extends HTMLElement {
  #audio;
  #data;
  playing = false;
  volume = 0.4;
  prevVolume = 0.4;
  initialized = false;
  barWidth = 3;
  barGap = 1;
  bufferPercentage = 75;
  nonAudioAttributes = new Set(['title', 'bar-width', 'bar-gap', 'buffer-percentage']);

  constructor() {
    super();
  }

  initializeAudio() {
    if (this.initialized) return;
    this.initialized = true;
    this.audioCtx = new AudioContext();
    this.track = this.audioCtx.createMediaElementSource(this.audio);
    this.track
      .connect(this.audioCtx.destination);
  }

  attachEvents() {
    this.playPauseBtn.onclick = this.togglePlay.bind(this);    
    this.progressBar.oninput = () => { this.seekTo(this.progressBar.value); }

    this.audio.onloadedmetadata = () => {
      this.progressBar.max = this.audio.duration;
      this.durationEl.textContent = this.getTimeString(this.audio.duration);
      this.updateAudioTime();
    };

    this.audio.onerror = () => {
      this.playPauseBtn.disabled = true;
    };

    this.audio.ontimeupdate = () => {
      this.updateAudioTime(this.audio.currentTime);
    };

    this.audio.onended = () => {
      this.playing = false;      
      this.playPauseBtn.classList.remove('playing');
    };

    this.audio.onpause = () => {
      this.playing = false;      
      this.playPauseBtn.classList.remove('playing');
    };

    this.audio.onplay = () => {
      this.playing = true;      
      this.playPauseBtn.classList.add('playing');
    };
  }

  async togglePlay() {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (this.playing) {
      return this.audio.pause();
    }

    return this.audio.play();
  }

  getTimeString(time) {
    const secs = `${parseInt(`${time % 60}`, 10)}`.padStart(2, '0');
    const min = parseInt(`${(time / 60) % 60}`, 10);

    return `${min}:${secs}`;
  }

  seekTo(value) {
    this.audio.currentTime = value;
  }

  updateAudioTime() {
    this.progressBar.value = this.audio.currentTime;
    this.currentTimeEl.textContent = this.getTimeString(this.audio.currentTime);
  }


  set data(value) {
    this.#data = value;
    this.#audio = window.URL.createObjectURL(value.text.data);
  }

  get data() { return this.#data; }

  async connectedCallback() {
    this.initialized = false;
    this.render();
    this.initializeAudio();
  }

  render() {
    this.innerHTML = `
        <figure class="audio-player">
          <audio style="display: none" src="${this.#audio}"></audio>
          <button class="play-btn" type="button"></button>
          <div class="progress-indicator">
              <input type="range" max="100" value="0" class="progress-bar">
              <span class="current-time">0:0</span>
              <span class="duration">0:00</span>
          </div>
        </figure>
      `;

    this.audio = this.querySelector('audio');
    this.playPauseBtn = this.querySelector('.play-btn');
    this.volumeBar = this.querySelector('.volume-field');
    this.progressIndicator = this.querySelector('.progress-indicator');
    this.progressBar = this.progressIndicator.children[0];
    this.currentTimeEl = this.progressIndicator.children[1];
    this.durationEl = this.progressIndicator.children[2];
    
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes[i];
      this.updateAudioAttributes(attr.name, attr.value);
    }

    this.attachEvents();
  }
}

customElements.define('speakease-audioplayer', AudioPlayer);

