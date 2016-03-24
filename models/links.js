var db = require("./db");

var Links = db.define('links', {
    id:      {type: 'serial', key: true}, // the auto-incrementing primary key
    name:    {type: 'text', defaultValue:''},
    url: {type: 'text', defaultValue:''},
    sort:     {type: 'text', defaultValue:''},
    image: {type:'text', defaultValue:''},
    description: {type:'text', defaultValue:''},
    user: {type:'text', defaultValue:''},
    order: {type:'integer', defaultValue:0},
    created:     {type: 'integer', size:10, defaultValue:0},
    updated:     {type: 'integer', size:10, defaultValue:0}
}, {
    methods : {
        fullName: function() {
            return this.name + ':' + this.url;
        }
    }
});

var Link = {};

Link.getById = function(linkId, cb){
    Links.get(linkId, function(err, link) {
        cb(err, link);
    });
};

Link.queryAllLinks = function(cb){
    Links.find({}, "created", function(err, links){
        cb(err, links);
    });
};

module.exports = Link;

