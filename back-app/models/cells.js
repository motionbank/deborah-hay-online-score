module.exports = function (db, models, sync) {

	var cellTypes = ['text','title','recording','visualization',
					 'media','context','adaptation','resources'];

	var model = db.define('cells',{
		type: {
			type: 'text',
			required: true
		},
		title: {
			type: 'text',
			required: true
		},
		poster: {
			type: 'text',
			required : true,
			defaultValue : 'missing.jpg'
		}
	},{
		cache: false,
		autoFetch: true,
		validations: {
        	type: db.validators.insideList(
        		cellTypes,
        		'Given "type" is not allowed'
        	)
        }
	});

	model.cellTypes = function () {
		return cellTypes;
	}

	model.posterSizes = [
		{ name: 'medium', size: { height: 250, width: 250 } },
		{ name: 'small',  size: { height: 75,  width: 75  } }
	];

	model.hasMany( 'fields', models.fields, {}, {
		reverse:'cell'
	});

	if ( sync === true ) {
		model.sync(function (err) {
			!err && console.log( 'Table "cells" synced.' );
		});
	}

	model.sanitizeInput = function ( params ) {
		var rParams = {};
		rParams.type = params.type || 'title';
		rParams.title = params.title;
		rParams.poster = params.poster;
		return rParams;
	}

	return model;
}
