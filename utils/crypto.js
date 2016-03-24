/**
 * Created by zhangyanghong on 16/3/16.
 */

var crypto = require('crypto');

const  HASH_ENCODING = "utf-8";

exports.encrypt = function (str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, HASH_ENCODING, 'hex');
    enc += cipher.final('hex');
    return enc;
};

exports.decrypt = function (str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', HASH_ENCODING);
    dec += decipher.final('utf8');
    return dec;
};

exports.md5 = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str, HASH_ENCODING);
    str = md5sum.digest("hex", HASH_ENCODING);
    return str;
};

exports.sha1 = function(str){
    var sha1 = crypto.createHash('sha1');
    sha1.update(str, HASH_ENCODING);
    str = sha1.digest('hex', HASH_ENCODING)
    return str;
};

exports.randomString = function (size) {
    size = size || 6;
    var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var max_num = code_string.length + 1;
    var new_pass = '';
    while (size > 0) {
        new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
        size--;
    }
    return new_pass;
};
