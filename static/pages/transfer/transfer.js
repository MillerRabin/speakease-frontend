import loader from "/components/loader/loader.js";
import "/components/transfer/transfer.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/transfer/transfer.html`);
}

const load = loadPage();

class Transfer {
  constructor() {
    this.render = async (form) => {
      let base = form.querySelector('speakease-transfer');
      if (base == null) {
        form.innerHTML = await load;
        base = form.querySelector('speakease-transfer');
      }
    };
  }
}

const transfer = new Transfer();
export default transfer;
