
var cellData = {}, cellViews = {}, cellViewsArr = [];
var categories = [];

var views = {};
var setUrls = [];

var cellBorderHandle = 5;
var gridX = 4, gridY = 3;
var lastRatio = 0.0;

var app = null, setSelector = null;
$mainTitleLink = null;

var GridView = module.exports = Backbone.View.extend({

	el : '#grid-view',

	initialize : function ( mainapp ) {

		var self = this;
		app = mainapp;

		$mainTitleLink = jQuery('#main-title a');

		setUrls = require('data/set-urls');
		
		app.getSlider().on('change:slider',function(val){
			self.setRatio( val );
		});

		app.getRouter().on('route:changeset',function(nextSetName){
			self.loadSet(nextSetName);
		});

		this.loadSet( '<front>' );

		setSelector = new (require('js/views/select-set-view'))();
		setSelector.setGridView(self);
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

		$mainTitleLink.html( cellData.title );

		cellViews = {};
		cellViewsArr = [];

		gridX = cellData.grid.x;
		gridY = cellData.grid.y;

		var visibleCells = gridX*gridY;

		for ( var i = 0, g = visibleCells; i < cellData.cells.length; i++ ) {
			
			var opts = cellData.cells[i];
			opts['preview'] = opts['preview'] === 'missing.jpg' ? opts.type+'-'+i+'.jpg' : opts['preview'];
			opts['grid'] = cellData.grid || null;

			var cv = new views.CellView( opts, this );

			if ( i < g ) {
				cv.$el.show();
			}

			cellViews[opts.type] = cellViews[opts.type] || [];
			cellViews[opts.type].push( cv );

			cellViewsArr.push( cv );
		}

		if ( cellData.cells.length <= (gridX * gridY) ) {
			app.getSlider().hide();
		} else {
			app.getSlider().setSize( (visibleCells * 1.0) / cellData.cells.length );
			app.getSlider().setRatio( 0.0 );
			app.getSlider().show();
		}
	},

	setRatio : function ( ratio ) {

		if ( !cellData ) return;

		// var ratioScaled = ratio * 5;
		// var ratioInt = parseInt( ratioScaled );
		// if ( ratioInt >= categories.length ) ratioInt = categories.length-1;
		// var ratioFrag = ratioScaled-ratioInt;
		// var cat = categories[ratioInt];

		// var iFrom = Math.max( 0, parseInt( ratioFrag * (cellViews[cat].length-tiles) ) );
		// var iTo = Math.min( iFrom + tiles, cellViews[cat].length-1 );
		// _.each( cellViews, function(cvCat){ _.each( cvCat, function(cv){ cv.hide() } ) });
		// for ( var i = iFrom; i < iTo; i++ ) {
		// 	cellViews[cat][i].show();
		// }

		_.each( cellViewsArr, function(cv, i){ cv.hide() });

		var gridWidth = Math.ceil( cellViewsArr.length / gridY );
		var iFrom = Math.round( ratio * gridWidth );

		for ( var n = 0; n < gridY; n++ ) {
			for ( var i = 0; i < gridX; i++ ) {
				var m = n * gridWidth + i + iFrom;
				if ( m < cellViewsArr.length ) cellViewsArr[m].show();
			}
		}

		lastRatio = ratio;
	},

	getSetUrls : function () {
		return setUrls;
	},

	showSetSelector : function () {
		jQuery('#grid-view').hide();
		app.getSlider().hide();
		setSelector.show();
	},

	showSetEditor : function () {

	},

	showLink : function () {

	},

	show : function () {
		this.$el.show();
	}

});