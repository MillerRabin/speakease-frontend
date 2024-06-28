import local, { LocalString } from "/components/local/local.js";
import loader from "/components/loader/loader.js";
import history from "/components/history/history.js";
import breadcrumbs from "/components/breadcrumbs/breadcrumbs.js";
import users from "/components/users/users.js";
import system from "/components/system/system.js";
import router from "/components/router/router.js";
import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';

class Settings {
  constructor() {
    this.render = async (form) => {
      const lang = local.get();
      await loader.mountURL(form, `/pages/settings/${lang.ui}/settings.html`);
      form.components = {};      
      try {
        const user = users.getUser();
        if (user == null)
          throw new Error('You are not authorized');
        breadcrumbs.setTitle(new LocalString({
          en: 'Settings',
          ru: 'Настройки',
          ko: '설정'
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

async function settingsActivity() {
  const activity = new Activity({
    name: 'settings',
    text: new LocalString({
      en: 'Settings',
      ru: 'Настройки',
      ko: '설정',
      format: (text, name) => `${name}, ${text}`
    }),
    link: '/settings.html',
    top: ['home'],
    order: 10,
    type: 'info',
    description: new LocalString({
      en:'If you want to go to Settings, say Settings',
      ru:'Если хотите перейти в настройки, скажите Настройки',
      ko:'설정을 하시려면 다음과 같이 말씀해 주세요 - 설정',
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

settingsActivity();

const settings = new Settings();
export default settings;
