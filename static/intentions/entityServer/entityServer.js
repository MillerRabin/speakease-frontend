import { storage } from '/intentions/main.js';

const textEvent = 'recognition.text';
const entityEvent = 'recognition.entity';
const recognitionErrorEvent = 'recognition.error';

function createIntentions() {
  const entity = storage.createIntention({
    title: {
      en: 'Need structurized text',
      ru: 'Нужен структурированный текст',
      ko: '지갑을 생성하기 위해서는 구조화된 텍스트가 필요합니다'
    },
    input: 'Entities',
    output: 'Recognition',
    onData: async function (status, intention, value) {      
      if (status != 'data') return;
      dispatchEntity(value);
    }
  });
  
  storage.createIntention({
    title: {
        en: 'Get recognition results',
        ru: 'Принимаю результаты распознавания',
        ko: '인식 결과 수신'
    },
    input: 'Recognition',
    output: 'HTMLTextAreaElement',
    onData: async (status, intention, value) => {      
      if (status == 'error') {
        dispatchError(value);
        return;
      }        
      if (status != 'data') return;
      dispatchText(value);
      entity.accepted.send(value);
    }
  });
}

const eventTarget = new EventTarget();

function onText(callback) {
  eventTarget.addEventListener(textEvent, callback);
}

function onEntity(callback) {
  eventTarget.addEventListener(entityEvent, callback);
}

function onRecognitionError(callback) {
  eventTarget.addEventListener(recognitionErrorEvent, callback);
}

function offText(callback) {
  eventTarget.removeEventListener(textEvent, callback);
}

function offEntity(callback) {
  eventTarget.removeEventListener(textEvent, callback);
}

function offRecognitionError(callback) {
  eventTarget.removeEventListener(recognitionErrorEvent, callback);
}


function dispatchText(data) {
  const event = new Event(textEvent);
  event.data = data;
  eventTarget.dispatchEvent(event);
}

function dispatchEntity(data) {
  const event = new Event(entityEvent);
  event.data = data;
  eventTarget.dispatchEvent(event);
}

function dispatchError(data) {
  const event = new Event(recognitionErrorEvent);
  event.data = data;
  eventTarget.dispatchEvent(event);
}

createIntentions();

export default {
  on: {
    text: onText,
    entity: onEntity,
    recognitionError: onRecognitionError
  },
  off: {
    text: offText,
    entity: offEntity,
    recognitionError: offRecognitionError
  }
}