module.exports = function (db, models, sync) {
	
	var model = db.define('fields',{
		name: {
			type: 'text',
			required: true
		},
		value: {
			type: 'text',
			required: true
		}
	},{
		cache: false
	});

	model.makeAssociations = function () {

	}

	model.doSync = function () {
		model.sync(function (err) {
			!err && console.log( 'Table "fields" synced.' );
		});
	}

	return model;
}