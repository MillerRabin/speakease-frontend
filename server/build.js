const config = require("./config.js");
const builder = require('./modules/builder.js');


async function start() {
  try {
    console.log('Building css');
    await builder.start(config);
    console.log('Done');} 
  catch (err) {
    console.log(err);
  }
}

process.on("unhandledRejection", function (reason, p) {
  console.log(
    "Possibly Unhandled Rejection at: Promise ",
    p,
    " reason: ",
    reason
  );
});

config.settings.minifyCSS = true;
start(config);
