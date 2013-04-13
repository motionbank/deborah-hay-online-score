/**
 *	
 */

jQuery(function(){

	var initializer = new Initializer();
	var app = null;

	/*
	 + this slides the start screen
	 L + + + + + + + + + + + + + + + + + + + + + */
	var enterApp = function(){
		var $toolContainer = jQuery('#tool-container');
		var $logo = jQuery('#logo');

		var tcHeight = $toolContainer.outerHeight();
		$toolContainer.animate({
			marginTop: (-tcHeight)+'px'
		},{
			duration: 300, query: false,
			complete: function () {
				
			}
		});

		jQuery('img',$logo).animate({
			opacity: '0'
		},{
			duration: 300, query: false,
			start: function () {
				$logo.css({backgroundImage:'url(imgs/logo-dark.png)'});
			}
		});

		return false;
	};

	/*
	 +	make the li draggable, add clicks to menu
	 L + + + + + + + + + + + + + + + + + + + + + */
	var $mainMenuUl = jQuery('#main-menu ul');
	var $mainMenuSlider = jQuery( 'li.slider', $mainMenuUl ); // TODO: safari insists on the line being inside ul
	$mainMenuSlider.draggable({
		axis: 'x',
		containment: $mainMenuUl,
		start: function (evt, drag) {
		},
		stop: function (evt, drag) {
		},
		drag : function (evt, drag) {
		}
	});
	jQuery( 'li a', $mainMenuUl ).click(function(evt){
		evt.preventDefault();
		var $mainMenuLink = jQuery(this);
		$mainMenuSlider.animate({
			left: (($mainMenuLink.offset().left-$mainMenuUl.offset().left+$mainMenuLink.width()/2) - $mainMenuSlider.width()/2) + 'px'
		},{
			duration: 100
		});
	});

	/*
	 + initializations begin here
	 L + + + + + + + + + + + + + + + + + + + + + */

	initializer.add( function(next){
		app = new (require('js/app'))( initializer );
		next();
	});

	initializer.add( function(next){
		/* called from "enter" link on tool/splash screen */
		jQuery('#link-enter-app').click(enterApp);
		enterApp();
		next();
	});

	initializer.add( 'later', function(next){
		Backbone.history.start();
		next();
	});
	
	initializer.start();

	jQuery('#grid-view article.cell').each(function(i,e){
		var g = parseInt(130 + Math.random()*50);
		var c = 'rgb('+g+','+g+','+g+')';
		jQuery(e).css({
			backgroundColor: c
		});
	});
});
