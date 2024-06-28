import system from "/components/system/system.js";


const template = `
  <div class="container">
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
    <div class='dot'></div>
  </div>`;

class SoundVisualizator extends HTMLElement {
      #timerId;
      #dispatching;
      #height = '0.3rem';

   set dispatching(value) {
      this.#dispatching = value;
      if(this.#dispatching) {
        clearInterval(this.#timerId);
        this.#timerId = setInterval(() => this.#draw(), 300);
      } else {
        clearInterval(this.#timerId);
        this.#draw(true)
      }
    }
        
   get dispatching() { return this.#dispatching; }

  #animate(dot, restart) {
      const rNum = Math.random() * (20 - (-20)) + 20; 
      dot.style.height = restart ? this.#height :`${rNum}px`;
  }

  #draw(restart = false) {
      const dots = this.components.dots;
      for(const dot of dots) {
        this.#animate(dot, restart);
      }
  }

  #dispatchingHandler = (event) => {
     this.dispatching = event.data.dispatching;
  }

  async connectedCallback() {
    this.innerHTML = template;
    this.components = {
      container: this.querySelector('.container'),
      dots: this.querySelectorAll('.dot'),
    };
    system.on.focused(this.#dispatchingHandler);
  }

  async disconnectedCallback() {
    system.off.focused(this.#dispatchingHandler);
  }
}

customElements.define("speakease-soundvisualizator", SoundVisualizator);