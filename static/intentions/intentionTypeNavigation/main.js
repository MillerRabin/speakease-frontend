import { addEntities } from "/intentions/entities/entities.js";

const taskIntention = [{
  title: 'Change interface',
  input: 'NavigationResult',
  output: 'None'
}];

const gNavigation = [
  {
    type: 'task',
    name: {
      general: 'signIn',
      en: 'SignIn',
      ru: 'Войти',
      ko: '로그인',

    },
    words: [
      { en: 'sign in', ru: 'aвторизуй я', ko: '로그인 시켜 줘' },
      { en: 'sign me in' }, { en: 'sign in me', ko: '로그인' },
      { en: 'sign mean', ru: 'пустить я' },
      { en: 'send me', ru: 'впустить я' },
      { en: 'say mean' },
      { en: 'log in' },
      { en: 'look in' },
      { en: 'login' },
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'signIn',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'createWallet',
      en: 'CreateWallet',
      ru: 'Создать кошелек',
      ko: '지갑 생성'

    },
    words: [
      { en: 'create wallet', ru: 'создай кошелек', ko: '지갑 생성' }, 
      { en: 'create work' },
      { en: 'create my void' },
      { en: 'create my vogue it' }
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'createWallet',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'giveName',
      en: 'Give name',
      ru: 'Дать имя',
      ko: '작명'
    },
    words: [
      { en: 'set name', ru: 'Установить имя', ko: '이름 설정' },
      { en: 'set new name', ru: 'Установить новое имя', ko: '새 이름 설정' },

    ],
    value: 'giveName',
    intentions: taskIntention
  },
  { 
    type: 'task',
    name: {
      general: 'changeName',
      en: 'Change device name',
      ru: 'Сменить имя устройства',
      ko: '디바이스 이름 변경'
    },
    words: [
      { en: 'change device name', ru: 'Сменить имя устройства', ko: '디바이스 이름 변경' },

    ],
    value: 'changeName',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'permissions',
      en: 'Set device permissions',
      ru: 'Дать права устройству',
      ko: '디바이스 권한 설정'
    },
    words: [{
      en: 'set permissions',
      ru: 'дать права',
      ko: '권한 설정'
    }],
    value: 'permissions',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'updateVoice',
      en: 'Update voice data',
      ru: 'Обновить голосовые данные',
      ko: '음성 데이터 업데이트'
    },
    words: [
      { en: 'update voice sample', ru: 'Обновить голос', ko: '음성 업데이트' },
      { en: 'set new voice example', ru: 'Установить новые голосовые данные', ko: '새 음성 예제 설정' },
      { en: 'change voice sample', ko: '음성 샘플 바꾸기' },
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'updateVoice',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'Home',
      en: 'Home',
      ru: 'Домой',
      ko: '홈'

    },
    words: [
      { en: 'go to home', ru: 'вернуться на главный', ko: '홈으로 이동' },
      { en: 'go home', ru: 'перейти на главный',ko: '홈으로' },
      { en: 'go to main page', ru: 'вернуться дом' },
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'home',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'changePin',
      en: 'Change password',
      ru: 'Изменить пароль',
      ko: '핀 변경'

    },
    words: [
      { en: 'change password', ru: 'изменить пароль', ko: '비밀번호 변경' },
      { ru: 'сменить пароль' }
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'changePin',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'ExchangeRates',
      en: 'Exchange rates',
      ru: 'Обменные курсы',
      ko: '환율'

    },
    words: [
      { en: 'exchange rates', ru: 'Обменные курсы', ko: '환율' },
      { en: 'exchange rate' },
      { en: 'what is price', ru: 'Какой курс', ko: '오늘 환율은 얼마야' },
      { en: 'what are prices', ru: 'Какие курсы' },
      { en: 'check cryptocurrency price' },
      { en: 'show cryptocurrency price' },
      { en: 'check crypto price' },
      { en: 'check crypto prices', ko: '코인 가격 확인' },
      { en: 'view crypto prices', ko: '코인 가격 보기' },
      { en: 'show crypto prices' },
      { en: 'show crypto price' },
      { en: 'view crypto prices' },
      { en: 'view crypto price' },
      { en: 'cryptocurrency rates' },
      { en: 'cryptocurrency rate', ko: '시세 확인' },
      { ko: '코인 시세 확인' }
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    },
    {
      general: 'Currency',
      ru: 'Валюта?',
      en: 'Currency?',
      ko: '화폐',
      value: 'BTC'
    }],
    value: 'exchangeRates',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'walletBalance',
      en: 'What is my balance',
      ru: 'Баланс кошелька',
      ko: '지갑 잔고'

    },
    words: [
      { en: 'Wallet balance', ru: 'Баланс кошелька', ko: '지갑 잔고' },
      { en: 'my balance', ru: 'мой баланс', ko: '내 잔고' },
      { en: 'view balance', ru: 'покажи баланс' },
      { en: 'view balances', ko: '잔고 보기' },
      { en: 'show balances', ko: '잔고 보여 줘'},
      { en: 'show balance' },
      { en: 'short balance' }
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'walletBalance',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'editContacts',
      en: 'Edit contacts',
      ru: 'Редактировать контакт',
      ko: '연락처 편집'
    },
    words: [
      { en: 'edit contact', ru: 'редактировать контакт', ko: '연락처 편집'},
      { en: 'manage contacts',ko: '연락처 편집'},
      { en: 'agent contact', ko: ' 편집해 줘'},
      { en: 'add contact', ru: 'добавить контакт', ko: '연락처 추가'},
      { en: 'ed contact' },
      { en: 'delete contact', ru: 'удалить контакт', ko: '연락처 삭제'},
      { en: 'remove contact', ru: 'удалить контакт', ko: '연락처 제거'},
      { en: 'manage contact'},
      { en: 'rename contact', ru: 'переименовать контакт', ko: '이름 변경'},
      { en: 'real name contact'},
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }, {
      general: 'Contact',
      value: null
    },
    {
      general: 'AddRequest',
      value: null
    }, 
    {
      general: 'RenameRequest',
      value: null
    },
    {
      general: 'DeleteRequest',
      value: null
    }],
    value: 'editContacts',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'contacts',
      en: 'Show contacts',
      ru: 'Покажи контакты',
      ko: '연락처 보기'
    },
    words: [
      { en: 'show contacts', ru: 'покажи контакты', ko: '연락처 보기' },
      { en: 'show contact' },
      { en: 'view contact' },
      { en: 'view contacts' },
      { en: 'find contacts', ru: 'найди контакты', ko: '연락처 찾기' },
      { en: 'find contact' }
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'contacts',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'receiptHistory',
      en: 'Receipt history',
      ru: 'История транзакций',
      ko: '거래 내역'
    },
    words: [
      { en: 'show history', ru: 'покажи историю', ko: '거래 내역 보기' },
      { en: 'view history', ko: '거래 내역' }
    ],
    value: 'receiptHistory',
    intentions: taskIntention
    },
    {
    type: 'task',
    name: {
      general: 'sendError',
      en: 'Send feedback',
      ru: 'Отправить отзыв',
      ko: '피드백 전송'
    },
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    words: [
      { en: 'Send feedback', ru: 'Отправить отзыв', ko: '피드백 전송' },
      { en: 'Sent it back' }
    ],
    value: 'sendError',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'go back',
      en: 'go back',
      ru: 'Вернуться назад',
      ko: '뒤로 가기'
    },
    words: [
      { en: 'go back', ru: 'назад', ko: '뒤로 가기' },
      { en: 'back', ko: '뒤로' },
      { en: 'quebec' }
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'back',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'log out',
      en: 'log out',
      ru: 'Выход',
      ko: '로그아웃'
    },
    words: [
      { en: 'log out', ru: 'выход', ko: '로그아웃' }, { en: 'logout', ko: '로그아웃 시켜 줘' }, { en: 'look out' }, { en: 'workout' }, { en: 'log me out'}
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'logout',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'help me',
      en: 'help me',
      ru: 'нужна помощь',
      ko: '도움말'
    },
    words: [
      { en: 'help me', ru: 'помоги мне', ko: '도움말' },
      { en: 'what can I do', ru: 'что я могу сделать', ko: '내가 할 수 있는 일' },
      { en: 'activity list' },
    ],
    value: 'help',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'refresh',
      en: 'refresh',
      ru: 'перезагрузить',
      ko: '새로 고침'
    },
    words: [
      { en: 'refresh', ru: 'перезагрузить', ko: '새로 고침' },
      { en: 'reload', ru: 'обновить', ko: '리로드' },
      { ko: '리프레쉬' },
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'refresh',
    intentions: taskIntention
  }, {
    type: 'task',
    name: {
      general: 'show history',
      en: 'show history',
      ru: 'show history',
      ko: 'show history'
    },
    words: [
      { en: 'show logs', ru: 'покажи логи', ko: '로그 보기' },
      { en: 'show log', ru: 'покажи лог' },
      { en: 'show looks' }, { en: 'show look' }, { en: 'showbox' }, { en: 'so looks'},
      { en: 'prologue' }, { en: 'trollocs' }
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'showHistory',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
        general: 'getPublicKeys',
        en: 'Get public keys',
        ru: 'Получить публичные ключи',
        ko: '공개키 가져오기',
    },
    parameters: [
      { general: 'Name', value: null },
      { general: 'CopyRequest', value: null },
      { general: 'Currency', value: null },
      { general: 'Blockchain', value: null },
    ],
    words: [
      { en: 'show public keys', ru: 'покажи публичные ключи', ko: '공개키 보기' },
      { en: 'show payment detail', ru: 'покажи платежные реквизиты' },
      { en: 'show payment details', ru: 'получить публичные ключи' },
      { en: 'show wallet address', ko: '지갑 주소 보기' },
      { en: 'copy my key', ru: 'Скопируй мой ключ', ko: '내 키 복사' },
      { en: 'copy my here' },
      { en: 'copy my kia' },
      { en: 'get public keys', ko: '공개키 가져오기'}
  ],
    value: 'getPubKeys',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
        general: 'getPrivateKeys',
        en: 'Get private keys',
        ru: 'Получить приватные ключи',
        ko: '개인키 가져오기'
    },
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    words: [
      { en: 'show private keys', ru: 'покажи приватные ключи', ko: '개인키 보여줘' },
      { en: 'show private key', ko: '개인키 보기' },
      { ko: '개인기 보기'}
    ],
    value: 'exportKeys',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
        general: 'importPrivateKeys',
        en: 'Import private keys',
        ru: 'Импортировать приватные ключи',
        ko: 'Import private keys',
    },
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    words: [
      { en: 'import private keys', ru: 'импортировать приватные ключи' },
      { en: 'import private key' },
    ],
    value: 'importKeys',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'editName',
      en: 'Change wallet name',
      ru: 'Поменять имя кошелька',
      ko: '지갑 이름 변경',
    },
    words: [
      { en: 'Change my name', ru: 'Поменять мое имя', ko: '내 이름 변경' },
      { en: 'Change wallet name', ru: 'Поменять имя кошелька', ko: '지갑 이름 변경' },
      { en: 'Change user name', ru: 'Поменять имя пользователя', ko: '닉네임 변경'},
      { en: 'Change username'},
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'editName',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'settings',
      en: 'Settings',
      ru: 'Настройки',
      ko: '설정'
    },
    words: [
      { en: 'go to settings', ru: 'идти в настройки', ko: '설정' },
      { en: 'show settings' }
    ],
    value: 'settings',
    intentions: taskIntention
  },
  {
    type: 'task',
    name: {
      general: 'setEmail',
      en: 'set email',
      ru: 'Установить адрес почты',
      ko: '이메일 설정',
    },
    words: [
      { en: 'set email', ru: 'Установить адрес почты', ko: '이메일 설정' },
      { en: 'update email', ru: 'Обновить адрес почты', ko: '이메일 업데이트'},
      { en: 'said email' },
    ],
    value: 'setEmail',
    intentions: taskIntention
  },
];

addEntities(gNavigation);
