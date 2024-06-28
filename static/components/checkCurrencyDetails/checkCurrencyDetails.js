import activityManager from '/intentions/activityManager/activityManager.js';
import Activity from '/intentions/activityManager/Activity.js';
import local from '../local/local.js';
import system from "/components/system/system.js";
import users from "/components/users/users.js";
import router from "/components/router/router.js";


const { LocalString } = local;

async function checkBitcoinNetActivity() {
  const activity = new Activity({
    name: 'bitcoinPublicKeyCopy',
    text: new LocalString({
      en: 'Copy bitcoin public key',
      ru: 'Скопируй биткоин публичный ключ',
      ko: '비트코인 공개키 복사',
    }),
    link: function () {
      const pubKeysEl = window.document.querySelector('speakease-getkeys');
      if(pubKeysEl == null) return;
      pubKeysEl.copyKey('bitcoin');
    },
    top: ['getPubKeys'],
    order: 1,
    type: 'general',
    description: new LocalString({
      en:'To copy bitcoin wallet public key just say - copy bitcoin',
      ru:'Чтобы скопировать публичный ключ кошелька биткоин, просто скажите - скопировать биткоин',
      ko:'비트코인 지갑의 공개키 복사를 하시려면 다음과 같이 말씀하십시오 - 비트코인 복사',
    })
  }, {
    check: async () => {
      const url = await router.current();
      const pathname = url.name == 'getPubKeys' ? true : false;
      if (!system.hasName() || !pathname) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
}

async function checkEthereumNetActivity() {
  const activity = new Activity({
    name: 'ethereumPublicKeyCopy',
    text: new LocalString({
      en: 'Copy ethereum public key',
      ru: 'Скопировать ефереум публичный ключ',
      ko: '이더리움 공개키 복사',
    }),
    link: function () {
      const pubKeysEl = window.document.querySelector('speakease-getkeys');
      if(pubKeysEl == null) return;
      pubKeysEl.copyKey('ethereum');
    },
    top: ['getPubKeys'],
    order: 1,
    type: 'general',
    description: new LocalString({
      en:'To copy ethereum wallet public key just say - copy ethereum',
      ru:'Чтобы скопировать публичный ключ кошелька эфереума, просто скажите - скопировать эфереум',
      ko:'이더리움 지갑의 공개키를 복사하시려면 다음과 같이 말씀하십시오 - 이더리움 복사',
    })
  }, {
    check: async () => {
      const url = await router.current();
      const pathname = url.name == 'getPubKeys' ? true : false;
      if (!system.hasName() || !pathname) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
}

async function checkSolanaNetActivity() {
  const activity = new Activity({
    name: 'SolanaPublicKeyCopy',
    text: new LocalString({
      en: 'Copy solana public key',
      ru: 'Скопировать солана публичный ключ',
      ko: '솔라나 공개키 복사',
    }),
    link: function () {
      const pubKeysEl = window.document.querySelector('speakease-getkeys');
      if(pubKeysEl == null) return;
      pubKeysEl.copyKey('solana');
    },
    top: ['getPubKeys'],
    order: 1,
    type: 'general',
    description: new LocalString({
      en:'To copy solana wallet public key just say - copy solana',
      ru:'Чтобы скопировать публичный ключ кошелька солана, просто скажите - скопировать солана',
      ko:'솔라나 지갑의 공개키를 복사하시려면 다음과 같이 말씀하십시오 - 솔라나 복사',
    })
  }, {
    check: async () => {
      const url = await router.current();
      const pathname = url.name == 'getPubKeys' ? true : false;
      if (!system.hasName() || !pathname) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
}

async function checkKlaytnNetActivity() {
  const activity = new Activity({
    name: 'klaytnPublicKeyCopy',
    text: new LocalString({
      en: 'Copy klaytn public key',
      ru: 'Скопировать клейтн публичный ключ',
      ko: '클레이튼 공개키 복사',
    }),
    link: function () {
      const pubKeysEl = window.document.querySelector('speakease-getkeys');
      if(pubKeysEl == null) return;
      pubKeysEl.copyKey('ethereum');
    },
    top: ['getPubKeys'],
    order: 1,
    type: 'general',
    description: new LocalString({
      en:'To copy klaytn wallet public key just say - copy klaytn',
      ru:'Чтобы скопировать публичный ключ кошелька клейтн, просто скажите - скопировать клейтн',
      ko:'클레이튼 공개키를 복사하시려면 다음과 같이 말씀하십시오 - 클레이튼 복사',
    })
  }, {
    check: async () => {
      const url = await router.current();
      const pathname = url.name == 'getPubKeys' ? true : false;
      if (!system.hasName() || !pathname) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
}

async function checkBinanceNetActivity() {
  const activity = new Activity({
    name: 'binancePublicKeyCopy',
    text: new LocalString({
      en: 'Copy binance public key',
      ru: 'Скопировать бинанс публичный ключ',
      ko: '바이낸스 공개키 복사',
    }),
    link: function () {
      const pubKeysEl = window.document.querySelector('speakease-getkeys');
      if(pubKeysEl == null) return;
      pubKeysEl.copyKey('ethereum');
    },
    top: ['getPubKeys'],
    order: 1,
    type: 'general',
    description: new LocalString({
      en:'To copy binance wallet public key just say - copy binance',
      ru:'Чтобы скопировать публичный ключ кошелька бинанс, просто скажите - скопировать бинанс',
      ko:'바이낸스 지갑의 공개키를 복사하시려면 다음과 같이 말씀하십시오 - 바이낸스 복사',
    })
  }, {
    check: async () => {
      const url = await router.current();
      const pathname = url.name == 'getPubKeys' ? true : false;
      if (!system.hasName() || !pathname) return false;
      const user = users.getUser();
      return (user != null);
    }
  });
  activityManager.start(activity);
}

function init() {
  checkBitcoinNetActivity();
  checkEthereumNetActivity();
  checkSolanaNetActivity();
  checkKlaytnNetActivity();
  checkBinanceNetActivity();
}

export default {
  init,
}
