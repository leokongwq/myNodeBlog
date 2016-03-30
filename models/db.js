var config = require('../config');
var logger = require('../common/logger');
var querystring = require('querystring');
var orm = require('orm');

var optStr = querystring.stringify(config.dbOpt);
var connStr = config.dbUrl + "?" + optStr;
//console.log(connStr);
var db = orm.connect(connStr);

db.on('connect', function (err) {
    if (err) {
        return logger.error(err);
    }
    logger.info("connect mysql success!");
});

module.exports = db;

