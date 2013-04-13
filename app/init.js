/**
 *	
 */

jQuery(function(){

	var initializer = new Initializer();
	var app = null;

	initializer.add( function(next){
		app = new (require('js/app'))( initializer );
		next();
	});

	initializer.add( function(next){
		/* called from "enter" link on tool/splash screen */
		jQuery('#link-enter-app').click(function(){
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
		});
		next();
	});

	initializer.add( 'later', function(next){
		Backbone.history.start();
		next();
	});
	
	initializer.start();
});
