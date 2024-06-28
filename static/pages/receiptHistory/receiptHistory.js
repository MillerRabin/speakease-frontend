import loader from "/components/loader/loader.js";
import "/components/receiptHistory/receiptHistory.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/receiptHistory/receiptHistory.html`);
}

const load = loadPage();

class ReceiptHistory {

  constructor() {
    this.render = async (form, route) => {
      let base = form.querySelector('speakease-receipthistory');
      if (base == null) {
        form.innerHTML = await load;
        base = form.querySelector('speakease-receipthistory');
      }
    };
  }
}

const receiptHistory = new ReceiptHistory();
export default receiptHistory;
