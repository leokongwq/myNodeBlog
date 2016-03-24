/**
 * Created by zhangyanghong on 16/3/24.
 */

var posts = require('../models/posts');
var metas = require('../models/metas');
var postMetaRel = require('../models/postMetaRel');

exports.queryPostByName = function(req, res){
    var slug = req.params.cateName;
    var pageNo = 1;
    if(req.query.pn || parseInt(req.query.pn) >  0){
        pageNo = parseInt(req.query.pn);
    }
    metas.queryCategoryBySlug(slug, function(err, category){
        if (err){
            throw err;
        }
        //查询该分类下的文章
        if (category){
            postMetaRel.queryPostIdsByMetaId(category.id, function(err, postMetaRels){
                if (err){
                    throw err;
                }
                var postIds = [];
                postMetaRels.forEach(function(postMetaRel){
                    postIds.push(postMetaRel.postId);
                });
                posts.queryByIds(postIds, function(err, posts){
                    var data  = {
                        slug : slug,
                        pages : posts,
                        user : req.session.user
                    };
                    res.render('index', data);
                });
            });
        }else {
            res.status(404);
            res.end();
        }
    });
};