const path = require('path');
exports.port = process.env['PORT'] ?? 9001;
exports.staticPath = path.resolve(__dirname, '..', 'static');

exports.settings = {
  root: path.resolve(__dirname, '..', 'static'),
  watch: [
    path.resolve(__dirname, '..', 'static')
  ],
  templates: path.resolve(__dirname, '..', 'templates'),
  pages: path.resolve(__dirname, '..', 'static', 'pages'),
  mininfyCSSPath: path.resolve(__dirname, '..', 'static', 'styles'),
  minifyCSS: false
};