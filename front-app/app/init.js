/**
 *	
 */

jQuery(function(){

	var initializer = new Initializer();
	var app = null;

	/*
	 + 	initializations begin here
	 +
	 L + + + + + + + + + + + + + + + + + + + + + */

	initializer.add( function initCreateApp (next){
		app = new (require('js/app'))( initializer, slider );
		next();
	});

	initializer.add( 'later', function initBBHistoryStart (next){
		Backbone.history.start();
		next();
	});
	
	initializer.start();

	/*
	 + 	listen for window changes, this is a tough nut
	 +
	 L + + + + + + + + + + + + + + + + + + + + + */

	jQuery(window).resize(function(){
		//console.log( 'window size changed' );
		app.sizeChanged();
	});
});
