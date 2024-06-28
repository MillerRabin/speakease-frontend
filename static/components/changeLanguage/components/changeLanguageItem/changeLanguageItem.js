const template = `    
  <div class="wrapper">
    <button class="btn"></button>
  </div>
`;

class ChangeLanguageItem extends HTMLElement {
  #btnName = null;
  #activeBtn = null;
  #template = null;

  #setBtnName() {
    if (this.components == null) return;
    this.components.btn.innerHTML = this.#btnName;
  }

  #setActiveBtn() {
    if (this.components == null) return;
    this.components.btn.classList.add('active');
  }

  #updateBtnName() {
    if (this.components == null) return;
    this.components.btn.innerHTML = this.#btnName;

  }

  #updateActiveBtn() {
    if (this.components == null) return;
    this.#activeBtn ? this.components.btn.classList.add('active') : this.components.btn.classList.remove('active')

  }


  constructor() {
    super();
    const render = async (form) => {
      form.#template = template
    };
    this.ready = render(this);
  }

  set btnName(value) {
    this.#btnName = value;
    this.#updateBtnName();
  }

  get btnName() {
    return this.#btnName;
  }

  set activeBtn(value) {
    this.#activeBtn = value;
    this.#updateActiveBtn();
  }

  get activeBtn() {
    return this.#activeBtn;
  }


  async connectedCallback() {
    await this.ready;
    this.innerHTML = this.#template;
    this.components = {
      btn: this.querySelector('.btn'),
    }
    this.#setBtnName();
    this.#updateActiveBtn();
  }
}

customElements.define("speakease-changelanguageitem", ChangeLanguageItem);
