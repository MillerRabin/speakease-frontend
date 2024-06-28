import loader from "/components/loader/loader.js";
import "/components/breadcrumbs/breadcrumbs.js";
import interact from "/intentions/intention-can-interact-with-user/main.js";
import "/components/languageBtn/languageBtn.js";
import "/components/changeLanguage/changeLanguage.js";

async function load() {
  return await loader.loadHTML(`/components/textInput/textInput.html`);
}

const loaded = load();
class TextInput extends HTMLElement {
  #enableSendBtn() {
    interact.start(null, this.components.text);
    this.components.send.onclick = () => {
      this.components.text.send();
    }
  }

  async connectedCallback() {
    this.innerHTML = await loaded;
    this.components = {
      send: this.querySelector('button'),
      text: this.querySelector('textarea'),
      langBtn: this.querySelector('language-btn'),
      changeLanguage: this.querySelector('speakease-changelanguage'),
    };
    this.#enableSendBtn();
    this.components.langBtn.onclick = () => {
      const { changeLanguage } = this.components;
      changeLanguage.visible = !changeLanguage.visible;
    }
    this.components.changeLanguage.onLangChanged = (node) => {
      const language = node.getAttribute('lang');
      this.components.langBtn.setAttribute('lang', language);
    }
  }
}

customElements.define("speakease-textinput",TextInput);
