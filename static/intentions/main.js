import interact from '/intentions/intention-can-interact-with-user/main.js';
import structurize from '/intentions/canStructurize/main.js';
import basicTypes from '/intentions/basicTypes/main.js';
import auth from '/intentions/auth/main.js';
import typeTasks from '/intentions/intentionTypeTasks/main.js';
import IS from '/node_modules/intention-storage/main.js';
import query from '/node_modules/intention-can-query-entities/main.js';
import TaskList from '/node_modules/intention-can-manage-tasks/main.js';
import activityManager from '/intentions/activityManager/activityManager.js';
import config from '../config.js';

function init(intentionStorage) { 
  setTimeout(() => {
    const link = storage.addStorage({ origin: config.node.origin, port: config.node.port, useWebRTC: false, useSocket: true });
    link.waitConnection(120000); 
    query.init(intentionStorage);
    const gTasks = new TaskList({ storage: intentionStorage });
    gTasks.statsInterval = 2000;  
    interact.init(intentionStorage);
    structurize.init(intentionStorage);
    basicTypes.init(intentionStorage);  
    typeTasks.init(intentionStorage); 
    auth.init(intentionStorage);  
    activityManager.init(intentionStorage);  
  });
}

export function getParameterByName(entities, name) {    
  if (entities == null) return null;
  const lName = name.toLowerCase();
  return entities.find(e => e.name.toLowerCase() == lName);  
}

export function getEntityByName(entities, name) {    
  if (entities == null) return null;
  const lName = name.toLowerCase();
  for (const e of entities) {
    if (e.name?.general?.toLowerCase() == lName) return e;
    if (!e.data) continue;
    for (const d of e.data) {
      if (d.name?.general?.toLowerCase() == lName) return d;
    }
  }
  return null;  
}

export const storage = new IS.IntentionStorage();
export const generateUUID = IS.generateUUID;
export const IntentionInterface = IS.IntentionInterface;
export const createState = IS.createState;

storage.lifeTime = 20000;
storage.requestLifeTime = 20000;
storage.dispatchInterval = 500;

init(storage);

export default {
  generateUUID: IS.generateUUID,
  createState: IS.createState,
  IntentionInterface,
  storage,
  getParameterByName,
  getEntityByName
}
