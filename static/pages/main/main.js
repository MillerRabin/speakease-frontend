import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import history from "/components/history/history.js";
import loader from "/components/loader/loader.js";
import "/components/activity/activity.js";
import { LocalString } from "/components/local/local.js";

async function loadPage () {
  return await loader.loadHTML(`/pages/main/main.html`);
}

const load = loadPage();

class Main {
  constructor() {
    this.render = async (form) => {
      form.innerHTML = await load;
      this.components = {};
      breadcrumbs.setTitle(new LocalString({
        en: 'Activity list',
        ru: 'Activity list',
        ko: '액티비티 목록'
      }));

      history.setUIEnabled(false, 'activity');
    };
  }
}

const main = new Main();
export default main;
