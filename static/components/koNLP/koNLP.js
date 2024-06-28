import postposition from '../../node_modules/cox-postposition/index.js'

export function addSubjectParticle(word) {
  return postposition.put(word, '이');
}

export function addObjectParticle(word) {
  return postposition.put(word, '을');
}

export function addDirectionParticle(word) {
  return postposition.put(word, '으로');
}

export function addTopicMarker(word) {
  return postposition.put(word, '은');
}

export default { addSubjectParticle, addObjectParticle, addDirectionParticle, addTopicMarker};