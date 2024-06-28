import rec from './recognition.js';


function dispatchSpeechResult(event) {    
  const results = event.detail;
  const dataEvent = new Event('data');
  const firstResult = results[0];
  if (firstResult == null) return;
  dataEvent.results = firstResult.alternatives;
  event.currentTarget.dispatchEvent(dataEvent);
}

const recognition = rec.get('en-US');
recognition.addEventListener('result', dispatchSpeechResult);

export default recognition;