import loader from "/components/loader/loader.js";
import "/components/createWallet/createWallet.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/createWallet/createWallet.html`);
}

const load = loadPage();

class CreateWallet {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-createwallet');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const createWallet = new CreateWallet();
export default createWallet;
