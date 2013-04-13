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

	var $mainMenuUl = jQuery('#main-menu ul');
	var $mainMenuSlider = jQuery( 'li.slider', $mainMenuUl ); // TODO: safari insists on the line being inside ul
	var dragAreaWidth = $mainMenuUl.width();
	$mainMenuSlider.draggable({
		axis: 'x',
		containment: $mainMenuUl,
		cursor : 'pointer',
		start : function () {
			dragAreaWidth = $mainMenuUl.width() - $mainMenuSlider.width();
		},
		drag : function (evt, drag) {
			app.setRatio( drag.position.left / dragAreaWidth );
		},
		stop: function (evt, drag) {

		}
	});
	jQuery( 'li a', $mainMenuUl ).click(function(evt){
		evt.preventDefault();
		var $mainMenuLink = jQuery(this);
		var newLeft = ( ( $mainMenuLink.offset().left-$mainMenuUl.offset().left + $mainMenuLink.width()/2 ) 
					    - $mainMenuSlider.width()/2 );
		$mainMenuSlider.animate({
			left: newLeft + 'px'
		},{
			duration: 300,
			start : function () {
				dragAreaWidth = $mainMenuUl.width() - $mainMenuSlider.width();
			},
			step : function ( val ) {
				app.setRatio( val / dragAreaWidth );
			},
			complete : function ( val ) {
				app.setRatio( newLeft / dragAreaWidth );
			}
		});
	});
	var setRatio = function (r) {
		$mainMenuSlider.css({
			left: (r * ($mainMenuUl.width() - $mainMenuSlider.width())) + 'px'
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
			setRatio( Math.random() );
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
