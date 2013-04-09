/**
 *	This is the main application router.
 */

var app = null;

var Router = module.exports = Backbone.Router.extend({

	initialize : function ( parentApp ) {
		app = parentApp;
	},

	routes : {
		// "views/tester" : function () {
		// 	jQuery('#content iframe').attr('src','iframe.html');
		// },
		// "performances/:performer(/:id)" : function ( key, id ) {
		// 	if ( id ) {
		// 		app.setPerformancesById( id.split("-") );
		// 	} else {
		// 		app.setPerformancesByKey( key );
		// 	}
		// },
		// "text/:scene(/:page)" : function ( scene, page ) {
		// 	app.setScenes( scene, page );
		// }
	}
	
});