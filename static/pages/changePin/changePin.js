import loader from "/components/loader/loader.js";
import "/components/changePin/changePin.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/changePin/changePin.html`);
}

const load = loadPage();

class ChangePin {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-changepin');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const changePin = new ChangePin();
export default changePin;
