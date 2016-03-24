/**
 * Created by zhangyanghong on 16/3/22.
 */

exports.getClientIP = function(req){
    var ipAddress;
    var headers = req.headers;
    var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
    forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    if(ipAddress === '::ffff:127.0.0.1'){
        return '127.0.0.1';
    }
    return ipAddress;
}