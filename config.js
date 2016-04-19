/**
 * Created by zhangyanghong on 16/3/16.
 */

var config = {
    // debug 为 true 时，用于本地调试
    debug : true,
    name: 'java 小沙弥的个人站', // 社区名字
    description: '一个喜欢折腾技术的小沙弥的技术博客',
    keywords: 'JAVA,分布式,大数据,Linux,缓存,分布式架构,Golang,Nodejs',

    //session 和 cookie 加密配置
    session_secret : "godisagirl",
    cookie_sign : "php'sthebestlanguageintheworld",

    //mysql 配置
    dbUrl : 'mysql://root:1q2w3e4r@127.0.0.1:3306/leoNode',
    dbOpt : {
        pool : true,
        showSql  : false,
        connectTimeout : 50000,
        debug : true
    },

    // redis 配置，默认是本地
    redis_host : '127.0.0.1',
    redis_port : 6379,
    redis_db : 0,

    hostname : 'www.leokongwq.net',
    // 程序运行的端口
    port : 3000
};

module.exports = config;