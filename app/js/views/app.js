var app = null;

var views = {};

var AppView = module.exports = Backbone.View.extend({
	
	el : '#top',

	initialize : function ( initializer, application ) {

		app = application;

		initializer.add( function(next){
			views.context = new (require('js/views/top-content/context'))();
			next();
		}, this );
	}

});