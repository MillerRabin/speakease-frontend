import loader from "/components/loader/loader.js";
import "/components/editContacts/editContacts.js";
import intentions from "/intentions/main.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/editContacts/editContacts.html`);
}

const load = loadPage();

class EditContacts {
  #getUrlParams (filter) {
    const params = new URL(window.location);
    return params.searchParams.get(filter);
  }

  #findRequest(route) {
     const tp = route.param.find(f => {
      const target = (f.name == 'AddRequest') || (f.name == 'DeleteRequest') || (f.name == 'RenameRequest');
      const tval = f.value != null;
      return target && tval;
    });
     return tp?.value;
  }

  #findContact(route) {
    const tc = intentions.getParameterByName(route.param, 'Contact');
    return tc?.value;
  }
  constructor() {
    this.render = async (form, route) => {
      const base = form.querySelector('speakease-editcontacts');
      if (base == null)
        form.innerHTML = await load;
      const sbase = form.querySelector('speakease-editcontacts');
      let rtype = this.#getUrlParams('type');
      let rContact = this.#getUrlParams('name');
      if(route.param != null) {
        rtype = rtype == null ? this.#findRequest(route) : rtype;
        rContact = rContact == null ? this.#findContact(route) : rContact;
      }
      sbase.type = rtype;
      sbase.contact = rContact;
    };
  }
}

const editContacts = new EditContacts();
export default editContacts;
