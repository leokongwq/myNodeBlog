/**
 * Created by zhangyanghong on 16/3/16.
 */

var posts = require('../models/posts');

/**
 * 查询指定用户下的文章
 * @param req
 * @param res
 * @param next
 */
exports.queryPostByUser = function(req, res, next){
    var userId = req.params.userId;
    var pageNo = 1;
    if (req.query.pn){
        pageNo = req.query.pn;
    }
    posts.pageQuery({authorId:userId}, pageNo, 10, function(err, blogs){
        if(err){
            throw err;
        }
        var data = {
            pages : blogs,
            enslug:'index',
            slug : '最近更新',
            user:req.session.user
        };
        res.render('index', data);
    });
};

