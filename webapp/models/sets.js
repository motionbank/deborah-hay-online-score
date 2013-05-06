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
		thumb : {
			type: 'text'
		},
		grid_x : {
			type: 'number',
			required: true,
			rational: false
		},
		grid_y : {
			type: 'number',
			required: true,
			rational: false
		},
		grid_width : {
			type: 'number',
			required: true,
			rational: false
		},
		grid_height : {
			type: 'number',
			required: true,
			rational: false
		}
	},{
		cache: false
	});

	model.hasOne( 'creator', models.users, {required: true}, {reverse: 'sets'});

	model.hasMany( 'cells', models.cells, {
		/* options specific to this relation */
		x: {
			type: 'number',
			rational: false,
			required: true
		},
		y: {
			type: 'number',
			rational: false,
			required: true
		},
		width: {
			type: 'number',
			rational: false,
			required: true
		},
		height: {
			type: 'number',
			rational: false,
			required: true
		}
	}, {
		reverse: 'sets'
	});

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
		rParams.thumb = params.thumb;
		rParams.grid_x = params.grid_x;
		rParams.grid_y = params.grid_y;
		rParams.grid_width = params.grid_width;
		rParams.grid_height = params.grid_height;
		return rParams;
	}

	if ( sync === true ) {
		model.sync(function(err){
			!err && console.log( 'Table "sets" synced.' );
		});
	}
	return model;
}