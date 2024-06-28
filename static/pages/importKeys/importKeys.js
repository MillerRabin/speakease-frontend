import loader from "/components/loader/loader.js";
import "/components/importPrivateKeys/importPrivateKeys.js";

async function loadPage () {
  return loader.loadHTML(`/pages/importKeys/importKeys.html`);
}

class ImportKeys {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-importkeys');
      if (base == null)
        form.innerHTML = await loadPage();
      this.components = {};
    };

  }
}

const importKeys = new ImportKeys();
export default importKeys;
