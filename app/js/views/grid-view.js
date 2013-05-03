
var cellData = {}, cellViews = {}, cellViewsArr = [];
var categories = [];

var views = {};

var currentCollection = [];
var currentSet = null;

var cellBorderHandle = 5;
var gridX = 4, gridY = 3;
var lastRatio = 0.0;

var app = null, setSelectorView = null;
$mainTitleLink = null;

var clickedCell = null;

var GridView = module.exports = Backbone.View.extend({

	el : '#grid-view',

	initialize : function ( mainapp ) {

		var self = this;
		app = mainapp;

		$mainTitleLink = jQuery('#main-title a');
		
		app.getSlider().on('change:slider',function(val){
			self.setRatio( val );
		});

		app.getRouter().on('route:changeset',function(nextSetName){
			self.loadSet(nextSetName);
		});

		setSelectorView = new (require('js/views/select-set-view'))(self, app);
	},

	loadSet : function ( setUrl ) {
		
		var set = app.getSet( setUrl );

		if ( !set ) {
			throw( 'Set could not be loaded: ' + setUrl );
			return;
		}

		if ( currentSet === set ) return;

		if ( !set.cells ) {
			var self = this;
			jQuery.ajax({
				url:'http://localhost:5555/sets/'+set.id,
				dataType:'json',
				success:function(data){
					set.cells = data.cells;
					console.log(set.cells);
					self.loadSet( set.path );
				},
				error:function(err){
					throw(err);
				}
			});
			return;
		}

		currentSet = set;

		_.each( cellViewsArr, function(cv, i){ cv.deactivate(); cv.hide(); });

		views.CellView = views.CellView || require('js/views/cell-view');

		this.$el.html(''); // TODO: more sane way of cleaning up?

		$mainTitleLink.html( currentSet.title );

		cellViews = {};
		cellViewsArr = [];
		clickedCell = null;

		gridX = currentSet.grid_x;
		gridY = currentSet.grid_y;

		var visibleCells = gridX*gridY;
		for ( var i = 0, g = visibleCells; i < currentSet.cells.length; i++ ) {

			try {
				views[opts.type] = views[opts.type] || require('js/views/cell-view-'+opts.type);
			} catch (e) {}
			
			var opts = currentSet.cells[i];
			opts['preview'] = opts['preview'] === 'missing.jpg' ? opts.type+'-'+i+'.jpg' : opts['preview'];
			opts['grid'] = {x:currentSet.grid_x, y:currentSet.grid_y};

			var cv = new ( views[opts.type] || views.CellView )( opts, this );

			if ( i < g ) {
				cv.show();
			}

			cellViews[opts.type] = cellViews[opts.type] || [];
			cellViews[opts.type].push( cv );

			cellViewsArr.push( cv );
		}

		if ( currentSet.cells.length <= (gridX * gridY) ) {
			app.getSlider().hide();
		} else {
			app.getSlider().setSize( (visibleCells * 1.0) / currentSet.cells.length );
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

		var gridWidth = Math.ceil( cellViewsArr.length / gridY );
		var iFrom = Math.round( ratio * (gridWidth-gridX) );

		var toShow = [];
		for ( var n = 0; n < gridY; n++ ) {
			for ( var i = 0; i < gridX; i++ ) {
				var m = n * gridWidth + i + iFrom;
				if ( m < cellViewsArr.length ) toShow.push(m);
			}
		}

		_.each( cellViewsArr, function(cv, i){ if ( toShow.indexOf(i) === -1 ) cv.hide(); else cv.show(); });

		lastRatio = ratio;
	},

	// getCollection : function () {
	// 	return currentCollection;
	// },

	toggleSetSelector : function () {
		if ( jQuery('#grid-view').css('display') === 'block' ) {
			app.getSlider().hide();
			setSelectorView.show();
			jQuery('#grid-view').hide();
		} else {
			setSelectorView.hide();
			app.getSlider().show();
			jQuery('#grid-view').show();
		}
	},

	toggleSetEditor : function () {

	},

	toggleLink : function () {

	},

	show : function () {
		this.$el.show();
		if ( cellData.cells && cellData.cells.length > (gridX * gridY) ) { // if returning to same as before
			app.getSlider().show();
		}
	},

	deactivateAll : function () {
		if ( cellData && cellViewsArr ) {
			for ( var i = 0; i < cellViewsArr.length; i++ ) {
				cellViewsArr[i].deactivate();
			}
		}
	},

	setClicked : function ( cell ) {
		clickedCell = cell.cid;
	},

	playNext : function ( prevCellView ) {
		var i = cellViewsArr.indexOf( prevCellView );
		if ( i === -1 ) return;
		var n = i+1;
		n %= cellViewsArr.length;
		if ( cellViewsArr[n].cid === clickedCell ) return;
		while ( cellViewsArr[n].isVisible === false 
				|| cellViewsArr[n].$el.hasClass('type-context') !== true ) {
			n++;
			n %= cellViewsArr.length;
			if ( n === i ) return;
			if ( cellViewsArr[n].cid === clickedCell ) return;
		}
		cellViewsArr[n].activate();
	},

	getApp : function () {
		return app;
	}

});