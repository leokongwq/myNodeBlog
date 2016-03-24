/**
 * Created by zhangyanghong on 16/3/17.
 */
var request = require('request');
var url = require("url");
var crypto = require('../utils/crypto');
var moment = require("moment");

var xml2Js = require('xml2js');
var parseString = xml2Js.parseString;

var appId = "wx9f965393f4b60aa3";
var mch_id = "1306086001";
var secret = "0721ea87848ce34e9d5a1085e9bd0a0e";
var apiKey = "SYK14159265shangyiku13426193988g";

var randStr = crypto.randomString();

exports.index = function(req, res, next){

    var data = "<xml> <appid>wx9f965393f4b60aa3</appid> <body>apple 6s plus 白色 64G</body> <mch_id>1306086001</mch_id> <nonce_str>gLHLLy</nonce_str> <notify_url>http://www.shangyiku.cn/pay/notify</notify_url> <openid>oAbuyv-izJmG7e5F6IpzNCURAZuA</openid> <out_trade_no>AGqPRW</out_trade_no> <spbill_create_ip>36.110.75.2</spbill_create_ip> <total_fee>1</total_fee> <trade_type>JSAPI</trade_type> <sign>5F4BBE2249A4551ECBA5909F4428088C</sign> </xml>";
    parseString(data, function(err, result) {
        return res.end(JSON.stringify(result));
    });

    return res.end(crypto.sha1("jsapi_ticket=kgt8ON7yVITDhtdwci0qeTKlD9Gg2W1EIbSmURnbeI0hcpMETCz-YjAIxbVowGE4lGRFwRiM2s3ZYJpqtGHsRg&noncestr=RginL1&timestamp=1458293898&url=http://www.shangyiku.cn/wxpay?code=041121dd82d2cd60c763b1cc51e1b1d5&state=456123456"));

    var getTokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + secret;

    request(getTokenUrl, function (error, response, data) {
        if (error){
            return next(error);
        }
        if (data.errcode){
            return res.end(" get access_token error", "utf-8");
        }
        console.log(data);
        var access_token = JSON.parse(data).access_token;
        var timstamp = moment().unix();
        var jsSingUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=" + access_token;

        console.log(jsSingUrl);

        request(jsSingUrl, function(error, response, jsSignData){
            if (error){
                return next(error);
            }
            console.log(jsSignData);
            jsSignData = JSON.parse(jsSignData);
            if (jsSignData.errcode !== 0){
                return res.end(" get jsSign error", "utf-8");
            }
            var curtUrl = "http://www.shangyiku.cn/pay/index";
            var toSignStr = "jsapi_ticket=" + jsSignData.ticket + "&noncestr=" + randStr + "&timestamp=" + timstamp +"&url=" + curtUrl;
            signature = crypto.sha1(toSignStr);
            var pageData = {
                appId : appId,
                timestamp : timstamp,
                nonceStr : randStr,
                signature : signature,
                jsApiList : ['chooseWXPay'],
                access_token : access_token
            };
            console.log(pageData);
            res.render('payindex', pageData);
        });
    });
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
exports.prePay = function(req, res, next){

    console.log(req.originalUrl);
    //获取api访问access_token
    var code = req.query.code; //授权码
    var state = req.query.state;
    //获取access_token
    var getAccessTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appId + "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code";
    console.log("getAccessTokenUrl == " + getAccessTokenUrl);
    request(getAccessTokenUrl, function(err, response, openJsonStr){
        console.log(openJsonStr);
        if(err){
            return next(err);
        }
        //return res.end(openJsonStr);

        var authAccessTokeJson = JSON.parse(openJsonStr);
        var authAccessToken = authAccessTokeJson.access_token;
        var openid = authAccessTokeJson.openid;

        var tokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + secret;
        request(tokenUrl, function(error, response, retJsonStr){
            if(err){
                return next(err);
            }
            var accessTokenJson = JSON.parse(retJsonStr);
            if (!accessTokenJson.access_token){
                return res.end("accessToken request error : " + retJsonStr);
            }
            //获取jsticket
            var access_token = accessTokenJson.access_token;
            var jsSingUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=" + access_token;
            console.log(jsSingUrl);
            request(jsSingUrl, function(error, response, jsSignData){
                if (error){
                    return next(error);
                }
                jsSignData = JSON.parse(jsSignData);
                console.log(jsSignData);

                if (jsSignData.errcode !== 0){
                    return res.end(" get jsSign error" + jsSignData , "utf-8");
                }
                var timstamp = moment().unix();
                var nonceStr = crypto.randomString();

                var curtUrl = "http://www.shangyiku.cn/wxpay/jsapi/?code=" + code + "&state=" + state ;
                var toSignStr = "jsapi_ticket=" + jsSignData.ticket + "&noncestr=" + nonceStr + "&timestamp=" + timstamp +"&url=" + curtUrl;
                console.log("toSignStr==" + toSignStr);
                signature = crypto.sha1(toSignStr);

                //页面初始化使用的数据
                var pageData = {
                    appId : appId,
                    timestamp : timstamp,
                    nonceStr : nonceStr,
                    signature : signature,
                    jsApiList : ['chooseWXPay'],
                    accessToken : access_token
                };
                console.log(pageData);

                //生产预支付单
                var unifiedOrderUrl = "https://api.mch.weixin.qq.com/pay/unifiedorder";
                var now = moment().unix();
                var time_start = moment.unix(now).format('YYYYMMDDHHmmss');
                var time_expire = moment.unix(now + 60 * 60).format('YYYYMMDDHHmmss');

                var orderNo = now + crypto.randomString();
                var formData = {
                    appid : appId,
                    mch_id : mch_id,
                    nonce_str : nonceStr,
                    body : 'apple 6s plus 白色 64G',
                    out_trade_no :  orderNo,
                    total_fee : 1,
                    spbill_create_ip : '36.110.75.2',
                    notify_url : 'http://www.shangyiku.cn/pay/notify',
                    trade_type : 'JSAPI',
                    openid : openid
                };
                //签名
                formData.sign = getSignStr(formData, apiKey);
                var builder = new xml2Js.Builder();
                var xml = builder.buildObject(formData);
                //调用统一下支付单接口
                var reqOpt = {
                    url :  unifiedOrderUrl,
                    method : 'post',
                    headers : { 'Content-Type' : 'application/xml'},
                    body : xml
                };
                request.post(reqOpt, function(err, response, data){
                    if(err){
                        return next(err);
                    }
                    console.log("order ret xml : " + data);
                    parseString(data, function(err, result){
                        if(err){
                            return next(err);
                        }
                        var prepay_id = result.xml.prepay_id[0];
                        var timeStamp = moment().unix();
                        var nonceStr = crypto.randomString();
                        //组织页面支付数据
                        var payInfo = {
                            appId : appId,
                            timeStamp : timeStamp,
                            nonceStr : nonceStr,
                            package : 'prepay_id=' + prepay_id,
                            signType : "MD5"
                        };
                        payInfo.paySign = getSignStr(payInfo, apiKey);
                        var data = {
                            config : pageData,
                            payInfo : payInfo
                        };
                        res.render('payindex', data);
                    });
                });
            });
        });
    });
};


/**
 * 统一支付签名方法
 * @param toSignData
 * @param signKey
 * @returns {string}
 */
function getSignStr(toSignData, signKey){
    var keys = Object.keys(toSignData);
    keys = keys.sort();
    var toSignStr = "";
    for (var i = 0; i < keys.length; i++){
        if(!toSignData[keys[i]]){
            continue;
        }
        toSignStr += keys[i] + "=" + toSignData[keys[i]] + "&";
    }
    toSignStr = toSignStr + "key=" + signKey;
    console.log("before sign : " + toSignStr);
    return crypto.md5(toSignStr).toUpperCase();
}


exports.testPrePayOrder = function(req, res, next){

    return res.end(crypto.sha1("appid=wx9f965393f4b60aa3&body=apple 6s plus 白色 64G&mch_id=1306086001&nonce_str=gLHLLy&notify_url=http://www.shangyiku.cn/pay/notify&openid=oAbuyv-izJmG7e5F6IpzNCURAZuA&out_trade_no=AGqPRW&spbill_create_ip=36.110.75.2&total_fee=1&trade_type=JSAPI&key=SYK14159265shangyiku13426193988g"));

    var unifiedOrderUrl = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    var xml = "<xml> <appid>wx9f965393f4b60aa3</appid> <body>apple 6s plus 白色 64G</body> <mch_id>1306086001</mch_id> <nonce_str>gLHLLy</nonce_str> <notify_url>http://www.shangyiku.cn/pay/notify</notify_url> <openid>oAbuyv-izJmG7e5F6IpzNCURAZuA</openid> <out_trade_no>AGqPRW</out_trade_no> <spbill_create_ip>36.110.75.2</spbill_create_ip> <total_fee>1</total_fee> <trade_type>JSAPI</trade_type> <sign>5F4BBE2249A4551ECBA5909F4428088C</sign> </xml>";
    //调用统一下支付单接口
    var reqOpt = {
        url :  unifiedOrderUrl,
        method : 'post',
        headers : { 'Content-Type' : 'application/xml'},
        body : xml
    };
    request.post(reqOpt, function(err, response, data){
        console.log(data);
        if(err){
            return next(err);
        }
        var jsonRet = parseString(data, function(err, result){
            if(err){
                return next(err);
            }
            res.status(200).send(result);
        });
    });
};

function buildPayOrderSignStr(formData){
    var keys = [];
    for (var key in formData){
        if(formData[key]){
            keys.push(key);
        }
    }
    keys = keys.sort();
    var toSignStr = "";
    for (var key in keys){
        toSignStr += key + "=" + formData[key] + "&";
    }
    console.log("#######" + toSignStr);
    return toSignStr;
}

