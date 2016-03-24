/**
 * Created by zhangyanghong on 16/3/10.
 */
var db = require("./db");
var async = require('async');

var PostMetaRels = db.define('postMetaRel', {
    id: {type: 'serial', key: true}, // the auto-incrementing primary key
    postId:    {type : 'integer', defaultValue : 0},
    metaId: {type : 'integer', defaultValue : 0},
}, {
    methods : {
        fullName: function() {
            return this.postId + ':' + this.metaId;
        }
    }
});

var PostMetaRel = {};

/**
 * 根据分类id查询对应的文章
 * @param metaId
 * @param cb
 */
PostMetaRel.queryPostIdsByMetaId = function(metaId, cb){
    PostMetaRels.find({metaId:metaId}, function(err, postIds){
        cb(err, postIds);
    });
};

/**
 * 根据文章id查询对应的分类id
 * @param metaId
 * @param cb
 */
PostMetaRel.queryMetaIdsByPostId = function(postIds, cb){
    PostMetaRels.find({postId : postIds}, function(err, metaIds){
        cb(err, metaIds);
    });
};

/**
 * 保存文章和分类,或文章和标签对应关系
 * @param metaId
 * @param cb
 */
PostMetaRel.createRels = function(toSaveRels, cb){
    PostMetaRels.create(toSaveRels, function(err, rels){
        cb(err, rels);
    });
};

/**
 * 批量删除文章和分类对应关系
 * @param toDelPostIds
 * @param cb
 */
PostMetaRel.deleteRelByPostIds = function(toDelPostIds, cb){
    PostMetaRels.find({postId : toDelPostIds}, function(err, rels){
        if(err){
            return cb(err);
        }
        async.each(rels, function(postMetaRel, cb){
            postMetaRel.remove(function(err){
               cb(err);
            });
        }, function(err){
            cb(err);
        });
    });
};

module.exports = PostMetaRel;

