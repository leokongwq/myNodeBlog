var db = require("./db");
var moment = require("moment");

var Users = db.define('users', {
        id:      {type: 'serial', key: true}, // the auto-incrementing primary key
        name:    {type: 'text', defaultValue:''},
        password: {type: 'text', defaultValue:''},
        mail:     {type: 'text', defaultValue:''},
        url: {type:'text', defaultValue:''},
        nickName: {type:'text', defaultValue:''},
        group: {type:'text', defaultValue:''},
        authCode: {type:'text', defaultValue:''},
        created:     {type: 'integer', size:10, defaultValue:0},
        activated:     {type: 'integer', size:10, defaultValue:0},
        lastLogin: {type: 'integer', size:10, defaultValue:0},
    },
    {
        cache   : false,
        methods : {

        },
        hooks: {
            afterLoad: function (next) {
                this.lastLogin = moment.unix(this.lastLogin).format('YYYY-MM-DD HH:mm:ss');
                this.isAdmin = this.group === 'administrator';
                return next();
            }
        }
});

var User = {};

/**
 * 根据用户id查询
 * @param userId
 * @param cb
 */
User.getById = function(userId, cb){
    Users.get(userId, function(err, user) {
        if(user){
            user.formatForShow();
        }
        cb(err, user);
    });
};

/**
 * 根据用户名查询
 * @param userName
 * @param cb
 */
User.getByName = function(userName, cb){
    Users.find({name:userName}, function(err, users){
        if(users.length == 0){
            cb(err, null);
            return;
        }
        cb(err, users[0]);
    });
};

module.exports = User;

