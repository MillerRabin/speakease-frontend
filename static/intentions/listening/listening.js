import { addEntities } from "/intentions/entities/entities.js";

const taskIntention = [{
  title: 'listening mode control',
  input: 'ListeningResult',
  output: 'None'
}];

const gListening = [
  {
    type: 'task',
    name: {
      general: 'listen me',
      en: 'listen me',
      ru: 'Слушай меня',
      ko: '내 말 듣기'
    },
    words: [
      { en: 'listen me', ru: 'слушай меня', ko: '듣기 시작' },
      { en: 'focus', ru: 'фокус', ko: '포커스' },
      { en: 'keep attention', ru: 'слушай внимательно' },
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'startListening',
    intentions: taskIntention
  }, {
    type: 'task',
    name: {
      general: 'relax',
      en: 'relax',
      ru: 'расслабься',
      ko: '포커스 해제'
    },
    words: [
      { en: 'stop listening', ru: 'свободен', ko: '듣기 중지' },
      { en: 'relax', ru: 'расслабься', ko: '포커스 해제' }
    ],
    parameters: [{
      general: 'Name',
      immediate: false,
      value: null
    }],
    value: 'stopListening',
    intentions: taskIntention
  }
];



addEntities(gListening);
