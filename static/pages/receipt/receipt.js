import loader from "/components/loader/loader.js";
import "/components/receipt/receipt.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/receipt/receipt.html`);
}

const load = loadPage();

class Receipt {
  constructor() {
    this.render = async (form) => {
      let base = form.querySelector('speakease-receipt');
      if (base == null) {
        form.innerHTML = await load;
      }
    };
  }
}

const receipt = new Receipt();
export default receipt;
