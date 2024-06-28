import loader from '/components/loader/loader.js';
import users from "/components/users/users.js";
import speechR from '/intentions/intention-can-interact-with-user/main.js';
import '/components/soundVisualizator/soundVisualizator.js';
import voiceRecorder from '/components/voiceRecorder/voiceRecorder.js';

function setAuth(user) {
  try {
    const auth = !!user;
    const header = window.document.querySelector('speakease-header');
    auth ? header.classList.add('authorized') : header.classList.remove('authorized');
    if (user == null) return;
    const ud = header.querySelector('.user-name');
    if (ud != null)
      ud.innerHTML = user.wallet?.name ?? user.userName;
  } catch (e) {
    console.error(e);
  }  
}

class Header extends HTMLElement {
  #template;
  #recorder = voiceRecorder.get();

  #render  = async () => {
    this.#template = await loader.loadHTML('/components/header/header.html');
  }

  #updateMicStatusHandler = (event) => {
    switch (event.type) {
      case 'recognition.status':
        event.data.enabled || this.#recorder.isRecording
          ? this.components.micSwitcher.classList.remove('switch-off')
          : this.components.micSwitcher.classList.add('switch-off');
        break;
      case 'recorder.status':
        event.data.recording || speechR.recognition.enabled
          ? this.components.micSwitcher.classList.remove('switch-off')
          : this.components.micSwitcher.classList.add('switch-off');
        break;
    }
  }

  constructor() {
    super();
    this.ready = this.#render();
  }

  async connectedCallback() {
    await this.ready;
    this.innerHTML = this.#template;
    this.components = {
      userName: this.querySelector('.user-name'),
      avatar: this.querySelector('.user-avatar'),
      micSwitcher: this.querySelector('.mic-switcher'),
      
    };
    const user = users.getUser();
    setAuth(user);
    this.components.micSwitcher.onclick = () => {
      const flag = speechR.recognition.enabled;
      speechR.recognition.enabled = !flag;
    }
    speechR.recognition.on.updateStatus(this.#updateMicStatusHandler);
    this.#recorder.on.updateStatus(this.#updateMicStatusHandler);
  }

  async disconnectedCallback() {
    speechR.recognition.off.updateStatus(this.#updateMicStatusHandler);
    this.#recorder.off.updateStatus(this.#updateMicStatusHandler);
  }
}


customElements.define("speakease-header", Header);

export default {
  setAuth,
}
