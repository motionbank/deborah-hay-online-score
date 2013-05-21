
var CellModel = module.exports = Backbone.Model.extend({

	defaults : {
		title : 'Missing Title Here',
		type : 'missing-type',
		poster : null,
		/* each field in fields [] will be mapped to this.field_key = field_value */
		sets : [ /* sets it belongs to */ ]
	},

	initialize : function ( opts ) {
		this.set( opts );
		var self = this;
		_.map( opts.fields, function (f) {
			// if ( self.get( f.name ) === undefined ) {
				self.set( f.name, f.value );
			// } else {
			// 	console.log( 'Possible cell field conflict: ', opts, f );
			// }
		});
	}

});