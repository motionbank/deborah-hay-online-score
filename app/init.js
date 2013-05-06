/**
 *	
 */

jQuery(function(){

	var initializer = new Initializer();
	var app = null;

	/*
	 + 	this slides the start screen
	 +
	 L + + + + + + + + + + + + + + + + + + + + + */

	var enterApp = function(){
		var $toolContainer = jQuery('#tool-container');
		var $logo = jQuery('#logo');

		var tcHeight = $toolContainer.outerHeight();
		var dur = 550;
		$toolContainer.animate({
			marginTop: (-tcHeight)+'px'
		},{
			duration: dur, query: false,
			complete: function enterAppAnimateSlideComplete (){
				setTimeout(function enterAppAnimateSlider (){
					$mainMenuSliderLink.animate({height:'8px'},{duration:100});
				},200);
				$toolContainer.hide();
			}
		});

		jQuery('img',$logo).animate({
			opacity: '0'
		},{
			duration: dur, query: false,
			start: function enterAppAnimateLogoStart () {
				$logo.css({backgroundImage:'url(imgs/logo-dark.png)'});
			}
		});

		return false;
	};

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
		jQuery('#link-enter-app').click(enterApp);
		initializer.add( 'last', function initRandomSliderPosition (next) {
			app.getSlider().setRatio( 0.25 + Math.random() * 0.5 );
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

	// jQuery('#grid-view article.cell').each(function(i,e){
	// 	var g = parseInt(130 + Math.random()*50);
	// 	var c = 'rgb('+g+','+g+','+g+')';
	// 	jQuery(e).css({
	// 		backgroundColor: c
	// 	});
	// });

	/*
	 + 	listen for window changes, this is a tough nut
	 +
	 L + + + + + + + + + + + + + + + + + + + + + */

	jQuery(window).resize(function(){
		//console.log( 'window size changed' );
	});
});
