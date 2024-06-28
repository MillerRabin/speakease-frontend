import history from "/components/history/history.js";
import { createState } from "/intentions/main.js";
import { LocalString } from "/components/local/local.js";

const { ready, setReady } = createState({ message: 'Breadcrumbs loading time is out'});

async function setTitle(text) {
  await ready;
  const bds = window.document.querySelectorAll('speakease-breadcrumbs');
  for (const bd of bds)
    bd.title = text;
}
class Breadcrumbs extends HTMLElement {
  set title(value) {
    if (value instanceof LocalString) {
      this.components.naviPoint.innerHTML = value.getText();
      return;
    }
    this.components.naviPoint.innerHTML = value;    
  }
  get title() {
    return this.components.naviPoint?.innerHTML ?? ''
  };

  constructor() {
    super();
    this.innerHTML = `
      <img class="history-img" src="/components/breadcrumbs/images/clock.png"/>
      <span>&gt;</span>
      <span class="navi-point">Main</span>
    `;
  }

  async connectedCallback() {
    setReady();
    this.components = {
      naviPoint:  this.querySelector(".navi-point"),
      historyImg: this.querySelector(".history-img"),
    }
    this.components.historyImg.onclick = () => {      
      history.toggle();
    }
  }
}

customElements.define("speakease-breadcrumbs", Breadcrumbs);

export default {
  setTitle
}
