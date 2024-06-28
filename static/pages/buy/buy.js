import loader from "/components/loader/loader.js";
import "/components/buy/buy.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/buy/buy.html`);
}

const load = loadPage();

class Buy {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-buy');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const buy = new Buy();
export default buy;
