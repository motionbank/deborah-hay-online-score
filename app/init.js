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
			complete: function () {
				setTimeout(function(){
					$mainMenuSliderLink.animate({height:'8px'},{duration:100});
				},200);
			}
		});

		jQuery('img',$logo).animate({
			opacity: '0'
		},{
			duration: dur, query: false,
			start: function () {
				$logo.css({backgroundImage:'url(imgs/logo-dark.png)'});
			}
		});

		return false;
	};

	/*
	 +	make the li draggable, add clicks to menu
	 +
	 L + + + + + + + + + + + + + + + + + + + + + */

	var $mainMenuContainer = jQuery('#main-menu-container');
	var $mainMenuSlider = jQuery( '#slider', $mainMenuContainer ); // TODO: safari insists on the line being inside ul
	var $mainMenuSliderLink = jQuery( 'a', $mainMenuSlider );
	var dragAreaWidth = $mainMenuContainer.width();
	var sliderIsDragging = false;
	$mainMenuSlider.draggable({
		axis: 'x',
		containment: $mainMenuContainer,
		cursor : 'pointer',
		start : function () {
			dragAreaWidth = $mainMenuContainer.width() - $mainMenuSlider.width();
			sliderIsDragging = true;
		},
		drag : function (evt, drag) {
			app.setRatio( drag.position.left / dragAreaWidth );
		},
		stop: function (evt, drag) {
			sliderIsDragging = false;
		}
	});
	$mainMenuSlider.hover(function(evt){
		$mainMenuSliderLink.animate({height: '72px'},{duration:100});
		$mainMenuSliderLink.css({cursor:'move'});
	},function(evt){
		if ( !sliderIsDragging ) {
			$mainMenuSliderLink.animate({height: '8px'},{duration:100});
			$mainMenuSliderLink.css({cursor:'default'});
		}
	});
	var setRatio = function (r) {
		$mainMenuSlider.css({
			left: (r * ($mainMenuContainer.width() - $mainMenuSlider.width())) + 'px'
		});
		app.setRatio( r );
	}

	/*
	 + 	initializations begin here
	 +
	 L + + + + + + + + + + + + + + + + + + + + + */

	initializer.add( function(next){
		app = new (require('js/app'))( initializer );
		next();
	});

	initializer.add( function(next){
		/* called from "enter" link on tool/splash screen */
		jQuery('#link-enter-app').click(enterApp);
		initializer.add( 'last', function (next) {
			setRatio( 0.25 + Math.random() * 0.5 );
			//enterApp();
			next();
		});
		next();
	});

	initializer.add( 'later', function(next){
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
});
