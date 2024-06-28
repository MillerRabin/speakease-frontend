import loader from "/components/loader/loader.js";
import "/components/exportPrivateKeys/exportPrivateKeys.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/exportKeys/exportKeys.html`);
}

const load = loadPage();

class ExportKeys {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-exportkeys');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const exportKeys = new ExportKeys();
export default exportKeys;
