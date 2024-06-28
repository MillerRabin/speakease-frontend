import taskManager from "/components/taskManager/taskManager.js";

class TaskButton extends HTMLButtonElement {
  #taskName;
  #stage;
  #postfix;
  #task;
  #nextStage;
  
  constructor() {
    super();
    this.onclick = () => {            
      this.#task.setStage(this.#nextStage);
    }
  }

  set choosen(value) {
    if (value)
      this.classList.add('choosen');
    else
      this.classList.remove('choosen');
  }

  get choosen() {
    return this.classList.contains('choosen');
  }

  static get observedAttributes() {
    return ['task', 'stage', 'postfix'];
  }

  #taskHandler = (ev) => {
    const task = ev.task;
    const stage = ev.stage;
    this.disabled = this.#stage != task.stage;
    if (stage == this.#nextStage)
      this.choosen = true;
  }

  #attachTask() {
    if (this.#task == null) return;
    this.#detachTask();
    this.#task.addEventListener('changed', this.#taskHandler);
  }

  #detachTask() {
    if (this.#task == null) return;
    this.#task.removeEventListener('changed', this.#taskHandler);
  }

  connectedCallback() {
    this.#task = taskManager.tasks.get(this.#taskName);
    this.#nextStage = `${this.#stage}-${this.#postfix}`;
    this.#attachTask();
  }

  disconnectedCallback() {
    this.#detachTask(this.#task);
  }

  attributeChangedCallback(name, _, newValue) {    
    switch (name) {
      case 'task': 
        this.#taskName = newValue;
        break;
      case 'stage': 
        this.#stage = newValue;
        break;
      case 'postfix':
        this.#postfix = newValue;
        break;
    }    
  }
}

customElements.define("speakease-taskbutton", TaskButton, { extends: 'button'});
