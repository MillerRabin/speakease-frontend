
import { LocalString } from "/components/local/local.js";
import { log } from "/intentions/console/console.js";
import taskManager, { Task } from "/components/taskManager/taskManager.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import speechR from '/intentions/intention-can-interact-with-user/main.js';
import voiceRecorder from '/components/voiceRecorder/voiceRecorder.js';

const localData = {
  attentionBeforeRecord: new LocalString({
    en: `
      <p><b>Setup voice authentication</b></p>
      <p>Please read the text below to record your voice sample. Voice record is stopped when you stop speaking</p>`,
    ru: `
      <p><b>Установка голосовой авторизации</b></p>
      <p>Пожалуйста, прочтите текст ниже. Запись голоса остановится, как только вы перестанете говорить`,
    ko: `
      <p><b>음성 샘플 녹음 방법</b></p>
      <p>음성 샘플을 녹음하기 위하여 아래의 텍스트를 읽어주십시오.  텍스트를 읽으시는 도중에 "그만"이라고 말씀하시면 녹음이 중단됩니다</p>`,
  }),
  audioSampleText: new LocalString({
    en: ` 
          Roses are red, violets are blue,
          Sugar is sweet, and so are you!

          Believe in yourself and all you can do,
          Today is a new day, make it count for you!`,
    ru: ` 
          Жизнь никогда не может сесть на мель,
          Печальный рок вообще немыслим.
          Случайность каждая свою имеет цель,
          А случай – свой имеет смысл.
        `,
    ko: ` 
          푸른 산과 청명한 하늘,
          바람소리 불어오며,
          자유롭게 날아가는 새들처럼,
          너도 자유롭게 살아가길 바래
        `,
  }),
  confirmAudioSample: new LocalString({
    en: `
      <span>Do you confirm the recording?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Voice data request" stage="setSampleDone?" postfix="Yes">Yes</button>
        <button is="speakease-taskbutton" class="no" task="Voice data request" stage="setSampleDone?" postfix="No">no</button>
      </div>
    `,
    ru: `
      <span>Вы подтверждаете запись?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Voice data request" stage="setSampleDone?" postfix="Yes">Да</button>
        <button is="speakease-taskbutton" class="no" task="Voice data request" stage="setSampleDone?" postfix="No">Нет</button>
      </div>
    `,
    ko: `
      <span>음성 샘플을 저장하시겠습니까?</span>
      <div class="taskbutton-container">
        <button is="speakease-taskbutton" class="yes" task="Voice data request" stage="setSampleDone?" postfix="Yes">예</button>
        <button is="speakease-taskbutton" class="no" task="Voice data request" stage="setSampleDone?" postfix="No">아니요</button>
      </div>
    `,
  }),
  successVoiceSample: new LocalString({
    en: `Your voice sample has been saved`,
    ru: `Ваш сэмпл голоса был сохранен`,
    ko: `음성 샘플이 저장되었습니다`,
  }),
}

function createState() {
  let resolver = null;
  let rejecter = null;
  const state = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  return {
    promise: state,
    resolve: resolver,
    reject: rejecter
  }
}

class VoiceDataRequestTask {  
  #state;
  #record = voiceRecorder.get();
  #voiceRecord;

  #recordHandler = (e) => {
    this.#voiceRecord = e.detail;
    log({ type: 'audio', data: this.#voiceRecord });
    log(localData.confirmAudioSample.data);
    speechR.start();
    this.#requestVoiceData.setStage('setSampleDone?', null, false);
  }
  
  #requestVoiceData = new Task({
    name: 'Voice data request',
    text: {
      en: 'Voice data request',
      ru: 'Запрос голосовых данных',
      ko: '음성 데이터 요청'
    }
  }, {
    started: async (task) => {
      await log(localData.attentionBeforeRecord.data);
      task.setStage('setSample?');
    },
    'setSample?': async () => {
      const audioText = localData.audioSampleText;
      audioText.data.status = 'important';
      log(audioText.data);
      await speechR.stop();
      this.#record.start();
    },
    'setSampleDone?-Yes': async (task) => {
      log(localData.successVoiceSample.data);
      taskManager.end(task);
    },
    'setSampleDone?-No': (task) => {
      task.setStage('setSample?');
    },
    'completed': async () => {
      this.#state.resolve(this.#voiceRecord);
    },
    'cancelled': async (_, value) => {
      this.#state.reject(value);
    }
  });

  async request() {
    try {
      this.#voiceRecord = null;
      await speechDispatcher.attachTask(this.#requestVoiceData)
      this.#record.addEventListener('speakend', this.#recordHandler); 
      taskManager.start(this.#requestVoiceData);
      this.#state = createState();
      return await this.#state.promise;
    } finally {
      this.#record.removeEventListener('speakend', this.#recordHandler);
      speechDispatcher.detachTask(this.#requestVoiceData);
    }    
  }   
}

const task = new VoiceDataRequestTask();
export default task;
