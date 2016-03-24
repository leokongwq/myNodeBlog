/**
 * Created by zhangyanghong on 16/3/16.
 */

var util = require('util');
var ip = require('ip');
var posts = require('../models/posts');
var comments = require('../models/comments');
var dateUtil = require('../common/dateUtil');
var netUtil = require('../common/netUtil');
var md = require("node-markdown").Markdown;

/**
 * 文章详情页
 */
exports.get = function(req, res, next){
    var postSlug = req.params.postSlug;
    posts.queryBySlug(postSlug, function (err, post) {
        if (err) {
            return next(err, req, res);
        }
        if(!post){
            return next(req, res);
        }
        var html = md(post.text, true);
        post.text = html;
        var data = {
            user : req.session.user,
            page : post
        };
        comments.queryByPostId(post.id, function(err, comments){
            if(comments && comments.length > 0){
                data.comments = comments;
            }
            res.render('post', data);
        });
    });
};

/**
 * 给指定的博文添加评论
 */
exports.addComment = function(req, res, next){
    try {
        var postId = req.params.postId;
        if(!util.isNumber(parseInt(postId))){
            throw new Error('not found blog : ' + postId);
        }
        posts.getById(postId, function(err, post){
            if (!post){ //没有找到对应的博文, 404
                return next(req, res);
            }
            var toSaveComm = buildComment(post, req);
            if (toSaveComm.parent > 0){ //回复别人的
                comments.getById(toSaveComm.parent, function(err, pComment){
                    if(err){
                        return next(err, req, res);
                    }
                    toSaveComm.text = "<a style=\"color:#7971C7\" href=\"/author/" + pComment.authorId + "/1\"" + " \"target\"='_blank'>@" + pComment.authorName +"</a><br/>" + toSaveComm.text;
                    //保存评论
                    comments.save(toSaveComm, function(err, saved){
                        if(err){
                            return next(err, req, res);
                        }
                        res.redirect('/posts/' + post.slug + '.html');
                    });
                });
            } else {
                //保存评论
                comments.save(toSaveComm, function(err, saved){
                    if(err){
                        return next(err, req, res);
                    }
                    res.redirect('/posts/' + post.slug + '.html');
                });
            }
        });
    }catch (error){
        if (err){
            console.log(err.stack);
        }
        next(error);
    }
};

function buildComment(post, req){
    var parentId = req.body.parent == null ? 0 : parseInt(req.body.parent);
    var clientIp =  netUtil.getClientIP(req);
    console.log("ip = " + clientIp);
    var toSaveComm;
    if(!req.session.user){
        toSaveComm = {
            postId : post.id,
            ownerId : post.authorId,
            authorName : req.body.author,
            ip : ip.toLong(clientIp),
            mail : req.body.mail,
            url : req.body.url,
            text : req.body.text,
            type : 'comment',
            status : 'approved',
            parent : parentId,
            created : dateUtil.getNowInt()
        };
    }else {
        var loginUser = req.session.user;
        toSaveComm = {
            postId : post.id,
            ownerId : post.authorId,
            authorId : loginUser.id,
            authorName : loginUser.nickName,
            ip : ip.toLong(clientIp),
            mail : req.session.user.mail,
            url : req.session.user.url,
            agent : req.header('user-agent'),
            text : req.body.text,
            type : 'comment',
            status : 'approved',
            parent : parentId,
            created : dateUtil.getNowInt()
        };
    }
    console.log(toSaveComm);
    return toSaveComm;
}
