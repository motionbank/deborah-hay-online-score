
var cellData = {}, cellViews = {}, cellViewsArr = [];
var categories = [];

var gridX = 4, gridY = 3;
var lastRatio = 0.0;

var gridHitTest = function (evt, elm) {
	var eX = evt.pageX, eY = evt.pageY-elm.position().top;
	
	var gridWidth = elm.width();
	var gridHeight = elm.height();
	var cellWidth = gridWidth / gridX;
	var cellHeight = gridHeight / gridY;

	var distTest = function ( a, b, m ) {
		return Math.abs( a - b ) <= m;
	}

	var xHit = distTest( eX, cellWidth, 5 );
	while ( !xHit && cellWidth < gridWidth ) {
		cellWidth += cellWidth;
		xHit = distTest( eX, cellWidth, 5 );
	}

	var yHit = distTest( eY, cellHeight, 5 );
	while ( !yHit && cellHeight < gridHeight ) {
		cellHeight += cellHeight;
		yHit = distTest( eY, cellHeight, 5 );
	}

	//console.log( xHit, yHit );

	return [ xHit, yHit, eX, eY, evt.pageY ];
}

var GridView = module.exports = Backbone.View.extend({

	el : '#grid-view',

	initialize : function () {

		cellData = require('data/cell-data');

		var CellView = require('js/views/cell-view');

		for ( var k in cellData ) {
			categories.push( k );
			var area = cellData[k];
			for ( var i = 0; i < area.length; i++ ) {
				
				var opts = area[i];
				opts['type'] = k;
				opts['preview'] = opts['preview'] === 'missing.jpg' ? opts['type']+'-'+i+'.jpg' : opts['preview'];
				
				cellViews[k] = cellViews[k] || [];
				cellViews[k].push( new CellView( opts, this ) );
				
				cellViewsArr.push( new CellView( opts, this ) );
			}
		}

		var self = this;	
		var selfEl = this.$el;
		var dragging = false;
		this.$el.mousedown(function(evt){
			var hit = gridHitTest( evt, selfEl );
			dragging = false;
			if ( hit[0] || hit[1] ) {
				dragging = hit;
				evt.preventDefault();
				return false;
			}
		});
		this.$el.mousemove(function(evt){
			if ( dragging ) {
				evt.preventDefault();
				if ( dragging[0] ) {
					var xDist = evt.pageX - dragging[2];
					if ( xDist < -20 ) {
						//console.log( 'Add column' );
						selfEl.css({cursor:'w-resize'});
					} else if ( xDist > 20 ) {
						//console.log( 'Remove column' );
						selfEl.css({cursor:'e-resize'});
					}
				} else if ( dragging[1] ) {
					var yDist = evt.pageY - dragging[4];
					if ( yDist < -20 ) {
						//console.log( 'Add row' );
						selfEl.css({cursor:'n-resize'});
					} else if ( yDist > 20 ) {
						//console.log( 'Remove row' );
						selfEl.css({cursor:'s-resize'});
					}
				}
			} else {
				var hit = gridHitTest( evt, selfEl );
				if ( hit[0] || hit[1] ) {
					selfEl.css({cursor:'move'});
				} else {
					selfEl.css({cursor:'default'});
				}
			}
		});
		this.$el.mouseup(function(evt){
			if ( dragging ) {
				evt.preventDefault();
				if ( dragging[0] ) {
					var xDist = evt.pageX - dragging[2];
					if ( xDist < -20 ) {
						jQuery( '.cell', selfEl ).removeClass( 'w'+gridX );
						gridX += 1;
						jQuery( '.cell', selfEl ).addClass( 'w'+gridX );
						self.setRatio( lastRatio );
					} else if ( xDist > 20 ) {
						jQuery( '.cell', selfEl ).removeClass( 'w'+gridX );
						gridX -= 1;
						jQuery( '.cell', selfEl ).addClass( 'w'+gridX );
						self.setRatio( lastRatio );
					}
				} else if ( dragging[1] ) {
					var yDist = evt.pageY - dragging[4];
					if ( yDist < -20 ) {
						jQuery( '.cell', selfEl ).removeClass( 'h'+gridY );
						gridY += 1;
						jQuery( '.cell', selfEl ).addClass( 'h'+gridY );
						self.setRatio( lastRatio );
					} else if ( yDist > 20 ) {
						jQuery( '.cell', selfEl ).removeClass( 'h'+gridY );
						gridY -= 1;
						jQuery( '.cell', selfEl ).addClass( 'h'+gridY );
						self.setRatio( lastRatio );
					}
				}
				dragging = false;
				selfEl.css({cursor:'default'});
			}
		});
	},

	setRatio : function ( ratio ) {

		var ratioScaled = ratio * 5;
		var ratioInt = parseInt( ratioScaled );
		if ( ratioInt >= categories.length ) ratioInt = categories.length-1;
		var ratioFrag = ratioScaled-ratioInt;
		var cat = categories[ratioInt];

		var tiles = gridX * gridY;

		var iFrom = Math.max( 0, parseInt( ratioFrag * (cellViews[cat].length-tiles) ) );
		var iTo = Math.min( iFrom + tiles, cellViews[cat].length-1 );
		_.each( cellViews, function(cvCat){ _.each( cvCat, function(cv){ cv.hide() } ) });
		for ( var i = iFrom; i < iTo; i++ ) {
			cellViews[cat][i].show();
		}

		// var iFrom = parseInt( ratio * (cellViewsArr.length-tiles) );
		// var iTo = iFrom + tiles;
		// _.each( cellViewsArr, function(cv, i){ cv.hide() });
		// for ( var i = iFrom; i < iTo; i++ ) {
		// 	cellViewsArr[i].show();
		// }

		lastRatio = ratio;
	}

});