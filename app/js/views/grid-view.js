
var cellData = {}, cellViews = {}, cellViewsArr = [];
var categories = [];

var views = {};
var setUrls = [];

var cellBorderHandle = 5;
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

	var xHit = distTest( eX, 0, cellBorderHandle );
	while ( !xHit && cellWidth <= gridWidth ) {
		xHit = distTest( eX, cellWidth, cellBorderHandle );
		cellWidth += cellWidth;
	}

	var yHit = distTest( eY, 0, cellBorderHandle );
	while ( !yHit && cellHeight <= gridHeight ) {
		yHit = distTest( eY, cellHeight, cellBorderHandle );
		cellHeight += cellHeight;
	}

	//console.log( xHit, yHit );

	return [ xHit, yHit, eX, eY, evt.pageY ];
}

var GridView = module.exports = Backbone.View.extend({

	el : '#grid-view',

	initialize : function ( app ) {

		var self = this;

		setUrls = require('data/set-urls');

		app.getRouter().on('route:changeset',function(nextSetName){
			self.loadSet(nextSetName);
		});

		this.loadSet( '<front>' );
	},

	loadSet : function ( setUrl ) {

		if ( !setUrls || !setUrls[setUrl] ) {
			throw( 'Set could not be loaded: ' + setUrl );
			return;
		}

		cellData = require( 'data/'+setUrls[setUrl] );

		if ( !cellData ) {
			throw( 'Set could not be loaded: ' + setUrl );
			return;
		}

		views.CellView = views.CellView || require('js/views/cell-view');

		this.$el.html(''); // TODO: more sane way of cleaning up?

		cellViews = {};
		cellViewsArr = [];

		for ( var i = 0; i < cellData.cells.length; i++ ) {
			
			var opts = cellData.cells[i];
			opts['preview'] = opts['preview'] === 'missing.jpg' ? opts.type+'-'+i+'.jpg' : opts['preview'];
			
			var cv = new views.CellView( opts, this );

			cellViews[opts.type] = cellViews[opts.type] || [];
			cellViews[opts.type].push( cv );

			cellViewsArr.push( cv );
		}

		this.setRatio( 0.0 );
	},

	setRatio : function ( ratio ) {

		if ( !cellData ) return;

		var ratioScaled = ratio * 5;
		var ratioInt = parseInt( ratioScaled );
		if ( ratioInt >= categories.length ) ratioInt = categories.length-1;
		var ratioFrag = ratioScaled-ratioInt;
		var cat = categories[ratioInt];

		var tiles = gridX * gridY;

		// var iFrom = Math.max( 0, parseInt( ratioFrag * (cellViews[cat].length-tiles) ) );
		// var iTo = Math.min( iFrom + tiles, cellViews[cat].length-1 );
		// _.each( cellViews, function(cvCat){ _.each( cvCat, function(cv){ cv.hide() } ) });
		// for ( var i = iFrom; i < iTo; i++ ) {
		// 	cellViews[cat][i].show();
		// }

		var iFrom = parseInt( ratio * (cellViewsArr.length-tiles) );
		var iTo = iFrom + tiles;
		_.each( cellViewsArr, function(cv, i){ cv.hide() });
		for ( var i = iFrom; i < iTo; i++ ) {
			cellViewsArr[i].show();
		}

		lastRatio = ratio;
	}

});