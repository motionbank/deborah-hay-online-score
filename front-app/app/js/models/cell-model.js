
var CellModel = module.exports = Backbone.Model.extend({

	defaults : {
		title : 'Missing Title Here',
		description: '',
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

				// TODO!
			if ( f.name == 'play-next' ) {
				self.set( 'play-next-key', 'vimeo-id' );
				self.set( 'play-next-value', f.value );
			} else {
				self.set( f.name, f.value );
			}

			// } else {
			// 	console.log( 'Possible cell field conflict: ', opts, f );
			// }

			//console.log( f );
		});
	}

});