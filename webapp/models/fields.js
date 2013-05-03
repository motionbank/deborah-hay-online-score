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

	if ( sync === true ) {
		model.sync(function (err) {
			!err && console.log( 'Table "fields" synced.' );
		});
	}

	return model;
}