import loader from "/components/loader/loader.js";
import "/components/receiptBuy/receiptBuy.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/receiptBuy/receiptBuy.html`);
}

const load = loadPage();

class ReceiptBuy {
  constructor() {
    this.render = async (form) => {
      let base = form.querySelector('speakease-receiptbuy');
      if (base == null) {
        form.innerHTML = await load;
      }
    };
  }
}

const receiptBuy = new ReceiptBuy();
export default receiptBuy;
