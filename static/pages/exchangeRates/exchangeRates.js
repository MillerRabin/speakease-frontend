import loader from "/components/loader/loader.js";
import "/components/exchangeRates/exchangeRates.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/exchangeRates/exchangeRates.html`);
}

const load = loadPage();

class ExchnageRates {
  #getCurrency(route) {
    const tCurr = route?.param?.find(p => p.name =='Currency') ?? null;
    return tCurr?.value || null;
  }
  
  constructor() {
    this.render = async (form, route) => {
      let base = form.querySelector('speakease-exchangerates');
      if (base == null) {
        form.innerHTML = await load;
        base = form.querySelector('speakease-exchangerates');
      }
      base.currency = this.#getCurrency(route);
    };
  }
}

const exchangeRates = new ExchnageRates();
export default exchangeRates;
