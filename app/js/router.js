/**
 */

var app = null;

var Router = module.exports = Backbone.Router.extend({

	initialize : function ( mainApp ) {
		app = mainApp;
	},

	routes : {
		'set/:setname' : 'changeset'
	}
	
});