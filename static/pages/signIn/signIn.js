import loader from "/components/loader/loader.js";
import "/components/signIn/signIn.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/signIn/signIn.html`);
}

const load = loadPage();

class SignIn {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-signin');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const signIn = new SignIn();
export default signIn;
