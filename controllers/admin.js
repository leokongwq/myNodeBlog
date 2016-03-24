/**
 * Created by zhangyanghong on 16/3/16.
 */
var util = require('util');
var dateUtil = require('../common/dateUtil');
var async = require('async');
var posts = require('../models/posts');
var metas = require('../models/metas');
var comments = require('../models/comments');
var users = require('../models/users');
var postMetaRel = require('../models/postMetaRel');

/**
 * 管理后台首页
 */
exports.index = function(req, res) {
    var data = {
        user : req.session.user
    };
    posts.countAll(function(err, postCount){
        if(err){
            throw err;
        }
        data.totalPosts = postCount;
        metas.countAllCate(function(err, cateCount){
            if(err){
                throw err;
            }
            data.totalCate = cateCount;
            comments.countByUserId(1, false, function(err, totalComment){
                if(err){
                    throw err;
                }
                data.totalCom = totalComment;
                res.render('admin/index', data);
            });
        });
    });
};

/**
 * 个人信息页
 * @param req
 * @param res
 * @param next
 */
exports.profile = function(req, res, next){
    var data = {
        user : req.session.user
    };
    posts.countAll(function(err, postCount){
        if(err){
            next(err, req, res);
        }
        data.totalPosts = postCount;
        metas.countAllCate(function(err, cateCount){
            if(err){
                next(err, req, res);
            }
            data.totalCate = cateCount;
            comments.countByUserId(1, false, function(err, totalComment){
                if(err){
                    next(err, req, res);
                }
                data.totalCom = totalComment;
                res.render('admin/profile', data);
            });
        });
    });
};

/**
 * 修改个人信息
 * @param req
 * @param res
 * @param next
 */
exports.updateProfile = function (req, res, next) {
    var loginUser = req.session.user;
    users.getByName(loginUser.name, function(err, user){
        if (err){
            next(err, req, res);
            return;
        }
        user.nickName = req.body.nickName;
        user.url = req.body.url;
        user.mail = req.body.mail;
        user.lastLogin = new Date() / 1000;
        user.save(function(err){
            if (err){
                next(err, req, res);
                return;
            }
            req.session.user = user.formatForShow();
            res.redirect(req.originalUrl);
        });
    });
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
exports.writePost = function(req, res, next){
    var postId = req.query.pid;
    if (postId && util.isNumber(parseInt(postId))){
        posts.getById(postId, function(err, post){
            if (err){
                return next(err, req, res);
            }
            metas.queryAllCates(function(err, categorys){
                if (err){
                    return next(err, req, res);
                }
                res.render('admin/newPost', {categorys : categorys, user : req.session.user, page : post});
            });
        });
    }else{
        metas.queryAllCates(function(err, categorys){
            if (err){
                return next(err, req, res);
            }
            res.render('admin/newPost', {categorys : categorys, user : req.session.user});
        });
    }
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
exports.doWritePost = function(req, res, next){
    var toSave = bulidPost(req);
    if(!toSave.id){
        doSaveNewPost(toSave, function(err){
            if(err){
                return next(err);
            }
            res.redirect('/admin/manage-posts');
        });
    }else{
        doUpdatePost(toSave, function(err){
            if(err){
                return next(err);
            }
            res.redirect('/admin/manage-posts');
        });
    }
};

/**
 * 保存新文章
 * @param toSavePost
 * @param cb
 */
function doSaveNewPost(toSave, cb){
    //保存文章
    posts.create(toSave, function(err, newPost){
        if (err){
            return cb(err);
        }
        var toSaveRels = buildToSavePostRel(toSave);
        if (toSaveRels.length > 0) {
            postMetaRel.createRels(toSaveRels, function (err, results) {
                return cb(err);
            });
        }
        cb();
    });
}

/**
 *  修改文章
 * @param toUpdatePost
 * @param cb
 */
function doUpdatePost(toUpdatePost, cb){
    console.log("do update");
    //修改文章内容
    posts.update(toUpdatePost, function(err){
        if(err){
            return cb(err);
        }
        //删除旧关联关系,添加新的关联关系
        postMetaRel.deleteRelByPostIds(toUpdatePost.id, function(err){
            if(err){
                return cb(err);
            }
            var toSaveRels = buildToSavePostRel(toUpdatePost);
            if (toSaveRels.length > 0) {
                postMetaRel.createRels(toSaveRels, function (err, results) {
                    return cb(err);
                });
            }else {
                cb();
            }
        });
    });
}


/**
 * 文章列表
 * @param req
 * @param res
 * @param next
 */
exports.postList = function(req, res, next) {
    var data = {
        user: req.session.user
    };
    var pn = 1;
    if (req.query.page && util.isNumber(pn)) {
        pn = parseInt(req.query.page);
    }

    //查询文章列表
    posts.pageQuery({}, pn, 10, function (err, pages) {
        if (err) {
            return next(err);
        }
        if (pages.length == 0) {
            return res.render('admin/postList', data);
        }
        var postIds = [];
        for (var i = 0; i < pages.length; i++) {
            postIds.push(pages[i].id);
            pages[i].created = dateUtil.unixToDateStr(pages[i].created);
        }
        //文章id和分类id数组对应关系的列表
        var postCatesMap = {};

        async.series([
            //查询文章和分类的对应关系(这里面包含了标签)
            function(callback){
                postMetaRel.queryPostIdsByMetaId(postIds, function(err, postCateRels){
                    if(err){
                        return callback(err);
                    }
                    postCatesMap = convertPostMetasToMap(postCateRels);
                    callback();
                });
            },
            //根据对应关系查询分类信息
            function(callback){
                async.each(Object.keys(postCatesMap), function(postId, callback){
                    //根据文章所属的分类id列表查询分类信息
                    metas.getByIds(postCatesMap[postId], function(err, categorys) {
                        if(err){
                            return callback(err);
                        }
                        postCatesMap[postId] = categorys;
                        callback();
                    });
                }, function(err){
                    callback(err);
                });
            }
        ], function(err){
            if(err){
                return next(err);
            }
            for (var i = 0; i < pages.length; i++){
                pages[i].categorys = postCatesMap[pages[i].id];
            }
            data.pages = pages;
            res.render('admin/postList', data);
        });
    });
};

/**
 * 将数据库中文章id和分类id对应关系的记录转为map结构, {1 : [1, 2, 3]}
 * @param postCateRels
 * @returns {{}}
 */
function convertPostMetasToMap(postCateRels){
    if(!postCateRels || postCateRels.length == 0){
        return {};
    }
    var postCatesMap = {};
    for (var i = 0; i < postCateRels.length; i++){
        var rel = postCateRels[i];
        if(postCatesMap[rel.postId]){
            var ids = postCatesMap[rel.postId];
            ids.push(rel.metaId);
            postCatesMap[rel.postId] = ids;
        }else{
            var mtIds = [];
            mtIds.push(rel.metaId);
            postCatesMap[rel.postId] = mtIds;
        }
    }
    return postCatesMap;
}

/**
 * 删除文章
 * @param req
 * @param res
 * @param next
 */
exports.doDeletePost = function(req, res, next){
    var delPostIds = req.body.postIds;
    if(!delPostIds){
        return res.redirect('/admin/manage-posts');
    }
    //删除文章
    posts.batchDelete(delPostIds, function(err){
        if(err){
            return next(err);
        }
        //删除文章和分类的关联关系
        postMetaRel.deleteRelByPostIds(delPostIds, function(err){
            if(err){
                return next(err);
            }
            return res.redirect('/admin/manage-posts');
        });
    });
};

/**
 * 评论列表
 * @param req
 * @param res
 * @param next
 */
exports.commentList = function(req, res, next){
    var cmtPageSize = 3;
    var pn = 1;
    if (req.query.page && util.isNumber(pn)) {
        pn = parseInt(req.query.page);
    }
    var status = req.query.status ? req.query.status : "approved";
    var query = {
        status : status
    };
    comments.countByCondition(query, function(err, total){
        if (err){
            return next(err);
        }
        var data = {
            status : status,
            crtPage : pn,
            total : total,
            totalPage : parseInt(total / cmtPageSize) + 1,
            hasNext : (pn * cmtPageSize) < total,
            hasPre : pn > 1 && (pn - 1) * cmtPageSize < total
        };

        comments.pageQuery(query, pn, cmtPageSize, function(err, comments){
            if (err){
                return next(err);
            }
            data.comments = comments;
            res.render('admin/commentList', data);
        });
    });

};

/**
 * 评论管理
 * @param req
 * @param res
 * @param next
 */
exports.commentMgr = function(req, res, next){
    var action = req.query.do;
    var cmtIds = req.body.cmtIds || req.query.cmtIds;
    if(!action || !cmtIds){
        return res.redirect('/admin/manage-comments');
    }
    if (action == 'delete'){ //删除
        comments.batchDelete(cmtIds, function(err){
            if(err){
                return next(err);
            }
            return res.redirect('/admin/manage-comments');
        });
    }else{ //修改
        comments.batchUpdateStatus(cmtIds, action, function(err){
            if(err){
                return next(err);
            }
            return res.redirect('/admin/manage-comments');
        });
    }
};

/**
 * 分类列表
 * @param req
 * @param res
 * @param next
 */
exports.categoryList = function(req, res, next){
    var data = {};
    metas.queryAllCates(function(err, categorys){
        if(err){
            return next(err);
        }
        data.categorys = categorys;
        return res.render('admin/categoryList', data);
    });
};

/**
 * 分类管理
 * @param req
 * @param res
 * @param next
 */
exports.categoryMgr = function(req, res, next){
    var mids = req.body.mids;
    var action = req.query.do;
    var mType = req.body.mType;
    if(!action || !mids|| !mType){
        return res.redirect('/admin/manage-categories');
    }
    if (action == 'delete'){ //删除
        metas.batchDelByType(mids, mType, function(err){
           if(err){
               return next(err);
           }
            return res.redirect('/admin/manage-categories');
        });
    }else{
        return res.redirect('/admin/manage-categories');
    }
};

/**
 * 创建meta
 */
exports.createMeta = function(req, res, next){
    var mid = req.query.mid;
    metas.queryAllCates(function(err, categorys){
        if(err){
            return next(err);
        }
        if(!mid){
            return res.render('admin/category', {categorys : categorys});
        }
        metas.getById(mid, function(err, meta){
            if(err){
                return next(err);
            }
            return res.render('admin/category', {meta : meta, categorys : categorys});
        });
    });
};

/**
 * 保存分类
 */
exports.doCreateMeta = function(req, res, next){
    var mid = req.body.mid;
    var name = req.body.name;
    var slug = req.body.slug;
    var parent = req.body.parent || 0;
    var description = req.body.description || '';

    if(!name || !slug){
        return res.redirect('/admin/category');
    }

    var meta = {
        name : name,
        slug : slug,
        parent : parent,
        description : description,
        type : 'category',
        count : 0,
        order : 0,
        created : dateUtil.getNowInt(),
        updated : dateUtil.getNowInt()
    };

    if(mid){
        metas.update(meta, function(err){
            if(err){
                return next(err);
            }
            return res.redirect('/admin/manage-categories');
        });
    }else{
        metas.create(meta, function(err){
            if(err){
                return next(err);
            }
            return res.redirect('/admin/manage-categories');
        });
    }
};


/**
 * 保存分类
 */
exports.doSavePostMetaRel = function(req, res, next){

};

/**
 * 构建文章对象
 * @param req
 * @returns {{title: (*|string), slug: (*|Document.write_post.slug|string|Metas.slug|{type, defaultValue}|Posts.slug), text: (*|string), tags: (*|Array|string|string|string|Document.write_post.tags), category: (*|Array), created: Number, visibility: (*|string|Document.write_post.visibility|string), allowPing: (*|Document.write_post.allowPing|Posts.allowPing|{type, defaultValue}|number), allowFeed: (*|Posts.allowFeed|{type, defaultValue}|Document.write_post.allowFeed|number), allowComment: (*|Document.write_post.allowComment|Posts.allowComment|{type, defaultValue}|number), markdown: (*|Document.write_post.markdown|Document.markdown|number), trackback: (*|Document.write_post.trackback|string)}}
 */
function bulidPost(req){
    var post = {
        id : req.body.pid || 0,
        title : req.body.title || '',
        slug : req.body.slug || '',
        text : req.body.text || '',
        authorId : req.session.user.id,
        type : 'post',
        status : req.body.visibility || 'publish',
        allowPing : req.body.allowPing || 1,
        allowFeed : req.body.allowFeed || 1,
        allowComment : req.body.allowComment || 1,
        markdown : req.body.markdown || 1,
        trackback : req.body.trackback || '',
        modified : dateUtil.getNowInt()
    };
    if (req.body.date){
        post.created = dateUtil.parseDateToInt(req.body.date, 'YYYY-MM-DD HH:mm');
    }else {
        post.created = dateUtil.getNowInt();
    }
    if (!req.body.tags){
        post.tags = [];
    } else {
        post.tags = req.body.tags.split(",");
    }
    var categorys = req.body.category || [];
    if(categorys && !util.isArray(categorys)){
        post.category = [categorys];
    }
    return post;
}

/**
 * 构造需要保存的文章和文章分类对应关系
 * @param toSavePost
 * @returns {Array}
 */
function buildToSavePostRel(toSave){
    var cates = toSave.category;
    var tags = toSave.tags;
    console.log(cates);
    console.log(tags);
    var toSaveRels = [];
    //保存文章对应的分类
    if(cates && cates.length > 0) {
        cates.forEach(function(cate){
            toSaveRels.push(
                {
                    postId: toSave.id,
                    metaId: cate
                }
            );
        });
    }
    //保存文章和分类的对应关系
    if(tags && tags.length > 0){
        tags.forEach(function(tag){
            toSaveRels.push(
                {
                    postId: toSave.id,
                    metaId: tag
                }
            );
        });
    }
    return toSaveRels;
}