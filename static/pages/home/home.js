import local, { LocalString } from "/components/local/local.js";
import loader from "/components/loader/loader.js";
import history from "/components/history/history.js";
import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import users from "/components/users/users.js";
import system from "/components/system/system.js";
import router from "/components/router/router.js";
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';

class Home {
  constructor() {
    this.render = async (form) => {
      const lang = local.get();
      await loader.mountURL(form, `/pages/home/${lang.ui}/home.html`);
      form.components = {
        walletName: form.querySelector('.wallet-name'),
        logoutBtn: form.querySelector('.logoutBtn'),
        buy: form.querySelector('.btn.buy')
      };      
      form.components.logoutBtn.onclick = () => {
        users.logout();
        router.goto('/');
      }
      try {
        const sname = system.getName();
        const user = users.getUser();
        if (user == null)
          throw new Error('You are not authorized');
        form.components.walletName.innerHTML = sname;
        breadcrumbs.setTitle(new LocalString({
          en: 'Home',
          ru: 'Главная',
          ko: '홈'
        }));
        history.setState('ui');
      } catch (e) {
        console.error(e);
        setTimeout(() => {
          router.goto('/');
        }, 0)
      }
    };
  }
}

async function gotoHomeActivity() {
  const activity = new Activity({
      name: 'Go to home',      
      text: new LocalString({
        en: 'Go to home',
        ru: 'Перейди на главную',
        ko: '홈으로 이동',
        format: (text, name) => `${name}, ${text}`
      }),
      exclude: ['home'],
      link: users.gotoHome,
      order: 31,
      type: 'info',
      description: new LocalString({
        en:'If you want to go to homepage, say go to home',
        ru:'Если хотите вернуться на главную, Скажите На главную',
        ko:'홈페이지로 이동하시려면 다음과 같이 말씀해 주세요 - 홈으로'
      })
    }, {
      check: async function () {
        const signIn = users.getUser();
        if (!system.hasName() || !signIn) return false;        
        return true;
      }
  });
  activityManager.start(activity);
}

gotoHomeActivity();

const home = new Home();
export default home;
