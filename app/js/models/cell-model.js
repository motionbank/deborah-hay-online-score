
var CellModel = module.exports = Backbone.Model.extend({

	defaults : {
		title : 'Missing Title Here',
		type : 'missing-type',
		preview : null
	},

	initialize : function ( opts ) {
		this.set( opts );
		var self = this;
		_.map( opts.fields, function (f) {
			self.set( f.name, f.value );
		});
	}

});