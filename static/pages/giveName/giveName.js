import loader from "/components/loader/loader.js";
import "/components/giveName/giveName.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/giveName/giveName.html`);
}

const load = loadPage();

class GiveName {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-givename');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const giveName = new GiveName();
export default giveName;
