var db = require("./db");
var moment = require("moment");
var dateUtil = require('../common/dateUtil');
var async = require('async');


var Users = db.define('users', {
        id: {type: 'serial', key: true}, // the auto-incrementing primary key
        name: {type: 'text', defaultValue: ''},
        password: {type: 'text', defaultValue: ''},
        mail: {type: 'text', defaultValue: ''},
        url: {type: 'text', defaultValue: ''},
        nickName: {type: 'text', defaultValue: ''},
        group: {type: 'text', defaultValue: ''},
        authCode: {type: 'text', defaultValue: ''},
        created: {type: 'integer', size: 10, defaultValue: 0},
        updated: {type: 'integer', size: 10, defaultValue: 0},
        activated: {type: 'integer', size: 10, defaultValue: 0},
        lastLogin: {type: 'integer', size: 10, defaultValue: 0}
    },
    {
        cache: false,
        methods: {},
        hooks: {
            afterLoad: function (next) {
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
User.getById = function (userId, cb) {
    Users.get(userId, function (err, user) {
        cb(err, user);
    });
};

/**
 * 根据用户名查询
 * @param userName
 * @param cb
 */
User.getByName = function (userName, cb) {
    Users.find({name: userName}, function (err, users) {
        if (users.length == 0) {
            cb(err, null);
            return;
        }
        cb(err, users[0]);
    });
};

/**
 * 根据条件查询用户数目
 * @param cond
 * @param cb
 */
User.countUser = function (cond, cb) {
    Users.count(cond, function (err, total) {
        cb(err, total);
    });
};

/**
 * 分页查询用户信息
 */
User.queryUsersPage = function (cond, pageNo, pageSize, cb) {
    Users.find(cond, {offset: (pageNo - 1) * pageSize}, pageSize, ["created", 'Z'], function (err, users) {
        cb(err, users);
    });
};

/**
 * 新建用户
 * @param user
 * @param cb
 */
User.createUser = function (user, cb) {
    Users.create(user, function (err, newUser) {
        cb(err, newUser);
    });
};

/**
 *
 * @param user
 * @param cb
 */
User.updateUser = function (user, cb) {
    Users.get(user.id, function (err, dbUser) {
        if (err) {
            return cb(err);
        }
        dbUser.name = user.name;
        dbUser.password = user.password;
        dbUser.mail = user.mail;
        dbUser.url = user.url;
        dbUser.nickName = user.nickName;
        dbUser.group = user.group;
        dbUser.updated = dateUtil.getNowInt();
        dbUser.save(function (err) {
            cb(err);
        });
    });
};

/**
 * 根据id批量删除
 * @param uids
 * @param cb
 */
User.batchDelete = function(uids, cb){
    Users.find({id : uids}, function (err, users) {
        if (err){
            return cb(err);
        }
        async.each(users, function(toDelUser, cb){
            toDelUser.remove(function (err) {
                return cb(err);
            });
        }, function(err){
            cb(err);
        });
    });
};

module.exports = User;

