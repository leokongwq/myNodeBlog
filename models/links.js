var db = require("./db");
var dateUtil = require('../common/dateUtil');
var async = require('async');

var Links = db.define('links', {
    id:      {type: 'serial', key: true}, // the auto-incrementing primary key
    name:    {type: 'text', defaultValue:''},
    url: {type: 'text', defaultValue:''},
    sort:     {type: 'text', defaultValue:''},
    image: {type:'text', defaultValue:''},
    description: {type:'text', defaultValue:''},
    user: {type:'text', defaultValue:''},
    order: {type:'integer', defaultValue:0},
    created:     {type: 'integer', size:10, defaultValue:0},
    updated:     {type: 'integer', size:10, defaultValue:0}
}, {
    methods : {
        fullName: function() {
            return this.name + ':' + this.url;
        }
    }
});

var Link = {};

Link.getById = function(linkId, cb){
    Links.get(linkId, function(err, link) {
        cb(err, link);
    });
};

Link.queryAllLinks = function(cb){
    Links.find({}, "created", function(err, links){
        cb(err, links);
    });
};

/**
 * 新建
 */
Link.createLink = function(link, cb){
    Links.create(link, function(err, link) {
        cb(err, link);
    });
};

/**
 * 更新
 */
Link.updateLink = function(link, cb){
    Links.get(linkId, function(err, dbLink) {
        if(err){
            return cb(err);
        }
        dbLink.name = link.name;
        dbLink.url = link.url;
        dbLink.sort = link.sort;
        dbLink.image = link.image;
        dbLink.description = link.description;
        dbLink.user = link.user;
        dbLink.updated = dateUtil.getNowInt();
        //更新
        dbLink.save(function(err){
            cb(err);
        });
    });
};

/**
 *
 * @param lids
 * @param cb
 */
Link.deleteLink = function(lids, cb){
    Links.find({id : lids}, function (err, links) {
        if (err){
            return cb(err);
        }
        async.each(links, function(toDelLink, cb){
            toDelLink.remove(function (err) {
                return cb(err);
            });
        }, function(err){
            cb(err);
        });
    });
};

module.exports = Link;

