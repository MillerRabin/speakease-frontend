import loader from "/components/loader/loader.js";
import "/components/permission/permission.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/permission/permission.html`);
}

const load = loadPage();

class Permission {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-permission');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const permission = new Permission();
export default permission;
