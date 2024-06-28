import history from "/components/history/history.js";
import "/components/exchangeRates/components/exchangeRatesItem.js";
import "/components/preloader/preloader.js";
import speechDispatcher from "/components/speechDispatcher/speechDispatcher.js";
import taskManager from "/components/taskManager/taskManager.js";
const { Task } = taskManager;
import intentions from "/intentions/main.js";
import "/intentions/dateTypes/dateTypes.js";


const template = `<div class="container"></div>`;

class Filters extends HTMLElement {
  #date = null;
  #time = null;
  #from = null;
  #to = null;
  #currency = null;
  #amount = null;


  #filterTask = new Task({
    name: 'Filter receipt history',
    text: {
      en: 'Filter receipt history',
      ru: 'Фильтрация истории транзакций',
      ko: '거래내역 필터'
    }
  }, {
    started: async (task) => {
      task.setStage('filter', null, false);
    },
    'filter-To': async (_, value) => {
      if(!value) return;    
      const contact = intentions.getEntityByName(value, 'Contact');
      if(!contact) return;
        this.to = contact.value;
    },
    'filter-From': async (_, value) => {
      if(!value) return;
      const contact = intentions.getEntityByName(value, 'Contact');
      if(contact)
        this.from = contact?.value;
    },
    'filter-Currency': async (_, value) => {
      if(!value) return;
      this.currency = value.value.currency.toLowerCase();
    },
    'filter-FilterRequest': async (entity , value) => {
      if(!value) return;
      this.date = value.value;
    },
    'filter-Time': async (_, value) => {
      if(!value) return;
      this.time = value;
    },
    'filter-All': async (_, value) => {
      if(!value) return;
      this.date = null;
      this.time = null;
      this.from = null;
      this.to = null;
      this.currency = null;
      this.amount = null;
    },
  });


  #renderFilterItem() {
    this.components.container.innerHTML = '';
    const arr = [];
    if(this.#date != null)
      arr.push({name: 'date', value: `date: ${new Date(this.#date.from).toLocaleString()} - ${new Date(this.#date.to).toLocaleString()}`});
    
    if(this.#from != null)
      arr.push({name: 'from', value: `from: ${this.#from}`});
    
    if(this.#to != null)
      arr.push({name: 'to', value: `to: ${ this.#to }`});
    
    if(this.#currency != null)
      arr.push({name: 'currency', value: `currency: ${this.#currency}`});
    
    if(this.#amount != null)
      arr.push({name: 'amount', value: `amount: ${this.#amount}`});
    
    for(const item of arr) {
      const div = document.createElement('div');
      div.innerHTML = item.value;
      div.classList.add('item', `${item.name}`);
      this.components.container.appendChild(div);
    }
    this.#updateFilterStatus();
  }


  set date(value) {
    this.#date = value;
    this.#renderFilterItem();
  }

  get date() {
    return this.#date;
  }

  set amount(value) {
    this.#amount = value;
    this.#renderFilterItem();
  }

  get amount() {
    return this.#amount;
  }

  set currency(value) {
    this.#currency = value;
    this.#renderFilterItem();
  }

  get currency() {
    return this.#currency;
  }

  set time(value) {
    this.#time = value;
    this.#renderFilterItem();
  }

  get time() {
    return this.#time;
  }

  set from(value) {
    this.#from = value;
    this.#renderFilterItem();
  }

  get from() {
    return this.#from;
  }

  set to(value) {
    this.#to = value;
    this.#renderFilterItem();
  }

  get to() {
    return this.#to;
  }

  #updateTimer = null

  #updateFilterStatus() {
    const delay = 200;
    clearTimeout(this.#updateTimer);
    this.#updateTimer = setTimeout(() => {
      const event = new Event('changed');
      event.data = {
        from: this.#from || null,
        to: this.#to || null,
        currency: this.#currency,
        amount: this.#amount,
        date: this.#date,
        time: this.#time
      };
      this.dispatchEvent(event);
    }, delay); 
  }

  async connectedCallback() {
    history.setState('ui');
    this.innerHTML = template;
    this.components = {
      container: this.querySelector('.container'),

    };
    await speechDispatcher.attachTask(this.#filterTask);
    taskManager.startExclusive(this.#filterTask);
  }

  async disconnectedCallback() {
    speechDispatcher.detachTask(this.#filterTask);
    taskManager.end(this.#filterTask);
  }
}

customElements.define("speakease-filters", Filters);

