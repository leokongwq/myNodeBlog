var orm = require('orm');

orm.settings.set('connection.debug', true);

var opts = {
	user:'root',
	password:'root@123',
	host:'127.0.0.1',
	database:'leoNode',
	protocol:'mysql',
	port:'3306',
	query:{
		pool: true
	}
};


var db = orm.connect(opts);

db.on('connect', function(err) {
  if (err) {
  	return console.error('Connection error: ' + err);
  }
  console.log("connect mysql success!");
});

module.exports = db;

