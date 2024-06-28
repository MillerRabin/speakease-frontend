export async function getLocale() {
  try {
    // reserve service https://ipinfo.io
    const data = await fetch('https://jsonip.com');
    return data.json();
  } catch (err) {
    console.log(err);
  }
  return null;
}

export default {
  getLocale,
}