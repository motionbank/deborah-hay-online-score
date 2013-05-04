module.exports = function (db, models, sync) {

	var model = db.define('cells',{
		type: {
			type: 'text',
			required: true
		},
		title: {
			type: 'text',
			required: true
		},
		preview: {
			type: 'text'
		}
	},{
		cache: false,
		autoFetch: true,
		validations: {
        	type: db.validators.insideList(
        		['text','title','recording','visualization','media','context','adaptation','resources'],
        		'Given "type" is not allowed'
        	)
        }
	});

	model.hasMany('fields',models.fields,{},{reverse:'cell'});

	if ( sync === true ) {
		model.sync(function (err) {
			!err && console.log( 'Table "cells" synced.' );
		});
	}

	model.sanitizeInput = function ( params ) {
		var rParams = {};
		rParams.type = params.type || 'title';
		rParams.title = params.title;
		rParams.preview = params.preview;
		return rParams;
	}

	return model;
}
