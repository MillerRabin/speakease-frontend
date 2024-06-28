const template = `    
       <div class="text"></div>
       <div class="corner"></div>
       <div class="end-icon">
        <img src="/components/clueMessage/images/hat_icon.png">
       </div>
`;

class ClueMessage extends HTMLElement {
  #message;

  #updateMessage() {
    if (this.components == null) return;
    this.components.message.innerHTML = this.#message;
  }

  constructor() {
    super();
    const render = async (form) => {
      form._template = template
    };
    this.ready = render(this);
  }

  set message(value) {
    this.#message = value;
    this.#updateMessage();
  }

  get message() {
    return this.#message;
  }


  async connectedCallback() {
    await this.ready;
    this.innerHTML = this._template;
    this.components = {
      message: this.querySelector('.text'),
    }
    this.#updateMessage();
  }
}

customElements.define("speakease-cluemessage", ClueMessage);
