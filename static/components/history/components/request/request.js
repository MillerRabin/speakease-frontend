import local from '/components/local/local.js';

class Request extends HTMLElement {
  #data = null;
  #refresh() {
    const text = local.getText(this.#data);
    this.innerHTML = `
       <div class="text">
        <span></span>
        ${
          this.#data.confidence != null ? 
          `<div class="confidence">confidence: ${this.#data.confidence}</div>` : ''
        }
        ${
          this.#data.alternatives?.length > 0 ? 
          `<div class="alternatives">
              <label>  
                <input type="checkbox"/>
                <span>Alternatives</span>
              </label>
              <div class="cont">
                ${this.#data.alternatives.map(a => `
                  <span>${a.transcript}</span>
                  <span class="a-confidence">confidence: ${a.confidence}</span>
                `).join('')}
            </div>
          </div>` : ''
        }
       </div>
       <div class="corner"></div>
       <div class="end-icon">
        <img src="/components/history/components/images/avatar_icon.png">
       </div>
     `;
    this.querySelector(".text > span").innerHTML = text;
    const aCont = this.querySelector('.alternatives .cont');
    const aCheck = this.querySelector('.alternatives input');
    if (aCheck == null) return;
    aCheck.onchange = () => {
      if (aCheck.checked)
        aCont.classList.add('open')
      else
        aCont.classList.remove('open')
    };
  }

  set data(value) {
    this.#data = value;
    this.#refresh();
  }

  get data() { return this.#data; }

  async connectedCallback() {
    this.#refresh();
  }
}

customElements.define("speakease-request", Request);
