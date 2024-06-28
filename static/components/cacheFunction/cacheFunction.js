export default class CacheFunction {
  #func;
  #ttl = 1000;
  #lastCall;
  #isCallSuccess = true;
  #lastError;  
  #value;

  constructor(func, ttl) {
    this.#func = func;
    this.#ttl = ttl ? ttl : this.#ttl;
  }

  call() {
    const current = performance.now();
    const diff = current - this.#lastCall;
    if (!isNaN(diff) && (diff < this.#ttl)) {
      if (!this.#isCallSuccess) throw this.#lastError;
      return this.#value;
    }      
    try {
      this.#value = this.#func.call(null, ...arguments);
      this.#lastError = undefined;
      this.#isCallSuccess = true;
      this.#lastCall = performance.now();
      return this.#value;
    } catch (e) {      
      this.#lastError = e;
      this.#isCallSuccess = false;
      this.#lastCall = performance.now();
      throw e;
    }    
  }

  clear() {
    this.#lastCall = undefined;
  }
}