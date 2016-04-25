/**
 * Created by zhangyanghong on 16/3/16.
 */

var posts = require('../models/posts');
var links = require('../models/links');
var metas = require('../models/metas');
var postMetaRel = require('../models/postMetaRel');
var users = require('../models/users');
var md = require("node-markdown").Markdown;
var moment = require("moment");
var async = require('async');

const PAGE_SIZE = 5;

/**
 * 首页
 */
exports.index = function(req, res, next){
    var pageNo = 1;
    if (req.query.pn){
        pageNo = parseInt(req.query.pn);
    }
    posts.pageQuery({type:'post'}, pageNo, PAGE_SIZE, function(err, blogs){
        if(err){
            return next(err, req, res);
        }
        posts.countAll(function(err, total){
            if(err){
                return next(err, req, res);
            }
            blogs.forEach(function(blog){
                blog.created = moment.unix(blog.created).format('YYYY-MM-DD');
            });
            var data = {
                total : total,
                crtPage : pageNo,
                hasNext : blogs.length == PAGE_SIZE,
                hasPre : pageNo > 1 && blogs.length > 0,
                pages : blogs,
                enslug:'index',
                slug : '最近更新',
                user:req.session.user
            };
            res.render('index', data);
        });
    });
};

/**
 * 关于本人页
 * @param req
 * @param res
 * @param next
 */
exports.about= function(req, res, next){
    posts.queryBySlug("about", function(err, post){
        if(err){
            next(err);
            throw err;
        }
        var html = md(post.text, true);
        post.text = html;
        var data = {
            slug:'about',
            enslug:'about',
            page:post,
            user:req.session.user
        };
        res.render('about', data);
    });
};

/**
 * 分类页, 计算每一个分类下的文章.
 * @param req
 * @param res
 */
exports.categories = function(req, res, next){
    var data = {
        slug : '分类',
        enslug : 'category',
        user : req.session.user
    };
    metas.queryAllCates(function(err, categorys){
        if(err){
            return next(err);
        }
        async.each(categorys, function(category, callback){
            //查询每个分类下的文章
            postMetaRel.queryPostIdsByMetaId(category.id, function(err, postMetaRels){
                if(err){
                    return callback(err);
                }
                var postIds = [];
                postMetaRels.forEach(function(postMetaRel){
                    postIds.push(postMetaRel.postId);
                });
                if (postIds.length > 0){
                    //查询文章
                    posts.queryByIds(postIds, function(err, posts){
                        if(err){
                            return callback(err);
                        }
                        category.pages = posts;
                        category.totalPages = posts.length;
                        callback();
                    });
                }else{
                    callback();
                }
            });
        }, function(err){
            if(err){
                return next(err);
            }
            data.categorys = categorys;
            res.render('categories', data);
        });
    });
};

/**
 * 归档页
 * @param req
 * @param res
 */
exports.archives = function(req, res){
    var data = {
        slug : '存档',
        enslug : 'archives',
        user : req.session.user
    };
    posts.queryAll(function(err, posts){
        if(err){
            return next(err);
        }
        var postGrp = {};
        if(posts.length > 0){
            posts.forEach(function(post){
                var createDate = moment.unix(post.created).format('YYYY年MM月');
                post.created = moment.unix(post.created).format('MM日');
                if (postGrp[createDate]){
                    var dateGrpPosts = postGrp[createDate];
                    dateGrpPosts.push(post);
                    postGrp[createDate] = dateGrpPosts;
                }else{
                    postGrp[createDate] = [post];
                }
            });
        }
        var archives = [];
        for(var key in postGrp){
            var elem = {
                "month" : key,
                "posts" : postGrp[key]
            };
            archives.push(elem);
        }
        data.archives = archives;
        //按月分组
        res.render('archives', data);
    });
};

/**
 * 标签页
 * @param req
 * @param res
 */
exports.tags = function(req, res){
    metas.queryAllTags(function(err, tags){
        if(err){
            throw err;
        }
        var data = {
            slug:'标签',
            enslug:'tag',
            tags:tags,
            user:req.session.user
        };
        res.render('tags', data);
    });
};

/**
 * 友情链接页
 * @param req
 * @param res
 */
exports.links = function(req, res){
    links.queryAllLinks(function(err, links){
        if(err){
            throw err;
        }
        var data = {
            enslug:'link',
            slug:'友链',
            links:links,
            user:req.session.user
        };
        res.render('links', data);
    });
};


