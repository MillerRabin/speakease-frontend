import loader from "/components/loader/loader.js";
import local from "/components/local/local.js";
import "/components/changeLanguage/components/changeLanguageItem/changeLanguageItem.js";

async function changeLanguage(form) {
  const btns = form.querySelectorAll('speakease-changelanguageitem');
  for (const langBtn of btns) {
    langBtn.activeBtn = false;
  }
}

function showContent(form, langList) {
  const activeBtn = local.get();
  for (const obj in langList) {
    const item = window.document.createElement("speakease-changelanguageitem");
    item.btnName = langList[obj].ui;
    if (activeBtn.ui == obj) {
      item.activeBtn = true;
    }
    item.setAttribute('data-lang', obj);
    item.onclick = async () => {
      const btn = item.getAttribute('data-lang');
      await changeLanguage(form, btn);
      item.activeBtn = true;
      form.setAttribute('lang', btn);
      form.onLangChanged?.(form);
      local.set(btn);
    }
    form.components.container.appendChild(item);
  }
}

class ChangeLanguage extends HTMLElement {
  #template = null;
  constructor() {
    super();
    const render = async (form) => {
      form.#template = await loader.loadHTML(`/components/changeLanguage/changeLanguage.html`);
    };
    this.ready = render(this);
  }

  set visible(value) {
    if (value)
      this.classList.add('visible');
    else
      this.classList.remove('visible');
  }

  get visible() {
    return this.classList.contains('visible');
  }

  async connectedCallback() {
    await this.ready;
    this.innerHTML = this.#template;
    this.components = {
      container: this.querySelector('.dialog'),
    };
    const langList = local.langs;
    showContent(this, langList);
  }
}

customElements.define("speakease-changelanguage", ChangeLanguage);
