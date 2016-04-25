var express = require('express');
var environment = require('./config/environment');
var config = require('./config/settings');


var app = express();
//配置express环境
environment(app);

if (!module.parent) {
    app.listen(config.port, function () {
        logger.info('Server listening on port', config.port);
        logger.info('God bless love....');
        logger.info('You can debug your app with http://' + config.hostname + ':' + config.port);
        logger.info('');
    });
}

module.exports = app;
