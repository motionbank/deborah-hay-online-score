var AppStateModel = module.exports = Backbone.Model.extend({

	localStorage: new Backbone.LocalStorage("AppStateModel"),

	defaults : {
		performances : [],
		scenes : [],
		camera : {},
		view : ''
	},

	
});