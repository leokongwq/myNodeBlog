var db = require("./db");
var moment = require("moment");
var ip = require('ip');
var async = require('async');

var Comments = db.define('comments', {
    id:      {type: 'serial', key: true}, // the auto-incrementing primary key
    postId:    {type: 'integer', defaultValue:0},
    ownerId: {type: 'integer', defaultValue:0},
    authorId:     {type: 'integer', defaultValue:0},
    authorName: {type:'text', defaultValue:''},
    mail: {type:'text', defaultValue:''},
    url: {type:'text', defaultValue:''},
    ip: {type:'integer', defaultValue:0},
    agent: {type:'text', defaultValue:0},
    text:{type:'text', defaultValue:''},
    type: {type:'text', defaultValue:''},
    status: {type:'text', defaultValue:''},
    parent: {type:'integer', defaultValue:0},
    created:     {type: 'integer', size:10, defaultValue:0}
}, {
    methods : {
        formatForShow: function() {
            this.created = moment.unix(this.created).format('YYYY-MM-DD HH:mm:ss');
            return this;
        }
    },
    hooks: {
        //afterLoad : function (next) {
        //    if(this.ip){
        //        this.ip = ip.fromLong(this.ip);
        //    }
        //    return next();
        //}
    }
});

var Comment = {};

/**
 * 根据id查询评论内容
 * @param commentId
 * @param cb
 */
Comment.getById = function(commentId, cb){
    Comments.get(commentId, function(err, comment) {
        cb(err, comment);
    });
};

/**
 * 根据文章id查询所有评论
 * @param postId
 * @param cb
 */
Comment.queryByPostId = function(postId, cb){
    Comments.find({postId:postId}, "created", function(err, comments){
        if (err){
            return cb(err, null);
        }
        for(var i = 0; i < comments.length; i++){
            comments[i] = comments[i].formatForShow();
        }
        cb(err, comments);
    });
};

/**
 * 添加博文评论
 * @param comment
 * @param cb
 */
Comment.save = function(comment, cb){
    Comments.create(comment, function(err, result){
        cb(err, result);
    });
};

/**
 * 根据用户id查询该用户发布的评论,或提到该用户的评论
 * @param userId
 * @param isSelf true:表示,该用户自己发表的, false:表示别人对他的评论
 * @param cb
 */
Comment.countByUserId = function(userId, isSelf, cb){
    var cond = {};
    if(isSelf){
        cond.ownerId = userId;
    }else {
        cond.postId = userId;
    }
    Comments.count(cond, function(err, total){
        cb(err, total);
    });
};

/**
 *  更加条件分页查询评论信息
 */
Comment.pageQuery = function(condition, pageNo, pageSize, cb){
    Comments.find(condition, {offset: (pageNo - 1) * pageSize}, pageSize, "created", function(err, comments){
        cb(err, comments);
    });
};

/**
 * 查找指定条件的总评论数
 * @param condition
 * @param cb
 */
Comment.countByCondition = function(condition, cb){
    Comments.count(condition, function(err, total){
        cb(err, total);
    });
};

/**
 * 批量删除
 * @param cmtIds
 * @param cb
 */
Comment.batchDelete = function (cmtIds, cb) {
    Comments.find({id : cmtIds}, function (err, comments) {
        if (err){
            return cb(err);
        }
        async.each(comments, function(toDelCmt, cb){
            toDelCmt.remove(function (err) {
                if (err){
                    return cb(err);
                }
                cb();
            });
        }, function(err){
            cb(err);
        });
    });
};

/**
 * 批量修改评论状态
 * @param cmtIds
 * @param status
 * @param cb
 */
Comment.batchUpdateStatus = function (cmtIds, status, cb) {
    Comments.find({id : cmtIds}, function (err, comments) {
        if (err){
            return cb(err);
        }
        async.each(comments, function(toUpdate, cb){
            toUpdate.status = status;
            toUpdate.save(function(err){
                if (err){
                    return cb(err);
                }
                cb();
            });
        }, function(err){
            cb(err);
        });
    });
};

module.exports = Comment;

