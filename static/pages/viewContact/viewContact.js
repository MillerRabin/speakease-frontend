import loader from "/components/loader/loader.js";
import "/components/viewContact/viewContact.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/viewContact/viewContact.html`);
}

const load = loadPage();

class ViewContact {

  constructor() {
    this.render = async (form, route) => {
      let base = form.querySelector('speakease-viewcontact');
      if (base == null) {
        form.innerHTML = await load;
        base = form.querySelector('speakease-viewcontact');
      }
    };
  }
}

const viewContact = new ViewContact();
export default viewContact;
