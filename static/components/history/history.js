import './components/request/request.js';
import './components/response/response.js';
import './components/separator/separator.js';
import './components/audioPlayer/audioPlayer.js';
import { storage } from "/intentions/main.js";

let UIEnabled = true;

const history = [];

let blockMessages = false;

function appendMessage(value) {
  if (blockMessages) return;
  const history = window.document.querySelectorAll('speakease-history');
  for (const item of history)
    item.append(value);
}

function init(storage) {
  storage.createIntention({
    title: {
        en: 'Get recognition results',
        ru: 'Принимаю результаты распознавания',
        ko: '인식 결과 수신'
    },
    input: 'Recognition',
    output: 'HTMLTextAreaElement',
    onData: async (status, intention, value) => {
      if (status != 'data') return;
      const text = value?.text ?? '';
      if (text == '') return;
      appendMessage({...value, type: 'request'});
    }
  });

  storage.createIntention({
    title: {
        en: 'Get task statuses',
        ru: 'Принимаю статусы по задачам',
        ko: '작업 상태 조회'
    },
    input: 'ContextText',
    output: 'None',
    onData: async (status, intention, value) => {
      if (status != 'data') return;
      console.log(value);
      appendMessage(value);
    }
  });

  storage.createIntention({
    title: {
        en: 'Get task info',
        ru: 'Принимаю статусы по задачам',
        ko: '작업 정보 조회'
    },
    input: 'TaskInfo',
    output: 'None',
    onData: async (status, intention, value) => {
      if (status != 'data') return;
      if (value == null) return;
      console.log(value);
      /*this.components.taskHeader.innerHTML = 'Active tasks';
      const { updatedTasks } = value;
      if (updatedTasks && updatedTasks.length) {
        showTasks(this, updatedTasks);
      }*/
    }
  });

  storage.createIntention({
    title: {
        en: 'Can put data in console',
        ru: 'Отправляю данные в консоль',
        ko: '데이터를 콘솔에 전송'
    },
    input: 'Console',
    output: 'None',
    onData: async (status, intention, value) => {
      if (status != 'data') return;
      if (value == null) return;
      const type = value.type || 'response';
      appendMessage({ type, text: value });
    }
  });
}

init(storage);

class History extends HTMLElement {
  #createHistoryItem(data) {
    const target = data.type == 'request' ? ('speakease-request') :
                   data.type == 'response' ? ('speakease-response') :
                   data.type == 'separator' ? ('speakease-separator') :
                   data.type == 'audio' ? ('speakease-audioplayer') :
                   (function(){throw new Error('Unsupported type')}());

    const node = window.document.createElement(target);
    node.data = data;
    if(data.type == 'response' && data.text.status == 'important')
      node.classList.add('important')

    if (data.text.sensitive) {
      setTimeout(() => {
        node.remove();
      }, 60000);
    }

    this.insertBefore(node, this.firstChild);

    const offset = this.scrollTop + this.clientHeight;
    const sh = this.scrollHeight;
    const threshold = 10;
    if (data.text.forceScroll || (sh >= offset - threshold) && (sh <= offset + threshold))
      setTimeout(() => {
        this.scrollTop = this.scrollHeight - this.clientHeight;
      }, 0);
  }

  async #fillHistory() {
    this.innerHTML = '';
    for (const item of history)
      this.#createHistoryItem(item);
  }

  async connectedCallback() {
    await this.#fillHistory();
  }

  append(value) {
    this.#createHistoryItem(value);
  }
}

customElements.define("speakease-history", History);

function setState(state, force = true) {
  switch(state) {
    case 'ui': {
      if (!force && !UIEnabled)
        return setState('history');        
      UIEnabled = true;        
      window.document.body.classList.add('ui');
      window.document.body.classList.remove('history');
      window.document.body.classList.remove('activity');      
      return 'ui';
    } case 'history': {
      window.document.body.classList.add('history');
      window.document.body.classList.remove('ui');
      window.document.body.classList.remove('activity');
      return 'history';
    } case 'activity': {
      window.document.body.classList.add('activity');
      window.document.body.classList.remove('history');
      window.document.body.classList.remove('ui');
      return 'activity';
    } default: {
      throw new Error(`Invalid state: ${state}`);
    }
  }    
}

function getState() {
  if (window.document.body.classList.contains('history')) return 'history';
  if (window.document.body.classList.contains('ui')) return 'ui';
  if (window.document.body.classList.contains('activity')) return 'activity';
  return setState('ui', false);
}

function setUIEnabled(value, targetActivity) {
  UIEnabled = value;
  const state = getState();
  if (!value) setState(targetActivity, false);
  return state;
}

function getUIEnabled() {
  return UIEnabled;
}

function toggle() {
  const sequence = {
    'ui': 'history',
    'history': 'activity',
    'activity': 'ui'
  }
  const state = getState();
  const next = sequence[state];
  if (next == null) throw new Error(`invalid next for sequence ${state}`);
  return setState(next, false);
}

function disableHistory() {
  blockMessages = true;
}

function enableHistory() {
  blockMessages = false;
}

export default {
  appendMessage,
  setState,
  getState,
  setUIEnabled,
  getUIEnabled,
  toggle,
  disableHistory,
  enableHistory,
}
