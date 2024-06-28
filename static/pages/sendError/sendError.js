import loader from "/components/loader/loader.js";
import "/components/sendError/sendError.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/sendError/sendError.html`);
}

const load = loadPage();

class SendError {
  constructor() {
    this.render = async (form, route) => {
      const base = form.querySelector('speakease-senderror');
      if (base == null) {
        form.innerHTML = await load;        
      }
      this.components = {};
    };

  }
}

const sendError = new SendError();
export default sendError;
