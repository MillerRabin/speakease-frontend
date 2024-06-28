import safe from "/components/safe/safe.js";

export default class Activity {
  #status = 'stopped';
  #name;
  #text;
  #owner;
  #link;
  #stages;
  #order;
  #type;
  #description;
  #top;
  #exclude;
  #only;
  #notVisibleAt = [];

  #check(activity, stages) {
    safe.mustBeNonEmptyString(activity.name);
    safe.mustBeFunction(stages.check);
  }

  constructor(header, stages) {
    this.#check(header, stages);
    this.#name = header.name;
    this.#text = header.text;
    this.#stages = stages;
    this.#link = header.link;
    this.#order = header.order ?? 10;
    this.#type = header.type;
    this.#top = header.top;
    this.#description = header.description;
    this.#exclude = header.exclude;
    this.#only = header.only;
    this.#notVisibleAt = header.notVisibleAt ?? [];
  }

  get name() { return this.#name; }
  get text() { return this.#text; }
  set text(value) { this.#text  = value }
  get status() { return this.#status; }
  get owner() { return this.#owner; }
  get link() { return this.#link; }
  get order() { return this.#order; }
  get type() { return this.#type; }
  get description() { return this.#description; }
  get top() { return this.#top; }
  get exclude() { return this.#exclude; }
  get only() { return this.#only; }
  get notVisibleAt() { return this.#notVisibleAt; }

  toObject() {
    return  {
      name: this.name,
      text: this.text,
      link: this.link,
      type: this.type,
      description: this.description,
      status: this.#status,
      order: this.#order,
      top: this.#top,
      exclude: this.exclude,
      include: this.include,
      notVisibleAt: this.notVisibleAt
    }
  }

  async check() {
    try {
      return await this.#stages.check.apply(this);
    } catch (e) {
      return false;
    }
  }

  async start() {
    await this.#stages?.started?.apply(this, [this]);
    this.#status = 'started';
  }

  async stop() {
    await this.#stages?.stopped?.apply(this, [this]);
    this.#status = 'stopped';
  }
}
