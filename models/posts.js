var db = require("./db");
var moment = require("moment");
var async = require('async');

var Posts = db.define('posts', {
        id: {type: 'serial', key: true}, // the auto-incrementing primary key
        title: {type: 'text', defaultValue: ''},
        slug: {type: 'text', defaultValue: ''},
        text: {type: 'text', defaultValue: ''},
        order: {type: 'integer', size: 10, defaultValue: 0},
        authorId: {type: 'integer', defaultValue: 0},
        type: {type: 'text', defaultValue: 'post'},
        status: {type: 'text', defaultValue: ''},
        password: {type: 'text', defaultValue: ''},
        commentsNum: {type: 'integer', defaultValue: 0},
        allowComment: {type: 'integer', defaultValue: 0},
        allowPing: {type: 'integer', defaultValue: 0},
        allowFeed: {type: 'integer', defaultValue: 0},
        viewsNum: {type: 'integer', defaultValue: 0},
        likesNum: {type: 'integer', defaultValue: 0},
        created: {type: 'integer', size: 10, defaultValue: 0},
        modified: {type: 'integer', size: 10, defaultValue: 0}
    }, {
    cache: false,
    methods: {
        toString: function () {
            return "{" + this.title + "," + this.slug + "," + this.authorId;
        }
    },
    hooks: {
        //afterLoad : function (next) {
        //    if(this.id){
        //        this.created = moment.unix(this.created).format('YYYY-MM-DD');
        //    }
        //    return next();
        //}
    }
});

var Post = {};

/**
 * 根据id查询
 * @param postId
 * @param cb
 */
Post.getById = function (postId, cb) {
    Posts.get(postId, function (err, post) {
        cb(err, post);
    });
};

/**
 * 根据id列表查询
 * @param postIds
 * @param cb
 */
Post.queryByIds = function (postIds, cb) {
    Posts.find({id: postIds}, function (err, posts) {
        if (posts.length > 0) {
            for (var i = 0; i < posts.length; i++) {
                posts[i] = posts[i];
            }
        }
        cb(err, posts);
    });
};

/**
 * 查询所有文章
 */
Post.queryAll = function(cb){
    Posts.find({}, function (err, posts) {
        cb(err, posts);
    });
};

/**
 * 分页查询
 * @param pageNo
 * @param cb
 */
Post.pageQuery = function (cond, pageNo, pageSize, cb) {
    Posts.find(cond, {offset: (pageNo - 1) * pageSize}, pageSize, ["created", 'Z'], function (err, posts) {
        if (err){
            return cb(err);
        }
        if (posts.length > 0) {
            for (var i = 0; i < posts.length; i++) {
                posts[i] = posts[i];
            }
        }
        cb(err, posts);
    });
};

/**
 * 根据缩略名查询
 * @param slug
 * @param cb
 */
Post.queryBySlug = function (slug, cb) {
    Posts.find({slug: slug}, function (err, post) {
        cb(err, post[0]);
    });
};

/**
 * 查询总的文章数
 * @param cb
 */
Post.countAll = function (cb) {
    Posts.count({type: 'post'}, function (err, total) {
        cb(err, total);
    });
}

/**
 * 创建文章
 * @param toSave
 * @param cb
 */
Post.create = function (toSave, cb) {
    Posts.create(toSave, function (err, newPost) {
        return cb(err, newPost);
    });
};

Post.update = function (toUpdate, cb) {
    Posts.get(toUpdate.id, function(err, inDbPost){
        if(err){
            return cb(err);
        }
        if(!inDbPost){
            return cb(new Error('no such post id=' + toUpdate.id));
        }
        //对象赋值
        inDbPost.title = toUpdate.title;
        inDbPost.slug = toUpdate.slug;
        inDbPost.text = toUpdate.text;
        inDbPost.status = toUpdate.status;
        inDbPost.allowComment = toUpdate.allowComment;
        inDbPost.allowPing = toUpdate.allowPing;
        inDbPost.allowFeed = toUpdate.allowFeed;
        inDbPost.modified = moment().unix();
        //更新
        inDbPost.save(function(err){
            return cb(err);
        });
    });
};

/**
 * 批量删除
 * @param postIds
 * @param cb
 */
Post.batchDelete = function (postIds, cb) {
    Posts.find({id : postIds}, function (err, posts) {
        if (err){
            return cb(err);
        }
        async.each(posts, function(toDelPost, cb){
            toDelPost.remove(function (err) {
                    return cb(err);
            });
        }, function(err){
            cb(err);
        });
    });
};

module.exports = Post;

