const koa = require("koa");
const config = require("./config.js");
const serve = require('koa-static');
const http = require("http");
const router = require('./routes.js');
const builder = require('./modules/builder.js');

const application = new koa();

application.use(serve(config.staticPath));
application.use(router.routes());

function createServer(application, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(application.callback());
    server.listen(port, (err) => {
      if (err != null) return reject(err);
      console.log("Server accepts connections at " + port);
      return resolve();
    });
  });
}

async function start(application, port) {
  try {
    await builder.start(config);
    await createServer(application, port);
  } catch (err) {
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

start(application, config.port);
