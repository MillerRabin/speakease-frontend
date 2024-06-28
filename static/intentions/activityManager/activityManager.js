import router from "/components/router/router.js";

const activities = new Map();

export async function start(activity) {
  await ready;
  activities.set(activity.name, activity);
  await startInternal(activity);
  await intention.accepted.send(toArray(activities));
}

export async function stop(name) {
  await ready;
  const activity = get(name);
  await stopInternal(activity);
  await intention.accepted.send(toArray(activities));
}

async function startInternal(activity) {
  if (activity.status != 'stopped') return;
  await activity.start(); 
}

async function stopInternal(activity) {
  if (activity.status != 'started') return;  
  await activity.stop();
}

export function get(name) {  
  const act = activities.get(name);
  if (act == null) 
    throw new Error(`No activity with name ${name}`);
  return act;
}

export function has(name) {
  const act = activities.get(name);
  return act != null;
}

function checkPage(route, activity) {
  if (activity.exclude != null) {
    const fnd = activity.exclude.find(c => c == route.name);
    if (fnd != null) return false;
  }
  if (activity.only != null) {
    const onl = activity.only.find(c => c == route.name);
    if (onl == null) return false;
  }
  return true;
}

export async function check() {  
  //console.time('--all-activity-check');
  await ready;
  const cr = await router.current();
  const promises = [];
  for (const [, act] of activities) {
    if (!checkPage(cr, act)) {
      await stopInternal(act);
      continue;
    }        
    //const tname = `activity-${act.name}`;
    //console.time(tname);
    promises.push(act.check.apply(act).then(async (res)=> {
      if (res) 
        await startInternal(act);
      else
        await stopInternal(act);  
    }));        
  }
  await Promise.allSettled(promises);    
  
  await intention.accepted.send(toArray(activities));
  //console.timeEnd('--all-activity-check');  
}

export function activityStatus(name) {
  if (!name) return null;
  const act = activities.get(name);
  return act?.status ?? null;
}

function toArray() {
  const res = [];
  for (const [, value] of activities)
    res.push(value.toObject());
  return res;
}

let intention = null;
let setReady;
const ready = new Promise(r => setReady = r );

function init(storage) {
  intention = storage.createIntention({
    title: {
      en: 'Activity Manager',
        ru: 'Менеджер активностей',
        ko: '액티비티 매니저'
      },
      description: {
        ru: `Уведомляю об активностях`,
        en: `Notify about activities`,
        ko: `액티비티에 대한 알림`
      },
      input: 'None',
      output: 'ActivityInfo',
      onData: async function onData(status, intention) {
        if (status == 'accepted') {
          setReady();
          intention.send('data', this, toArray(activities));          
        }
          
      }
  });
}

export default {
  init,
  start,
  stop,
  check,
  has,
  activityStatus,
}
