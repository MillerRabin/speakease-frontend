import loader from "/components/loader/loader.js";
import { storage } from "/intentions/main.js"

const { ready: entityReady, setReady: setEntityReady } = loader.createPromiseState({ message: 'Entity service accepting time is out'});

const eInt = storage.createIntention({
  title: {
    en: 'Broadcast Device name for Speakease',
    ru: 'Транслирую имя устройства',
    ko: '브로드캐스트 장치 이름'
  },
  description: {
    en: `<h2>Broadcast Device name for Speakease</h2>`,
    ru: `<h2>Транслирую имя устройства для Speakease</h2>`,
    ko: `<h2>Speakease의 브로드캐스트 장치 이름</h2>`
  },
  input: 'None',
  output: 'EntitiesInfo',
  onData: async function onData(status) {
    if (status == 'accepted')
    setEntityReady();    
  }
});

export async function addEntities(entities) {
  await entityReady;
  eInt.accepted.send(entities);
}

export default {
  addEntities
}