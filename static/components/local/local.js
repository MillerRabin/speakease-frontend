import speechR from '/intentions/intention-can-interact-with-user/main.js';
import fs from '/components/fs/fs.js';
import loader from '../loader/loader.js';

const langFile = 'local'
let currentLang = fs.load(langFile) ?? 'en';

const langs = {
  en: {
    voice: 'en-US',
    ui: 'en'
  },
  ru: {
    voice: 'ru-RU',
    ui: 'ru'
  },
  ko: {
    voice: 'ko-KR',
    ui: 'ko'
  }
}

const cLang = get();
speechR.recognition.language = cLang.voice;

function get () {
  return langs[currentLang];
}

function set (value) {
  const nLang = langs[value];
  if(nLang == null) throw new Error(`Unsupported language ${value}`);
  currentLang = value;
  speechR.recognition.language = nLang.voice;
  fs.save(langFile, value);
  window.location.reload();
}

function getText(str) {
  const lang = get();
  const text = str.text ?? str.data ?? str;
  const lText = text[lang.ui] || text['en'] || text;
  if (typeof(lText) == 'string') return lText;
  if (lText.message != null) return lText.message;
  const first = Object.values(lText)[0];
  return first;
}

function isLang(lang) {
  return (lang.length == 2);
}


export class LocalString{
  #data
  constructor(data) {
    this.#data = data;
  }

  #getLocaleFormat() {
    const ftype = typeof this.#data.format;
    if ((ftype == 'function') || (ftype == 'async function')) return this.#data.format;
    const cLang = get().ui;
    const lFormat = this.#data.format[cLang] || this.#data.format['en'];
    if (lFormat == null) throw new Error('wrong locale format');
    return lFormat;
  }

  set data(value) {
    this.#data = value;
  }

  get data() {
    return this.#data;
  }

  join(localString) {
    const res = {};
    const data = localString.data;
    for (const lang in data) {
      if (!isLang(lang)) { 
        res[lang] = this.#data[lang];
        continue;
      }
      if (this.#data[lang] == null) continue;
      res[lang] = `${this.#data[lang]} ${data[lang]}`;
    }
    return new LocalString(res);
  }

  format(text) {
    const ff = this.#data.format;
    if (ff == null) return this;
    const res = {};
    for (const lang in this.#data) {
      if (!isLang(lang)) { 
        res[lang] = this.#data[lang];
        continue;
      }
      const fmt = this.#getLocaleFormat();
      res[lang] = fmt(this.#data[lang], text);
    }
    return new LocalString(res);
  }

  getText() {
    const cLang = get().ui;
    return this.#data[cLang] || this.#data['en'];
  }
}

async function loadHTML(root, end) {
  const cLang = get();
  const url = `${root}/${cLang.ui}/${end}`;
  try {
    return await loader.loadHTML(url);
  } catch {
    const url = `${root}/en/${end}`;
    return await loader.loadHTML(url);
  }  
}



export default {
  LocalString,
  get,
  set,
  getText,
  loadHTML,
  langs
}
