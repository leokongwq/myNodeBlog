/**
 * Created by zhangyanghong on 16/3/16.
 */

var metas = require('../models/metas');
var postMetaRel = require('../models/postMetaRel');
var posts = require('../models/posts');

exports.index = function(req, res){
    var slug = req.params.slug;
    metas.queryTagBySlug(slug, function(err, meta){
        if (err){
            throw err;
        }
        if (meta){
            postMetaRel.queryPostIdsByMetaId(meta.id, function(err, postMetaRels){
                if (err){
                    throw err;
                }
                var postIds = [];
                postMetaRels.forEach(function(postMetaRel){
                    postIds.push(postMetaRel.postId);
                });
                posts.queryByIds(postIds, function(err, posts){
                    res.render('index', {slug:slug, posts:posts, user:req.session.user});
                });
            });
        }else {
            res.status(404);
            res.end();
        }
    });
};