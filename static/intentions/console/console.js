import { storage, createState } from '/intentions/main.js';
const { ready, setReady } = createState({ message: 'Entity service accepting time is out'});

storage.createIntention({
  title: {
    en: 'Need console',
    ru: 'Нужна консоль для вывода',
    ko: '출력하려면 콘솔이 필요합니다'
  },
  input: 'None',
  output: 'Console',
  onData: async function (status) {
    if (status == 'accepted')
      setReady(this);
  }
});

export async function log(data) {
  const int = await ready;
  return await int.accepted.send(data); 
}

export default {
  log
}
