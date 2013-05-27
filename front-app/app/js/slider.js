
var $mainMenuContainer 		= null,
	$mainMenuSlider 		= null,
	$mainMenuSliderLink 	= null,
	currentRatio 			= 0;

var SliderController = function( app ) {

	_.extend( this, Backbone.Events );

	var self = this;

	app.on( 'change:position', function (direction) {
		if ( direction === '<<' ) {
			stepOnce( 0.5, -1 );
		} else {
			stepOnce( 0.5,  1 );
		}
	});

	var stepOnce = function ( len, dir ) {
		var sliderWidth = $mainMenuSliderLink.width();
		var step = sliderWidth / ($mainMenuContainer.width() * 1.0 - sliderWidth);
		var nextRatio = currentRatio + (step * len) * dir;
		if ( nextRatio >= 0 && nextRatio <= 1 ) {
			self.setPosition( nextRatio );
		} else if ( nextRatio > 1 && currentRatio !== 1 ) {
			self.setPosition( 1 );
		}  else if ( nextRatio < 0 && currentRatio !== 0 ) {
			self.setPosition( 0 );
		}
	};

	$mainMenuContainer = jQuery('#main-menu-container');
	$mainMenuSlider = jQuery( '#slider', $mainMenuContainer ); // TODO: safari insists on the line being inside ul
	$mainMenuSliderLink = jQuery( 'a', $mainMenuSlider );

	var dragAreaWidth = $mainMenuContainer.width();
	var isDragging = false, isHover = false;

	$mainMenuSlider.draggable({
		axis: 'x',
		containment: $mainMenuContainer,
		cursor : 'pointer',
		start : function () {
			dragAreaWidth = $mainMenuContainer.width() - $mainMenuSlider.width();
			isDragging = true;
		},
		drag : function (evt, drag) {
			self.setPosition( drag.position.left / dragAreaWidth );
		},
		stop: function (evt, drag) {
			isDragging = false;
			if ( !isHover ) {
				//$mainMenuSliderLink.animate({height: '8px'},{duration:100});
				$mainMenuSliderLink.css({cursor:'default'});
			}
		}
	});

	$mainMenuSlider.hover(function(evt){
		isHover = true;
		//$mainMenuSliderLink.animate({height: '72px'},{duration:100});
		$mainMenuSliderLink.css({cursor:'move'});
	},function(evt){
		isHover = false;
		if ( !isDragging ) {
			//$mainMenuSliderLink.animate({height: '8px'},{duration:100});
			$mainMenuSliderLink.css({cursor:'default'});
		}
	});

	jQuery(window).keydown(function(evt){
		if ( evt.which == 37 ) {
			stepOnce( 0.5, -1 );
		} else if ( evt.which == 39 ) {
			stepOnce( 0.5,  1 );
		}
	});

	this.setSize( 0.1 );
};

SliderController.prototype = {
	setPosition : function (r,trigger) {
		if ( r < 0 || r > 1 ) {
			throw( 'Bad parameter for setPosition()' ); return;
		}
		$mainMenuSlider.css({
			left: (r * ($mainMenuContainer.width() - $mainMenuSliderLink.width())) + 'px'
		});
		if ( trigger === undefined || trigger === true )
			this.trigger('change:slider',r);
		currentRatio = r;
	},
	setSize : function ( r ) {
		if ( r < 0 || r > 1 ) {
			throw( 'Bad parameter for setSize() ' + r ); return;
		}
		if ( r == 1 ) return this.hide();

		var containerWidth = $mainMenuContainer.width();
		var sliderWidth = $mainMenuSliderLink.width();

		var sizePx = r * containerWidth;
		if ( sizePx < 10 ) sizePx = 10;

		$mainMenuSliderLink.css({width: sizePx});

		// TODO: reset ratio
	},
	show : function () {
		$mainMenuSlider.show();
	},
	hide : function () {
		$mainMenuSlider.hide();
	}
};

module.exports = SliderController;
