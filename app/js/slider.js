
var app = null;
var $mainMenuContainer = $mainMenuSlider = $mainMenuSliderLink = null;
var currentRatio = 0;

var SliderController = function( app ) {

	_.extend( this, Backbone.Events );

	var self = this;

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
			self.setRatio( drag.position.left / dragAreaWidth );
		},
		stop: function (evt, drag) {
			isDragging = false;
			if ( !isHover ) {
				$mainMenuSliderLink.animate({height: '8px'},{duration:100});
				$mainMenuSliderLink.css({cursor:'default'});
			}
		}
	});

	$mainMenuSlider.hover(function(evt){
		isHover = true;
		$mainMenuSliderLink.animate({height: '72px'},{duration:100});
		$mainMenuSliderLink.css({cursor:'move'});
	},function(evt){
		isHover = false;
		if ( !isDragging ) {
			$mainMenuSliderLink.animate({height: '8px'},{duration:100});
			$mainMenuSliderLink.css({cursor:'default'});
		}
	});

	jQuery(window).keydown(function(evt){
		if ( evt.which == 37 ) {
			self.backwards();
		} else if ( evt.which == 39 ) {
			self.forwards();
		}
	});

	this.setSize( 0.1 );
};

SliderController.prototype = {
	setRatio : function (r) {
		if ( r < 0 || r > 1 ) {
			throw( 'Bad parameter for setRatio()' ); return;
		}
		$mainMenuSlider.css({
			left: (r * ($mainMenuContainer.width() - $mainMenuSliderLink.width())) + 'px'
		});
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
	forwards : function () {
		var step = $mainMenuSliderLink.width() / $mainMenuContainer.width();
		var nextRatio = currentRatio + step;
		if ( nextRatio <= 1 ) {
			this.setRatio( nextRatio );
		} else if ( currentRatio !== 1 ) {
			this.setRatio( 1 );
		}
	},
	backwards : function () {
		var step = $mainMenuSliderLink.width() / $mainMenuContainer.width();
		var nextRatio = currentRatio - step;
		if ( nextRatio >= 0 ) {
			this.setRatio( nextRatio );
		} else if ( currentRatio !== 0 ) {
			this.setRatio( 0 );
		}
	},
	show : function () {
		$mainMenuSlider.show();
	},
	hide : function () {
		$mainMenuSlider.hide();
	}
};

module.exports = SliderController;
