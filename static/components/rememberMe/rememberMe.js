import { LocalString } from "/components/local/local.js";
import activityManager from "/intentions/activityManager/activityManager.js";
import Activity from "/intentions/activityManager/Activity.js";
import users from "/components/users/users.js";
import { addEntities } from "/intentions/entities/entities.js";
import { storage } from "/intentions/main.js";
import { getProperty, setProperty } from "/components/settings/settings.js";
import { check } from "/intentions/activityManager/activityManager.js";
import history from "/components/history/history.js";
import { log } from "/intentions/console/console.js";

const localData = {
  remember: new LocalString({
    en: 'I will not logout you at exit',
    ru: 'При выходе из приложения вы останетесь авторизованы.',
    ko: '종료 후에도 로그인 상태를 유지하겠습니다.',
  }),
  forget: new LocalString({
    en: 'I will logout you at exit',
    ru: 'При выходе из приложения будет выполнен выход из кошелька.',
    ko: '종료 후 로그인 상태 유지를 해제하겠습니다.',
  }),
}

const notifyUser = (msg) => {
   history.setState('history');
   log(msg.data);
   setTimeout(() => users.gotoHome(), 3000);
}

const rememberActivity = new Activity({
  name: 'Remember me',
  text: new LocalString({
    en: `Start remembering me`,
    ru: `Включи режим сохранения авторизации`,
    ko: `로그인 상태 유지 시작`,
    format: (text, name) => `${name}, ${text}`
  }),
  link: () => {
    check();
    setProperty('rememberMe', true);
    notifyUser(localData.remember);
  },
  order: 18,
  type: 'general',
  description: new LocalString({
    en:'If you need to stay logged in, say - remember me.',
    ru:'Если вы хотите остаться в приложении, произнесите - запомни меня',
    ko:'로그인 상태를 유지하시려면 다음과 같이 말씀하십시오 - 로그인 상태 유지 시작'
  })
}, {
  check: function () {
    const signIn = users.getUser();
    if (!signIn) return false;
    if (getProperty('rememberMe')) return false;
    return true;
  }
});
activityManager.start(rememberActivity);

const forgetActivity = new Activity({
  name: 'Forget me',
  text: new LocalString({
    en: `Stop remembering me`,
    ru: `Выключи режим сохранения авторизации`,
    ko: `로그인 상태 유지 해제`,
    format: (text, name) => `${name}, ${text}`
  }),
  link: () => {
    check();
    setProperty('rememberMe', false);
    notifyUser(localData.forget);
  },
  order: 18,
  type: 'general',
  description: new LocalString({
    en:'If you dont need to stay logged in, say - stop remembering me.',
    ru:'Если вы хотите остаться в приложении, произнесите - запомни меня',
    ko:'로그인 상태 유지를 해제하시려면 다음과 같이 말씀하십시오 - 로그인 상태 유지 해제'
  })
}, {
  check: function () {
    const signIn = users.getUser();
    if (!signIn) return false;
    if (!getProperty('rememberMe')) return false;
    return true;
  }
});
activityManager.start(forgetActivity);

const taskIntention = [{
  title: 'Remember me mode',
  input: 'RememberMe',
  output: 'None'
}];

addEntities([
  {
    type: 'task',
    name: {
      general: 'remember me',
      en: 'Remember me',
      ru: 'Запомни меня',
      ko: '로그인 상태 유지',
    },
    words: [
      { en: 'start remembering me', ru: 'включи режим сохранения авторизации', ko: '로그인 상태 유지 시작'},
      { en: 'remember me'},
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'rememberMe',
    intentions: taskIntention
  }, {
    type: 'task',
    name: {
      general: 'forget',
      en: 'forget',
      ru: 'забудь',
      ko: '로그인 상태 유지 해제',
    },
    words: [
      { en: 'stop remembering me', ru: 'выключи режим сохранения авторизации', ko: '로그인 상태 유지 해제' },
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'stopRememberMe',
    intentions: taskIntention
  }
]);

storage.createIntention({
    title: {
      en: 'Remember switch',
      ko: '로그인 상태 유지 스위치'
    },
    input: 'None',
    output: 'RememberMe',
    onData: async function onData(status, intention) {
      if (status != 'data') return;
      intention.send('completed', this, { success: true });
      await check();
      switch (intention.value) {
        case "rememberMe":
          setProperty('rememberMe', true);
          notifyUser(localData.remember);
          return;
        case "stopRememberMe":
          setProperty('rememberMe', false);
          notifyUser(localData.forget);
          return;
      }
    }
  });