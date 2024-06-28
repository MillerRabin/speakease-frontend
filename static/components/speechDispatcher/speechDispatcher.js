import entityServer from "/intentions/entityServer/entityServer.js";
import  { getDates } from "/intentions/dateTypes/dateTypes.js";


function update(methods, entity, postfix, value = entity) {
  const key = `${entity.key}-${postfix}`;
  const cItem = methods.get(key);
  if (cItem == null) {
    return methods.set(key, { postfix, value });
  }
  const values = cItem.value;
  if (values == null)
    return cItem.value = value;
  if (Array.isArray(values))
    values.push(value);
}


function dispatchYes(methods, entity) {
  if (entity.name.general != 'YesRequest') return;
  methods.set(`${entity.key}-Yes`, { postfix: 'Yes' });
}

function dispatchNo(methods, entity) {
  if (entity.name.general != 'NoRequest') return;
  methods.set(`${entity.key}-No`, { postfix: 'No' });
}

function dispatchCancel(methods, entity) {
  if (entity.name.general != 'CancelRequest') return;
  methods.set(`${entity.key}-Cancel`, { postfix: 'Cancel' });
}

function dispatchImport(methods, entity) {
  if (entity.name.general != 'ImportRequest') return;
  methods.set(`${entity.key}-Import`, { postfix: 'Import' });
}

function dispatchApprove(methods, entity) {
  if (entity.name.general != 'ApproveRequest') return;
  methods.set(`${entity.key}-Approve`, { postfix: 'Approve' });
}

function dispatchGenerate(methods, entity) {
  if (entity.name.general != 'GenerateRequest') return;
  methods.set(`${entity.key}-Generate`, { postfix: 'Generate' });
}

function dispatchCurrency(methods, entity) {
  if (entity.name.general != 'Currency') return;
  update(methods, entity, 'Currency');  
}

function dispatchFiat(methods, entity, entities) {
  if (entity.name.general != 'Fiat') return;
  update(methods, entity, 'Fiat', entities);
}

function dispatchContact(methods, entity, entities) {
  if (entity.name.general != 'Contact') return;
  update(methods, entity, 'Contact', entities);
}

function dispatchAmount(methods, entity) {
  if (entity.name.general != 'Amount') return;
  update(methods, entity, 'Amount');  
}

function dispatchPassword(methods, entity, words) {
  if (entity.name.general != 'PasswordRequest') return;
  update(methods, entity, 'PasswordRequest', words);  
}

function dispatchCopy(methods, entity, entities) {
  if (entity.name.general != 'CopyRequest') return;
  update(methods, entity, 'Copy', entities);  
}

function dispatchAdd(methods, entity) {
  if (entity.name.general != 'AddRequest') return;  
  methods.set(`${entity.key}-Add`, { postfix: 'Add' });  
}

function dispatchDelete(methods, entity) {
  if (entity.name.general != 'DeleteRequest') return;
  methods.set(`${entity.key}-Delete`, { postfix: 'Delete' });  
}

function dispatchRename(methods, entity, entities) {
  if (entity.name.general != 'RenameRequest') return;
  update(methods, entity, 'Rename', entities);
}

function dispatchView(methods, entity, entities) {
  if (entity.name.general != 'ViewRequest') return;
  update(methods, entity, 'View', entities);
}

function dispatchSend(methods, entity, entities) {
  if (entity.name.general != 'SendRequest') return;
  update(methods, entity, 'Send', entities);
}

function dispatchTo(methods, entity, entities) {
  if (entity.name.general != 'ToRequest') return;
  update(methods, entity, 'To', entities);
}

function dispatchFrom(methods, entity, entities) {
  if (entity.name.general != 'FromRequest') return;
  update(methods, entity, 'From', entities);
}

function dispatchDate(methods, entity, entities) {
  if (entity.name.general != 'DateRequest') return;
  update(methods, entity, 'Date', entities);  
}

function dispatchTime(methods, entity, entities) {
  if (entity.name.general != 'TimeRequest') return;
  update(methods, entity, 'Time', entities);
}

function dispatchAll(methods, entity, entities) {
  if (entity.name.general != 'AllRequest') return;
  update(methods, entity, 'All', entities);  
}

function dispatchBuy(methods, entity, entities) {
  if (entity.name.general != 'BuyRequest') return;
  update(methods, entity, 'Buy', entities);  
}

function dispatchProvider(methods, entity, entities) {
  if (entity.name.general != 'Provider') return;
  update(methods, entity, 'Provider', entities);  
}

function dispatchBack(methods, entity) {
  if (entity.name.general != 'BackRequest') return;
  methods.set(`${entity.key}-Back`, { postfix: 'Back' });  
}

function dispatchBlockchain(methods, entity) {
  if (entity.name.general != 'Blockchain') return;
  update(methods, entity, 'Blockchain', entity);  
}

function dispatchFilterRequest(methods, entity, entities) {
  if (entity.name.general != 'FilterRequest') return;
  const dps = entities.find( item => item.name.general === 'DatePeriod');
  const amount = entities.find( item => item.name.general === 'Amount');
  const values = getDates({
    filter: entity.value,
    datePeriod: dps?.value ?? null,
    amount: amount?.value ?? null,
  });
  entity.value = values;
  update(methods, entity, 'FilterRequest');
}

async function entityHandler(event) {
  return await dispatchData(event.data);
}

async function textHandler(event) {
  return await callTasks({ text: event.data.text, source: event.data.source }, { postfix: 'Text' });
}


function createIntentions() {
  entityServer.on.text(textHandler);
  entityServer.on.entity(entityHandler);
}

function throwInvalidStage(stage) {
  throw new Error(`Invalid stage ${stage}`);
}

async function callTasks(value, stage) {
  const tasks = Object.values(gTasks);
  const res = await Promise.allSettled(tasks.map(task => task.call(
      stage.postfix ? `${task.stage}-${stage.postfix}` :
      stage.stage ? stage.stage :
      throwInvalidStage(stage),
    value, false).catch(e => {
      throw { task, cause: e };
    })
  ));
  const errors = res.filter(r => r.status == 'rejected');
  if (errors.length > 0) {
    errors.forEach(e => console.error(e.reason.cause));
    errors.gotoFeedback( errors[0].e.reason.cause, errors[0].task.name );
  }
}

async function dispatchData(data) {
  try {
    const results = Array.from(data.reduce((methods, item) => {
      const entities = item.data;
      return entities.reduce((methods, entity) => {
        dispatchYes(methods, entity);
        dispatchNo(methods, entity);
        dispatchImport(methods, entity);
        dispatchGenerate(methods, entity);
        dispatchApprove(methods, entity);
        dispatchCancel(methods, entity);
        dispatchCurrency(methods, entity);
        dispatchBlockchain(methods, entity);
        dispatchFiat(methods, entity, entities);
        dispatchContact(methods, entity);
        dispatchAmount(methods, entity);
        dispatchPassword(methods, entity, item.words);
        dispatchCopy(methods, entity, entities);
        dispatchAdd(methods, entity, entities);
        dispatchDelete(methods, entity, entities);
        dispatchRename(methods, entity, entities);
        dispatchView(methods, entity, entities);
        dispatchSend(methods, entity, entities);
        dispatchTo(methods, entity, entities);
        dispatchFrom(methods, entity, entities);
        dispatchDate(methods, entity, entities);
        dispatchTime(methods, entity, entities);
        dispatchAll(methods, entity, entities);
        dispatchBuy(methods, entity, entities);
        dispatchProvider(methods, entity, entities);
        dispatchBack(methods, entity, entities);
        dispatchFilterRequest(methods, entity, data.flatMap( i => i.data));
        return methods;
      }, methods);
    }, new Map()));
    await Promise.all(results.map(([, r]) => callTasks(r.value, r)));
  } catch (e) {
    console.log(e);
  }
}

const gTasks = {};

createIntentions();

export async function attachTask(task) {  
  gTasks[task.name] = task;  
}

export function detachTask(task) {
  delete gTasks[task.name];
}

export default {
  attachTask,
  detachTask
}
