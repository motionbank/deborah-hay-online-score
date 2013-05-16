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
		poster : {
			type: 'text',
			required : true,
			defaultValue : 'missing.jpg'
		},
		grid_cols : {
			type: 'number',
			required: true,
			rational: false,
			defaultValue: 0
		},
		grid_rows : {
			type: 'number',
			required: true,
			rational: false,
			defaultValue: 0
		},
		cell_width : {
			type: 'number',
			required: true,
			rational: false,
			defaultValue: 320
		},
		cell_height : {
			type: 'number',
			required: true,
			rational: false,
			defaultValue: 240
		}
	},{
		cache: false
	});

	model.makeAssociations = function ( models ) {
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
				required: true,
				defaultValue: 1
			},
			height: {
				type: 'number',
				rational: false,
				required: true,
				defaultValue: 1
			}
		}, {
			reverse: 'sets'
		});
	}

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
		rParams.poster = params.poster;
		rParams.grid_cols = params.grid_cols;
		rParams.grid_rows = params.grid_rows;
		rParams.cell_width = params.cell_width;
		rParams.cell_height = params.cell_height;
		return rParams;
	}

	model.posterSizes = [
		{ name: 'medium', size: { height: 100 } },
		{ name: 'small', size: { height: 50 } }
	];

	model.doSync = function () {
		model.sync(function(err){
			!err && console.log( 'Table "sets" synced.' );
		});
	}

	return model;
}