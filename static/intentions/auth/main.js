const authIntention = [{
  title: 'Auth user',
  input: 'AuthResult',
  output: 'None'
}];

const gAuth = [
  {
      type: 'task',
      name: {
          general: 'Login',
          en: 'Login',
          ru: 'Войти',
          ko: '로그인'
      },
      words: [
        { en: 'sign in me', ru: 'Авторизуй меня', ko: '로그인 시켜 줘'},
        { en: 'sign in mean'},
        { en: 'send in mean'}
    ],
      value: 'login',
      intentions: authIntention
  },
  {
      type: 'task',
      name: {
          general: 'Logout',
          en: 'Logout',
          ru: 'Выйти из системы',
      },
      words: {
          en: 'log out me',
          ru: 'выйти из системы',
      },
      value: 'logout',
      intentions: authIntention
  },
  {
    type: 'task',
    name: {
        general: 'Logout',
        en: 'Logout',
        ru: 'Выйти из системы',
    },
    words: {
        en: 'lookout',
        ru: 'выйти из системы',
    },
    value: 'logout',
    intentions: authIntention
}
];

function init(intentionStorage) {
  intentionStorage.createIntention({
      title: {
          en: 'Types and intentions for voice login',
          ru: 'Типы и Намерения для голосовой авторизации',
          ko: '음성 로그인을 위한 타입과 인텐션'
      },
      description: {
          ru: `<h2>Поддерживаемые команды</h2>
          <ul>
              <li>Авторизуй меня</li>
              <li>Выйти из системы</li>
          </ul>`,
          en: `<h2>Supported commands</h2>
          <ul>
              <li>Login me</li>
              <li>Logout me</li>
          </ul>`,
          ko: `<h2>지원되는 명령어</h2>
          <ul>
              <li>로그인</li>
              <li>로그아웃</li>
          </ul>`
      },
      input: 'None',
      output: 'EntitiesInfo',
      onData: async function onData(status, intention) {
          if (status == 'accepted')
              intention.send('data', this, gAuth);
      }
  });
}

export default {
  init
}
