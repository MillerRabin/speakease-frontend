const readdir = require('recursive-readdir');
const path = require('path');
const fs = require("fs").promises;
const cheerio = require('cheerio');
const uglifycss = require('uglifycss');

function htmlOnly(file, stats) {  
  const ext = path.extname(file);
  return !stats.isDirectory() && ext != '.html';
}

function cssOnly(isDesktop) {  
  return (file, stats) => {    
    const ext = path.extname(file);  
    if (stats.isDirectory()) return false;
    if (ext != '.css') return true;
    const pt = path.dirname(file);    
    if (pt.includes('node_modules')) 
      return true;
    const bn = path.basename(file);
    const cm = bn.indexOf('-desktop') != -1
    if (isDesktop) return !cm;
    return cm;
  };
}

async function loadTemplate(config, templateName) {
  const file = path.join(config.settings.templates, templateName);
  const html = await fs.readFile(file, 'utf-8');
  return cheerio.load(html, null, true);  
}

function setComponentBodyClass(template, bodyClass) {  
  const body = template('body');
  body.attr('class', bodyClass);
}

function setRouterComponent(template, component) {
  const router = template('#Router');
  router.html(component.html());
}

function setStyles(template, styles) {
  const head = template('head');
  head.append(styles.mobile.join('\n'));
  head.append(styles.desktop.join('\n'));
}


async function renderFile(config, file, styles) {
  const html = await fs.readFile(file, 'utf-8');
  const component = cheerio.load(html, null, false);
  const root = component('*:not(* *)');
  //const basename = path.basename(file);
  const output = root.attr('data-output');
  if (output == null) return;
  const outputNames = output.split(/,\s/);
  const templateName = root.attr('data-template') ?? 'index.html';      
  const template = await loadTemplate(config, templateName);  
  setRouterComponent(template, component);
  setStyles(template, styles);
  for (const output of outputNames) {
    const fn = path.parse(output);
    setComponentBodyClass(template, `${fn.name}-page`);
    await fs.writeFile(path.join(config.settings.root, output), template.html());
  }    
}

async function getPagesList(config) {
  const found = await readdir(config.settings.pages, [htmlOnly]);
  const styles = await getStyles(config);  
  for (const file of found) {
    await renderFile(config, file, styles );
  }
}

function getTimestamp() {
  const dt = new Date();
  const year = dt.getUTCFullYear();
  const month = dt.getUTCMonth() + 1;
  const day = dt.getUTCDate();
  const hours = dt.getUTCHours();
  const minutes = dt.getUTCMinutes();
  const seconds = dt.getUTCSeconds();
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

async function getStyles(config) {
  function relative(filename) {
    const rel = path.relative(config.settings.root, filename);
    return `/${rel}`;
  }

  async function clear() {
    const files = await fs.readdir(config.settings.mininfyCSSPath);          
    for (const file of files) {
      await fs.unlink(path.join(config.settings.mininfyCSSPath, file));
    };
  }

  await fs.mkdir(config.settings.mininfyCSSPath, {recursive: true});
  await clear();
  const mobileFiles = await readdir(config.settings.root, [cssOnly(false)]);
  const desktopFiles = await readdir(config.settings.root, [cssOnly(true)]);
  
  if (!config.settings.minifyCSS) {
    const mobile = mobileFiles.map(d => `<link href="${relative(d)}" rel="stylesheet" />`);
    const desktop = desktopFiles.map(d => `<link href="${relative(d)}" rel="stylesheet" media="all and (orientation: landscape)" />`);
    return { mobile, desktop };
  }
  const uMobile = uglifycss.processFiles(mobileFiles, { expandVars: true });  
  const uDesktop = uglifycss.processFiles(desktopFiles, { expandVars: true });  
  const timestamp = getTimestamp();
  const mFile = path.join(config.settings.mininfyCSSPath, `styles-${timestamp}.css`);
  const dFile = path.join(config.settings.mininfyCSSPath, `styles.${timestamp}.desktop.css`);  
  await fs.writeFile(dFile, uDesktop);
  await fs.writeFile(mFile, uMobile);
  return { 
    mobile: [`<link href="${relative(mFile)}" rel="stylesheet" />`],
    desktop: [`<link href="${relative(dFile)}" rel="stylesheet" media="all and (orientation: landscape)" />`]
  };
}

exports.start = async (config) => {
  await getPagesList(config); 
}