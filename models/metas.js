var db = require("./db");
var async = require('async');

var Metas = db.define('metas', {
    id:      {type: 'serial', key: true}, // the auto-incrementing primary key
    name:    {type: 'text', defaultValue:''},
    slug: {type: 'text', defaultValue:''},
    type:     {type: 'text', defaultValue:''},
    description: {type:'text', defaultValue:''},
    count: {type:'integer', defaultValue:''},
    order: {type:'integer', defaultValue:0},
    created:     {type: 'integer', size:10, defaultValue:0},
    updated:     {type: 'integer', size:10, defaultValue:0}
}, {
    methods : {
        isCategory: function() {
            return this.type === 'category';
        }
    }
});

var Meta = {};

/**
 * 根据id查询
 * @param linkId
 * @param cb
 */
Meta.getById = function(linkId, cb){
    Metas.get(linkId, function(err, metas) {
        cb(err, metas);
    });
};

/**
 * 根据id列表查询
 * @param ids
 * @param cb
 */
Meta.getByIds = function(ids, cb){
    Metas.find({id : ids}, function(err, metas) {
        cb(err, metas);
    });
};

Meta.queryAllTags = function(cb){
    Metas.find({type:'tag'}, "created", function(err, tags){
        cb(err, tags);
    });
};

/**
 * 查询所有分类信息
 * @param cb
 */
Meta.queryAllCates = function(cb){
    Metas.find({type:'category'}, "created", function(err, categorys){
        cb(err, categorys);
    });
};

/**
 * 根据id和类型查询原信息
 * @param metaIds
 * @param cb
 */
Meta.queryByIdsAndType = function(metaIds, type, cb){
    Metas.find({type : type}, "created", function(err, metas){
        cb(err, metas);
    });
};

/**
 * 根据缩略名查标签信息
 * @param slug
 * @param cb
 */
Meta.queryTagBySlug = function(slug, cb){
    Metas.find({slug:slug, type:'tag'}, function(err, tags){
        if(tags.length > 0){
            cb(err, tags[0]);
        }else{
            cb(err, null);
        }
    });
};

/**
 * 根据缩略名查分类信息
 * @param slug
 * @param cb
 */
Meta.queryCategoryBySlug = function(slug, cb){
    Metas.find({slug : slug, type : 'category'}, function(err, categorys){
        if(categorys.length > 0){
            cb(err, categorys[0]);
        }else{
            cb(err, null);
        }
    });
};


Meta.countAllCate = function(cb){
    Metas.count({type:'category'}, function(err, count){
        cb(err, count);
    });
};

/**
 *
 * @param mids
 * @param type
 * @param cb
 */
Meta.batchDelByType = function(mids, type, cb){
    Metas.find({id : mids, type : type}, function (err, metas) {
        if (err){
            return cb(err);
        }
        async.each(metas, function(meta, cb){
            meta.remove(function (err) {
                if (err){
                    return cb(err);
                }
                cb();
            });
        }, function(err){
            cb(err);
        });
    });
};

/**
 * 新建
 */
Meta.create = function(meta, cb){
    Metas.create(meta, function(err, newMeata){
        cb(err, newMeata);
    });
};

/**
 * 修改
 * @param meta
 * @param cb
 */
Meta.update = function(meta, cb){
    var mid = meta.id;
    Metas.get(meta.id, function(err, dbMeta){
        if(err){
            return cb(err);
        }
        if(!dbMeta){
            return cb(new Error('can not find meta with id' + mid));
        }
        dbMeta.name = meta.name;
        dbMeta.slug = meta.slug;
        dbMeta.parent = meta.parent || 0;
        dbMeta.description = meta.description || 0;
        //update
        dbMeta.save(function(err){
            cb(err);
        });
    });
};


module.exports = Meta;

