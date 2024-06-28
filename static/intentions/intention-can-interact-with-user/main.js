import '/config.js';
import speechFree from './speechWeb.js';
//import speechPay from './speech.js';

//const speech = (config.usePaidRecognizer) ? speechPay : speechFree;
const speech = speechFree;

import keyboard from './keyboard.js';

let typeInterval = null;
const typeTimeout = 1000;

const gParamHash = {};

function getAnswer(params) {
  params.alternatives = (params.alternatives == null) ? [] : params.alternatives;
  params.text = (params.text == null) ? '' : params.text;
  return params;
}

function formatSpeechAnswer({ time, results }) {
  const hr = results[0];
  const text = hr.transcript.trim();
  const alt = [];
  for (let i = 1; i < results.length; i++) {
    alt.push({
      confidence: results[i].confidence,
      transcript: results[i].transcript
    });
  }

  return getAnswer({
    alternatives: alt,
    confidence: hr.confidence,
    text,
    time: time,
    source: 'voice'
  });
}

function pauseSpeech() {
  speech.enabled = false;
  if (typeInterval != null) clearInterval(typeInterval);
  typeInterval = setTimeout(() => {
    speech.enabled = true;
  }, typeTimeout);
}

function onKeyboardData(event) {
  const answer = getAnswer({ text: event.value, time: new Date(), source: 'keyboard' });
  gIntention.accepted.send(answer);
}

function onSpeechData(event) {
  const answer = formatSpeechAnswer({ results: event.results, time: new Date() });
  console.log(answer.text);
  if (answer.text == '') {
    gIntention.accepted.send({ message: 'Text is not recognized', code: 'TEXT_NOT_RECOGNIZED' }, 'error');
    return;
  }
  try {
    window.speakease?.foreground();
  } catch (e) {
    console.log(e.message);
  }
  gIntention.accepted.send(answer);
}

function start(lang, input) {
  if (input != null) {
    stop(input);
    input.addEventListener('keydown', pauseSpeech);
    input.addEventListener('data', onKeyboardData);
    keyboard.enable(input);
  }

  if (lang != null)
    speech.language = lang;

  if (!window.speakease?.disabledWebRecognizer?.()) {
    speech.addEventListener('data', onSpeechData);
    speech.enabled = true;
  }
}

function stop(input) {
  if (input != null) {
    input.removeEventListener('keydown', pauseSpeech);
    input.removeEventListener('data', onKeyboardData);
    speech.removeEventListener('data', onSpeechData);
    keyboard.disable(input);
  }
  speech.enabled = false;
}

let gIntention = null;

function init(intentionStorage) {
  gIntention = intentionStorage.createIntention({
    title: {
      en: 'Can receive raw user input from microphone or keyboard',
      ru: 'Забираю пользовательский ввод с микрофона или клавиатуры',
      ko: '마이크와 키보드로부터 유저 입력을 수신 가능'
    },
    input: 'HTMLTextAreaElement',
    output: 'Recognition',
    onData: async function (status, intention) {
      if (status == 'accepted') {
        const parameters = intention.parameters;
        const input = parameters[1];
        if (input != null)
          gParamHash[intention.id] = input;
        start(null, input);
        return;
      }
      if (status == 'close') {
        delete gParamHash[intention.id];
      }
    }
  });
}


export default {
  init,
  start,
  stop,
  recognition: speech,
}