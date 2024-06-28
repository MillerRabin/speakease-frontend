class Preloader extends HTMLElement {
  #refresh() {
    this.innerHTML = `
       <div>
        <img src="/components/preloader/images/5.svg">
        </div> 
     `;
  }

  async connectedCallback() {
    this.#refresh();
  }
}

customElements.define("speakease-preloader", Preloader);
