import history from "/components/history/history.js";
import TaskClass from "/components/taskManager/Task.js";
export const Task = TaskClass;
const tasks = new Map();

function start(task) {
  tasks.set(task.name, task);
  history.appendMessage({type: 'separator', period: 'start', text: task.text });
  task.reset();
  task.setStage('started');
}

function cancel(task) {
  tasks.delete(task.name);
  history.appendMessage({type: 'separator', period: 'cancel', text: task.text });
  task.setStage('cancelled', null, false);
}

function end(task) {
  if (!tasks.has(task.name)) return false;
  tasks.delete(task.name);
  if (!task.failed) {
    history.appendMessage({type: 'separator', period: 'end', text: task.text });  
    task.setStage('completed', null, false);
  } else {
    history.appendMessage({type: 'separator', period: 'cancel', text: task.text });
    task.setStage('cancelled', null, false);
  }
  return true;
}

function cancelAllTasks() {
  for (const [_, task] of tasks)
    cancel(task);
}

function startExclusive(task) {
  cancelAllTasks();
  start(task);
}


export default {
  Task,
  tasks,
  startExclusive,
  start,
  end,
  cancel
}
