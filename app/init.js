/**
 *	
 */


jQuery(function(){

	var initializer = new Initializer();

	initializer.add( function(next){
		var app = new (require('js/app'))( initializer );
		next();
	});

	initializer.add( 'later', function(next){
		Backbone.history.start();
		next();
	});
	
	initializer.start();
});
