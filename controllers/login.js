/**
 * Created by zhangyanghong on 16/3/16.
 */
var crypto = require("../utils/crypto");
var users = require("../models/users");

/**
 * 登陆页
 */
exports.login = function(req, res, next){
    res.render('admin/login', {token:'123', redirectUrl : req.query.redirectUrl});
};

/**
 * 登陆
 * @param req
 * @param res
 * @param next
 */
exports.doLogin = function(req, res, next){
    if(req.session.user){
        return res.redirect('/admin/index');
    }
    var userName = req.body.name;
    var password = req.body.password;
    var token = req.query.token;

    if(userName == null || password == null){
        res.redirect('/login');
        return;
    }

    users.getByName(userName, function(err, user){
        if (err){
            throw err;
        }
        if(!user){
            res.redirect('/login');
            return;
        }
        if(!crypto.md5(password.trim()) === user.password){
            res.redirect('/login');
            return;
        }
        req.session.user = user;
        var cookieVal = "name=" + user.name;
        res.cookie('ticket', cookieVal, {maxAge:1000*60*30, signed:true});
        if(req.body.redirectUrl){
            res.redirect(req.body.redirectUrl);
        } else{
            res.redirect('/admin/index');
        }
    });
};

/**
 * 登出
 * @param req
 * @param res
 * @param next
 */
exports.logout = function(req, res, next){
    var signCookies = req.signedCookies;
    for(var cookie in signCookies){
        res.clearCookie(cookie);
    }
    res.redirect("/");
};