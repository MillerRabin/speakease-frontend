import { storage } from "/intentions/main.js";
import router from "/components/router/router.js";
import local, { LocalString } from "/components/local/local.js";
import activityManager from '/intentions/activityManager/activityManager.js';
import "/components/clueMessage/clueMessage.js";
import history from "/components/history/history.js";
import system from "/components/system/system.js";
import users from "/components/users/users.js";


let currentIndex = 0;
const localData = {
  title: new LocalString({
    en: 'Speak or Click Command',
    ru: 'Скажите или Наберите команду',
    ko: '말하기 또는 커맨드 선택'
  })
}

class Activity extends HTMLElement {
  #template;
  #components = {};
  #activityInterval = 3000;
  #activities = [];  
  #refreshInterval;
  #listening = false;
  #render = async () => {
    this.#template = await local.loadHTML('/components/activity', 'activity.html');
  }

  async #sortActivities(activities) {
    if (activities == null) return [];
    const rt = (await router.current()).name;
    return activities.sort((a, b) => {
      if ((a.type == 'critical') && (b.type != 'critical')) return -1;
      if ((b.type == 'critical') && (a.type != 'critical')) return 1;
      const ac = !!a.top?.find(p => p == rt) ?? false;
      const bc = !!b.top?.find(p => p == rt) ?? false;
      if (ac && !bc) return -1;
      if (!ac && bc) return  1;
      if (a.order > b.order) return 1;
      if (a.order < b.order) return -1;
      return 0;
    });
  }

  #getClueItem() {
    const item = this.querySelector("speakease-cluemessage")
    if (item != null)
      return item;
    const cItem = window.document.createElement("speakease-cluemessage");
    this.#components.clue.appendChild(cItem);
    return cItem;
  }

  #showClue(activity) {
    if(!activity) return;
    const item = this.#getClueItem();
    item.message = local.getText(activity.description) || 'There are no clues today';
  }


  #getNode(node, i) {
    if (node != null) return node;
    const cont = window.document.createElement('div');
    cont.className = 'activity-cont';
    cont.id = i;
    const item = window.document.createElement('a');
    cont.appendChild(item);
    this.#components.list.appendChild(cont);
    return item;
  }
  
  #updateNode(node, activity, name, i) {
    if (activity == null)
      return this.#components.list.removeChild(node.parentNode);
    const item = this.#getNode(node, i);
    const clsBlink = activity.name == 'signIn' ? 'sign-in' : ''
    const cls = `${activity.type || 'general'} route ${clsBlink}`;
    item.className = cls;
    const tp = typeof activity.link;
    if (tp === 'string') {
      item.href = activity.link;
      item.onclick = () => { 
        this.close();
      }
    } else if (tp === 'function') {
      item.href = undefined;
      item.onclick = (ev) => {
        ev.preventDefault();
        this.close();
        activity.link();
      }
    } else {
      throw new Error(`${tp} is invalid link type. Must be function or string`);
    }
    const text = name == null || this.listening ? activity.text.getText() : activity.text.format(name).getText();
    item.innerHTML = text;
    item.activity = activity;
  }

  set listening(value) {
    this.#listening = value;
    this.#renderActivities();
  }

  get listening() { return this.#listening; }


  #focusHandler = (event) => {
    this.listening = event.data.listening
  };

  #renderIndicator() {
    const elements = document.querySelectorAll('.activity-cont');
    this.#components.indicator.innerHTML = '';
    for (let i = 0; i < elements.length; i++) {
      if(i % 4 == 0 || (elements.length - i) < 4 && (elements.length - i) > 2) {
        const customI = elements.length - i >= 4 ? i : elements.length-1;
        const button = document.createElement('button');
        button.setAttribute('id', `dot-${customI}`);
        customI === currentIndex ? button.classList.add('active') : button.classList.remove('active');
        (function(customI) {
          button.onclick = function() {
            elements[customI].scrollIntoView();
          }
        })(customI);
        this.#components.indicator.appendChild(button);
      }
    }
  }

  #observeScroll() {
    const observer = new IntersectionObserver((entries) => {
      const activated = entries.reduce((max, entry) => {
        return (entry.intersectionRatio > max.intersectionRatio) ? entry : max;
      });
      if (activated.intersectionRatio > 0) {
        currentIndex = elementIndices[activated.target.getAttribute("id")];
        this.#renderIndicator();
      }
    }, {
      root: this.#components.list, 
      threshold: 0.8
    });

    const elementIndices = {};
    const elements = document.querySelectorAll('.activity-cont');
    for (let i = 0; i < elements.length; i++) {
      if(i % 4 == 0 || (elements.length - i) < 4 && (elements.length - i) > 2) {
        const customI = elements.length - i >= 4 ? i : elements.length-1;
        elementIndices[elements[customI].getAttribute("id")] =  customI;
        observer.observe(elements[customI]);
      }
    }
  }

  async #renderActivities() {
    const list = this.#components.list;
    if (list == null) return;    
    const name = this.#getName();
    const current = await router.current();
    const activeActivities = this.#activities.filter(a => {
      if (a.status == 'stopped') return false;
      if (a.name == current.name) return false;      
      const fnd = a.notVisibleAt?.find(c => c == current.name) ?? null;
      if (fnd != null) return false;
      return true;
    });
    const fDescAct = activeActivities.find(a => a.description != null);
    const nodes = this.#components.list.querySelectorAll('a');
    const maxLength = nodes.length > activeActivities.length ? nodes.length : activeActivities.length;    
    for (let i = 0; i < maxLength; i++) {      
      const node = nodes[i];
      const activity = activeActivities[i];
      this.#updateNode(node, activity, name, i);
    }
    if(activeActivities.length != 0)
      this.#observeScroll();

    if (fDescAct != null)
      this.#showClue(fDescAct);
    router.updateRouteLinks();
  }

  #activityIntention = storage.createIntention({
    title: {
        en: 'Get activities',
        ru: 'Принимаю данные об активностях',
        ko: '활동 데이터 수신'
    },
    input: 'ActivityInfo',
    output: 'None',
    onData: async (status, intention, value) => {
      if (status != 'data') return;
      this.#activities = await this.#sortActivities(value);
      await this.#renderActivities();
    }
  });

  #getName() {
    try {
      return system.getName();
    } catch (e) {
      return null;
    }
  }


  constructor() {
    super();
    this.ready = this.#render();
  }

  #routerHandler = () => {
    activityManager.check();
  };
  
  #monitorActivities = async () => {
    const state = history.getState();
    if (state == 'activity') {      
      await activityManager.check();      
    }    
    this.#refreshInterval = setTimeout(this.#monitorActivities, this.#activityInterval);
  }

  async connectedCallback() {
    await this.ready;
    const user = users.getUser();
    if (user) {
      if (window.location.pathname == '/')
        router.goto("/home.html", null);
    }
    
    this.#monitorActivities();
    router.on.change(this.#routerHandler);
    this.innerHTML = this.#template;
    this.#components = {
      btnActivityAccordion: window.document.querySelector('.btn-activity-accordion'),
      list: window.document.querySelector('.list'),
      listBlock: window.document.querySelector('.list-block'),
      mainBlock: this.querySelector('.main-block'),
      clue: this.querySelector('.clue'),
      title: window.document.querySelector('.speakease-list .btn-activity-accordion'),
      indicator:  window.document.querySelector('.speakease-list #indicator'),
      elements: this.querySelectorAll('.activity-cont')
    };

    this.#components.title.innerHTML = localData.title.getText();

    this.#renderActivities();
    this.#components.btnActivityAccordion.onclick  = () => {
      if (this.isOpened())
        this.close();
      else
        this.open();
    }
    system.on.focused(this.#focusHandler);

  }
  async open() {
    activityManager.check();
    window.document.body.classList.add("activity-open");
  }

  close() {
    window.document.body.classList.remove("activity-open");
  }

  isOpened() {
    return window.document.body.classList.contains("activity-open");
  }

  disconnectedCallback() {
    clearInterval(this.#refreshInterval);
    system.off.focused(this.#focusHandler);
  }
}

customElements.define("speakease-activity", Activity);

export function get () {
  return window.document.querySelector('speakease-activity'); 
}

export default {
  get
}