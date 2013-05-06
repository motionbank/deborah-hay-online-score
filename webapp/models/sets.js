module.exports = function (db, models, sync) {

	var model = db.define('sets',{
		title : {
			type: 'text',
			required: true
		},
		description : {
			type: 'text',
			required: true
		},
		path : {
			type: 'text',
			required: true
		},
		thumb_s : {
			type: 'text'
		},
		thumb_m : {
			type: 'text'
		},
		thumb_l : {
			type: 'text'
		},
		grid_x : {
			type: 'number',
			required: true,
			rational: false,
			defaultValue: 3
		},
		grid_y : {
			type: 'number',
			required: true,
			rational: false,
			defaultValue: 3
		}
	},{
		cache: false
	});

	model.hasOne( 'creator', models.users, {required: true}, {reverse: 'sets'});

	model.hasMany( 'cells', models.cells, {}, {reverse: 'sets'});

	var titleToPath = function ( title ) {
		if (!title) return undefined;
		var path = title.replace(/[^\/0-9a-z]/ig,'-');
		path = path.replace(/^-+/,'').replace(/-+$/,'');
		return (path.length > 0 && path) || undefined;
	}

	model.sanitizeInput = function (params) {
		var rParams = {};
		rParams.title = params.title;
		rParams.description = params.description;
		rParams.path = params.path || (rParams.title && titleToPath(rParams.title));
		rParams.thumb_s = params.thumb_s;
		rParams.thumb_m = params.thumb_m;
		rParams.thumb_l = params.thumb_l;
		rParams.grid_x = params.grid_x;
		rParams.grid_y = params.grid_y;
		return rParams;
	}

	if ( sync === true ) {
		model.sync(function(err){
			!err && console.log( 'Table "sets" synced.' );
		});
	}
	return model;
}