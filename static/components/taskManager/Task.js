import safe from "/components/safe/safe.js";
import errors from "/components/errors/errors.js";

export default class Task extends EventTarget{
  #stage = 'not-started';
  #stages;
  #name;
  #text;
  #failed = false;
  #pStarted = true;
  
  #checkTask(task) {
    safe.mustBeNonEmptyString(task.name);
  }
  
  constructor(header, stages) {
    super();
    this.#checkTask(header);
    this.#name = header.name;
    this.#text = header.text;
    this.#stages = stages;
  }

  #notifyStage(stage) {
    const event = new Event('changed');
    event.task = this;
    event.stage = stage;
    this.dispatchEvent(event);
  }

  get name() { return this.#name; }
  get text() { return this.#text; }
  
  get stage() { return this.#stage; }

  get stages() { return this.#stages; }
  get failed() { return this.#failed; }
  set failed(value) { this.#failed = value; }

  get started() { return this.stage != 'cancelled' && this.stage != 'completed' }

  async setStage(stage, args, existsCheck = true) {
    setTimeout(async () => {
      this.#stage = stage;
      await this.call(stage, args, existsCheck);
    }, 0)    
  }

  reset() {
    this.#pStarted = true;
  }

  async call(stage, args, existsCheck = true) {
    if (!this.#pStarted) return;
    const cs = this.stages[stage];    
    if (existsCheck && (cs == null)) throw new Error(`stage ${stage} is not defined`);    
    try {
      this.#notifyStage(stage);
      await cs?.(this, args);
      this.#pStarted = this.started;
    } catch (e) {
      this.#pStarted = false;
      this.#failed = true;
      console.error(e);      
      errors.gotoFeedback(e, this.name);
    }
    
  }
}