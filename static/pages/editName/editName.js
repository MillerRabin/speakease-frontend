import loader from "/components/loader/loader.js";
import "/components/editName/editName.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/editName/editName.html`);
}

const load = loadPage();

class EditName {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-editname');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const editName = new EditName();
export default editName;
