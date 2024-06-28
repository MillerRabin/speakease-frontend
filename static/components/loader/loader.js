const requestMaxTry = 5;

async function mountURL(mountPoint, url) {
  mountPoint.innerHTML = await loadHTML(url);
}

async function loadHTML(url) {
  const res = await fetch(url);
  if (res.ok)
    return await res.text();
  throw new Error('Not found');
}

async function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout)
  });
}

function createPromiseState({
  message = 'Time is out' , 
  rejectTimeout = 120000
}) {  
  let setReady;
  let timeout;
  const ready = new Promise((resolve, reject) => {
    setReady = resolve;
    timeout = setTimeout(() => reject(new Error(message)), rejectTimeout);
  }).then((r) => {
    clearTimeout(timeout);
    return r;
  });
  return { ready, setReady }
}

async function tryFetch(url, options) {
  for (let i = 0; i < requestMaxTry; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw { status: res.status }
      return res;
    }
    catch (e) {
      if (i < requestMaxTry) {
        await sleep(500);
        continue;
      }
      throw e;
    }
  }
}

export default {
  mountURL,
  sleep,  
  loadHTML,
  createPromiseState,
  fetch: tryFetch
};
