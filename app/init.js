/**
 *	Main entry point for this site
 *
 *	TODO / REVISIT:
 *
 *	- make models for the menu structure/views
 *
 *	- structure views hirarchically:
 *		app
 *		 L -> top 
 *		 |	   L -> top content (menu pages)
 *		 L -> sub (menu) 
 *		 |	   L -> content (timeline, text block)
 *		 L -> page content (iframe, pages)
 *
 +	- replace direct calls with events: 
 *		app.changeScene() -> sup.on(change:scene, app.changeScene)
 *
 *	- application state:
 *		consists of: visual (interface) state, selection state (scene/performance), content state (camera)
 *		can either be complicated url, or stored on server by key
 */


jQuery(function(){

	var initializer = new (require('initializer'))();

	initializer.add( function(next){
		var app = new (require('js/app'))( initializer );
		jQuery('#content iframe').load(app.iframeLoaded);
		next();
	});

	initializer.add( 'later', function(next){
		Backbone.history.start();
		next();
	});
	
	initializer.start();
});
