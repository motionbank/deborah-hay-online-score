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

	initializer.add( function initActivateLink (next){
		/* called from "enter" link on tool/splash screen */
		jQuery('#link-enter-app').click(function(){
			app.startApp();
			return false;
		});
		initializer.add( 'last', function initRandomSliderPosition (next) {
			//app.getSlider().setRatio( 0.25 + Math.random() * 0.5 );
			//enterApp();
			next();
		});
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
