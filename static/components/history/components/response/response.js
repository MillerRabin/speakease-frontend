import local from '/components/local/local.js';

class Response extends HTMLElement {
  #data = null;
  #refresh() {
    const text = local.getText(this.#data);
    const customDom = this.#data.text.customDom;
    this.innerHTML = `
       <div class="text"></div>
       <div class="corner"></div>
       <div class="end-icon">
        <img src="/components/history/components/images/hat_icon.png">
       </div>
       
     `;
    this.querySelector(".text").innerHTML = text;
    if(customDom != null) {
      this.querySelector(".text").appendChild(customDom);
    }
  }

  set data(value) {
    this.#data = value;
    this.#refresh();
  }

  get data() { return this.#data; }

  async connectedCallback() {
    this.#refresh();
  }
}

customElements.define("speakease-response", Response);
