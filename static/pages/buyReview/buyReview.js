import loader from "/components/loader/loader.js";
import "/components/buyReview/buyReview.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/buyReview/buyReview.html`);
}

const load = loadPage();

class BuyReview {
  constructor() {
    this.render = async (form, route) => {
      let base = form.querySelector('speakease-buyreview');
      if (base == null) {
        form.innerHTML = await load;
        base = form.querySelector('speakease-buyreview');
      }
    };
  }
}

const buyReview = new BuyReview();
export default buyReview;