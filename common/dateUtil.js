/**
 * Created by zhangyanghong on 16/3/17.
 */

var moment = require("moment");

/**
 * 返回以秒为单位的时间戳
 * @returns {Number}
 */
exports.getNowInt = function (){
  return moment().unix();
};

/**
 * 将字符串表示的日期转为整数时间戳
 * @param dateStr
 * @param format
 */
exports.parseDateToInt = function(dateStr, format){
    var nowIntTime = moment(dateStr, format).unix();
    return nowIntTime;
};

exports.unixToDateStr = function(timestamp, format){
    if(!format){
        return moment.unix(timestamp).format('YYYY-MM-DD');
    }
    return moment.unix(timestamp).format(format);
};