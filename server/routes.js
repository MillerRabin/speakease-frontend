
const Router = require('koa-router');
const hotReload = require('./modules/hotReload.js');

const router = new Router();

router.get('/reload', hotReload.context.reload);

module.exports = router;