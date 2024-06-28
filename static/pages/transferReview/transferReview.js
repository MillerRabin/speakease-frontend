import loader from "/components/loader/loader.js";
import "/components/transferReview/transferReview.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/transferReview/transferReview.html`);
}

const load = loadPage();

class TransferReview {
  constructor() {
    this.render = async (form, route) => {
      let base = form.querySelector('speakease-transferreview');
      if (base == null) {
        form.innerHTML = await load;
        base = form.querySelector('speakease-transferreview');
      }
    };
  }
}

const transferReview = new TransferReview();
export default transferReview;
