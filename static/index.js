import "/components/header/header.js";
import "/components/activity/activity.js";
import "/components/history/history.js";
import "/components/textInput/textInput.js";
import "/components/activity/activity.js";
import "/components/wallets/wallets.js";
import "/components/contacts/contacts.js";
import "/components/system/system.js";
import "/components/changePin/changePin.js";
import "/components/errors/errors.js";
import entityServer from "/intentions/entityServer/entityServer.js";

import config from "/config.js";
import router from "/components/router/router.js";
import routes from "./routes.js";
import users from  "/components/users/users.js";
import history from "/components/history/history.js";
import { check, activityStatus } from "/intentions/activityManager/activityManager.js";
import system from "/components/system/system.js";
import { storage } from "/intentions/main.js";
import "/intentions/intentionTypeNavigation/main.js";
import { getTransferLink } from  "/intentions/transfer/transfer.js";
import { get as getActivityList } from "/components/activity/activity.js";

function loadRouter(resolve, timeout) {
  try {
    const application = window.document.querySelector("#Application");
    const routerPoint = application.querySelector("#Router");
    clearTimeout(timeout);
    return resolve({ application, routerPoint });
  } catch (e) {
    setTimeout(() => {
      loadRouter(resolve);
    }, 500);
  }
}

function tryLoadRouter() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      return reject(new Error('Loading timeout is exceeded'));
    }, config.loadingTimeout);
    loadRouter(resolve, timeout);
  })
}

function getParametersByName(value, name) {
  const res = value.parameters.find(p => p.name == name)
  return res.value;
}

function createIntentions() {
  const navigation = storage.createIntention({
    title: {
      en: 'Console navigation',
      ko: '콘솔 네비게이션'
    },
    input: 'None',
    output: 'NavigationResult',
    onData: async function onData(status, intention, value) {
      if (status != 'data') return;
      intention.send('completed', this, { success: true });
      if (!system.checkName(intention.parameters)) return;
      const al = getActivityList();
      al.close();      
      await check();
      const list = getActivityList();
      switch (intention.value) {
        case "refresh": {
          window.location.reload();
          system.setDispatching(true);
          return;
        }
        case "back": {
          system.setDispatching(true);  
          if (list.isOpened())
            return list.close();
          const state = history.getState();
          const enabled = history.getUIEnabled();
          if (!enabled || state == 'ui')
            return window.history.go(-1);
          return history.setState('ui');
        }
        case "logout": {
          system.setDispatching(true);
          users.logout();
          break;
        }
        case "home": {
          system.setDispatching(true);
          return users.gotoHome();
        }
        case "showHistory": {
          system.setDispatching(true);
          return history.setState('history');
        }
        case "help": {
          system.setDispatching(true);
          return list.open();
        }
      }
      const vl = (value == null) ? intention.value : value;
      if(vl != null && activityStatus(vl.value) == 'stopped') {
        system.setBlinking(true);
      }
      if (vl != null && activityStatus(vl.value) !== 'stopped') {
        system.setDispatching(true);
        router.goto({ name: vl.value, param: intention.parameters }, null, true);
      }
    }
  });

  const transfer = storage.createIntention({
    title: {
      en: 'Transfer',
      ko: '보내기'
    },
    input: 'TransferParameters',
    output: 'TransferResult',
    onData: async function onData(status, intention, value) {
      if (status != 'data') return;
      intention.send('completed', this, { success: true });
      const al = getActivityList();
      al.close();
      await check();
      if (!system.checkName(intention.parameters)) return;
      const name = getParametersByName(value, 'Contact');
      const amount = getParametersByName(value, 'Amount');
      const currency = getParametersByName(value, 'Currency');
      const tLink = getTransferLink({ name, amount, currency });
      const vl = (value == null) ? intention.value : value;
      if (vl != null && activityStatus(vl.value) !== 'stopped') {
        system.setDispatching(true);
        router.goto(tLink, null, true);
      }
    }
  });
  return { transfer, navigation };
}

function enableVoiceFocus() {
  system.on.focused(focusHandler);
  entityServer.on.recognitionError(errorHandler);
}

function focusHandler(event) {
  setCalledAndFocused(event.data);
}

let errorTimeout;
const errorInterval = 1000;
function errorHandler() {
  setError(true)
  clearTimeout(errorTimeout);
  errorTimeout = setTimeout(() => {
    setError(false)
  }, errorInterval);
}

function setCalledAndFocused(value) {
  const body = window.document.body;
  value.called ? body.classList.add('called') : body.classList.remove('called');
  value.focused ? body.classList.add('focused') : body.classList.remove('focused');
  value.listening ? body.classList.add('listening') : body.classList.remove('listening');
  value.dispatching ? body.classList.add('dispatching') : body.classList.remove('dispatching');
  value.blinking ? body.classList.add('blinking') : body.classList.remove('blinking');
}

function setError(value) {
  const body = window.document.body;
  value ? body.classList.add('error') : body.classList.remove('error');  
}

const { application, routerPoint } = await tryLoadRouter();
router.update(application, routerPoint, routes);
window.document.body.classList.add('loaded');
createIntentions();
enableVoiceFocus();
window.speakease?.hideSplasher?.();