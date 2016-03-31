/**
 * Created by zhangyanghong on 16/3/16.
 */

var express = require('express');
var router = express.Router();
//权限验证中间件
var auth = require('./middlewares/auth');

//controller
var site = require('./controllers/site');
var login = require('./controllers/login');
var user = require('./controllers/user');
var tag = require('./controllers/tag');
var category = require('./controllers/category');
var post = require('./controllers/post');
var admin = require('./controllers/admin');

var syk = require('./controllers/syk');

//首页
router.get('/', site.index);
//单页面
router.get('/about.html', site.about);
router.get('/categories.html', site.categories);
router.get('/archives.html', site.archives);
router.get('/tags.html', site.tags);
router.get('/links.html', site.links);

//登陆,登出
router.get('/login', login.login);
router.post('/login', login.doLogin);
router.get('/logout', login.logout);

router.get('/posts/:postSlug.html', post.get);
router.post('/posts/:postId/comment', post.addComment);
//按指定标签查询文章
router.get('/tag/:slug', tag.index);
//按照分类查询分类下的文章
router.get('/category/:cateName', category.queryPostByName);
//查询指定用户下的文章
router.get('/author/:userId/:pn', user.queryPostByUser);

//管理后台
router.get('/admin/index', auth.userRequired, admin.index);
//个人信息
router.get('/admin/profile', auth.userRequired, admin.profile);
router.post('/admin/profile', auth.userRequired, admin.updateProfile);
//发布文章
router.get('/admin/write-post', auth.adminRequired, admin.writePost);
router.post('/admin/write-post', auth.adminRequired, admin.doWritePost);
//删除
router.post('/admin/delete-post', auth.adminRequired, admin.doDeletePost);
//管理文章
router.get('/admin/manage-posts', auth.adminRequired, admin.postList);
//管理评论
router.get('/admin/manage-comments', auth.adminRequired, admin.commentList);
router.get('/admin/comments-edit', auth.adminRequired, admin.commentMgr);
router.post('/admin/comments-edit', auth.adminRequired, admin.commentMgr);

//管理分类
router.get('/admin/manage-categories', auth.adminRequired, admin.categoryList);
router.post('/admin/categories-edit', auth.adminRequired, admin.categoryMgr);
router.get('/admin/category', auth.adminRequired, admin.createMeta);
router.post('/admin/category', auth.adminRequired, admin.doCreateMeta);

//管理标签
router.get('/admin/manage-tags', auth.adminRequired, admin.tagList);
router.post('/admin/metas-tag-edit', auth.adminRequired, admin.doSaveUpdateTag);
router.post('/admin/deleteTags', auth.adminRequired, admin.deleteTags);

//管理友链
router.get('/admin/links', auth.adminRequired, admin.links);
router.post('/admin/link', auth.adminRequired, admin.doSaveUpdateLink);
router.post('/admin/deleteLinks', auth.adminRequired, admin.deleteLinks);

//用户管理
router.get('/admin/manage-users', auth.adminRequired, admin.userList);
router.get('/admin/user', auth.adminRequired, admin.createUser);
router.post('/admin/user', auth.adminRequired, admin.doCreateUpdateUser);
router.post('/admin/deleteUsers', auth.adminRequired, admin.deleteUsers);

router.get('/pay/index', syk.index);
router.get('/wxpay/jsapi/', syk.prePay);
router.get('/wxorder', syk.testPrePayOrder);


module.exports = router;