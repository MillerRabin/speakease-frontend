import loader from "/components/loader/loader.js";
import "/components/getPubKeys/getPubKeys.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/getPubKeys/getPubKeys.html`);
}

const load = loadPage();

class GetPulicKeys {
  constructor() {
    this.render = async (form, route) => {
      const currency = route?.param?.find(p => p.name === 'Currency');
      const bc_family = route?.param?.find(p => p.name === 'Blockchain');
      const base = form.querySelector('speakease-getkeys');
      if (base == null)
        form.innerHTML = await load;
      if (currency?.value) {
        const el = form.querySelector('speakease-getkeys');
        if (el) {
          el.setAttribute('currency', currency.value.currency);
        }
      }
      if (bc_family?.value) {
        const el = form.querySelector('speakease-getkeys');
        if (el) {
          const { family } = bc_family.value;
          el.setAttribute('blockchain', family);
        }
      }
    };

  }
}

const gpk = new GetPulicKeys();
export default gpk;
