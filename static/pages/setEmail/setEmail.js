import loader from "/components/loader/loader.js";
import "/components/setEmail/setEmail.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/setEmail/setEmail.html`);
}

const load = loadPage();

class SetEmail {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-setemail');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const setEmail = new SetEmail();
export default setEmail;