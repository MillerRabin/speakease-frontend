import local from '/components/local/local.js';
class LanguageBtn extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `      
      <button class="btn">EN</button>
    `;
  }
  async connectedCallback() {
    this.components = {
      btnName: this.querySelector('.btn'),
    }
    const lang = local.get();
    this.components.btnName.innerHTML = lang.ui;
  }

  static get observedAttributes() {
    return ["lang"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if(name == 'lang') {
      this.components.btnName.innerHTML = newValue.toUpperCase();
    }
  }
}

customElements.define("language-btn", LanguageBtn);
