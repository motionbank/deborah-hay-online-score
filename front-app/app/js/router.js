/*
 +	A quite standard backbone router .. 
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

var Router = module.exports = Backbone.Router.extend({

	initialize : function () {
	},

	routes : {
		'set/:setname'  : 'changeset',
		'sets'			: 'selectset'
	}
	
});