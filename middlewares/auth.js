/**
 * Created by zhangyanghong on 16/3/17.
 */

/**
 * 需要管理员权限
 */
exports.adminRequired = function (req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?redirectUrl=' + req.originalUrl);
    }
    //if (!req.session.user.isAdmin) {
    //    return res.render('admin/login', {  token:'123', error: '你需要管理员权限。' });
    //}
    next();
};

/**
 * 需要登录
 */
exports.userRequired = function (req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(403).send('forbidden!');
    }
    next();
};