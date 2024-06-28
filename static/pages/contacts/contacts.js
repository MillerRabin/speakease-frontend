import loader from "/components/loader/loader.js";
import "/components/contacts/contacts.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/contacts/contacts.html`);
}

const load = loadPage();

class Contacts {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-contacts');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const contacts = new Contacts();
export default contacts;
