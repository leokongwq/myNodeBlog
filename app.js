var express = require('express');
var session = require('express-session');
var staticCache = require('express-static-cache');
var compression = require('compression');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var swig = require('swig');
var web_route = require('./web_route');
var config = require('./config');
var fs = require('fs');
var logger = require('./common/logger');

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'});

var app = express();
// compress all requests
app.use(compression());
// view engine setup
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

//in debug model  Disable Express's and Swig Cache
if(config.debug){
    app.set('view cache', false);
    swig.setDefaults({ cache: false });
}
app.use(favicon(path.join(__dirname, 'public', 'favicon.jpg')));
//开发环境记录访问日志,生产环境前端有nginx,不需要重复记录
if(config.debug){
    app.use(morgan('combined', {
        stream: accessLogStream
    }));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//cookie加密和session cookie
app.use(cookieParser(config.cookie_sign));
app.use(session({
        secret : config.session_secret,
        key :'sid',
        resave : false,
        saveUninitialized: true,
        cookie: {maxAge : 3600000}
    }
));
//静态资源处理
app.use(staticCache(path.join(__dirname, 'public'), {maxAge: 365 * 24 * 60 * 60}));
//设置路由
app.use('/', web_route);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function(err, req, res, next) {
    logger.error(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

if (!module.parent) {
    app.listen(config.port, function () {
        logger.info('Server listening on port', config.port);
        logger.info('God bless love....');
        logger.info('You can debug your app with http://' + config.hostname + ':' + config.port);
        logger.info('');
    });
}

module.exports = app;
