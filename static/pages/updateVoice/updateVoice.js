import loader from "/components/loader/loader.js";
import "/components/updateVoice/updateVoice.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/updateVoice/updateVoice.html`);
}

const load = loadPage();

class UpdateVoiceData {
  constructor() {
    this.render = async (form) => {
      const base = form.querySelector('speakease-updatevoice');
      if (base == null)
        form.innerHTML = await load;
      this.components = {};
    };

  }
}

const uvd = new UpdateVoiceData();
export default uvd;
