
var CellModel = module.exports = Backbone.Model.extend({

	defaults : {
		title : 'Missing Title Here',
		type : 'missing-type'
	},

	initialize : function ( opts ) {
		this.set( opts );
	}

});