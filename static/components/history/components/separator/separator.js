import local from '/components/local/local.js';

function ErrorInvalidPeriod(period) {
  throw new Error(`Invalid period ${period}`);
}

function getStage(period) {
  return (period == 'start') ? 'START' :
         (period == 'end') ? 'COMPLETED' :
         (period == 'cancel') ? 'CANCELLED' :
         ErrorInvalidPeriod(period)
}

class Separator extends HTMLElement {
  #stage;
  #text;
  #data;

  #render = async () => {
    this.innerHTML = `
      <div class="separator"></div>
      <div class="title">
        <span class="upper-span">${this.#text}</span>
        <span class="bottom-span">${this.#stage}</span>
      </div>
      <div class="separator"></div>
    `;
  }

  set data(value) {
    this.#data = value;
    this.#stage = getStage(value.period);
    this.#text = local.getText(value.text);
  }

  get data() { return this.#data; }

  async connectedCallback() {
    this.#render();
  }
}

customElements.define("speakease-separator", Separator);


