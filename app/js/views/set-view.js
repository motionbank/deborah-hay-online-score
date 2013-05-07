
var cellData = {}, cellViews = {}, cellViewsArr = [];
var categories = [];

var views = {};

var currentCollection = [];
var currentSet = null;

var cellBorderHandle = 5;
var gridX = 4, gridY = 3;
var cellWidth, cellHeight;
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
		
		app.getSlider().on( 'change:slider',function bbChangeSliderCB (val){
			self.setRatio( val );
		});

		app.getRouter().on( 'route:changeset',function bbRouteChangeSetCB (nextSetName){
			self.loadSet(nextSetName);
		});

		setSelectorView = new (require('js/views/select-set-view'))(self, app);

		this.$el.on('swipe', function (event) {
			event.preventDefault();
			if ( event.direction == 'right' ) {
				app.getSlider().forwards();
			} else if ( event.direction == 'left' ) {
				app.getSlider().backwards();
			}
		});
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
				url: (app.isLocal() ? 'http://localhost:5555' : 'http://deborah-hay-app.eu01.aws.af.cm') + '/sets/' + set.id,
				dataType:'json',
				success:function(data){
					set.cells = data.cells;
					self.loadSet( set.path );
				},
				error:function(err){
					throw(err);
				}
			});
			return;
		}

		_.each( cellViewsArr, function(cv, i){ cv.deactivate(); cv.hide(); });

		currentSet = set;
		this.updateGridDimensions();

		views.CellView = views.CellView || require('js/views/cell-view');

		this.$el.html(''); // TODO: more sane way of cleaning up?

		$mainTitleLink.html( currentSet.title );

		cellViews = {};
		cellViewsArr = [];
		clickedCell = null;

		var visibleCells = gridX*gridY;
		for ( var i = 0, g = visibleCells; i < currentSet.cells.length; i++ ) {

			try {
				views[opts.type] = views[opts.type] || require('js/views/cell-view-'+opts.type);
			} catch (e) {}
			
			var opts = currentSet.cells[i];
			opts['preview'] = opts['preview'] === 'missing.jpg' ? opts.type+'-'+i+'.jpg' : opts['preview'];

			var cv = new ( views[opts.type] || views.CellView )( opts, this );

			if ( i < g ) {
				cv.show();
			}

			cellViews[opts.type] = cellViews[opts.type] || [];
			cellViews[opts.type].push( cv );

			cellViewsArr.push( cv );
		}

		_.each( cellViewsArr, function (cv) {
			cv.$el.css({
				width: (100.0/gridX)+'%',
				height: (100.0/gridY)+'%'
			});
		});

		this.updateVisibleCells();
	},

	setRatio : function ( ratio ) {

		if ( !cellData || !currentSet ) return;

		lastRatio = ratio;

		this.updateVisibleCells();
	},

	updateVisibleCells : function () {

		if ( !cellData || !currentSet ) return;

		var gridWidth = parseInt( Math.ceil( cellViewsArr.length / gridY ) );
		var iFrom = Math.round( lastRatio * (gridWidth-gridX) );

		var toShow = [];
		for ( var n = 0; n < gridY; n++ ) {
			for ( var i = 0; i < gridX; i++ ) {
				var m = n * gridWidth + i + iFrom;
				toShow.push(m);
			}
		}

		_.each( cellViewsArr, function(cv, i){ if ( toShow.indexOf(i) === -1 ) cv.hide(); else cv.show(); });

		if ( currentSet.cells.length <= (gridX * gridY) ) {
			app.getSlider().hide();
		} else {
			app.getSlider().setSize( ((gridX * gridY) * 1.0) / currentSet.cells.length );
			app.getSlider().setRatio( lastRatio, false );
			app.getSlider().show();
		}
	},

	updateGridDimensions : function () {

		if ( !currentSet ) return;

		var w = this.$el.width();
		var h = this.$el.height();
		
		var ch = parseInt( Math.floor( h / currentSet.grid_y ) );
		var cw = (currentSet.grid_width / currentSet.grid_height) * ch;

		gridX = parseInt( w / cw );
		gridY = currentSet.grid_y;

		if ( w - (gridX * cw) > cw / 2 ) {
			gridX++;
		}
		cw = parseInt( Math.floor( w / gridX ) );

		cellWidth = cw;
		cellHeight = ch;
	},

	toggleSetSelector : function () {
		if ( this.$el.css('display') === 'block' ) {
			app.getSlider().hide();
			setSelectorView.show();
			this.$el.hide();
		} else {
			setSelectorView.hide();
			app.getSlider().show();
			this.$el.show();
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
	},

	sizeChanged : function () {
		if ( currentSet ) {

			var gridXPrev = gridX, gridYPrev = gridY;
			this.updateGridDimensions();

			if ( gridX !== gridXPrev || gridY !== gridYPrev ) {
				_.each( cellViewsArr, function (cv) {
					cv.$el.css({
						width: (100.0/gridX)+'%',
						height: (100.0/gridY)+'%'
					});
				});

				this.updateVisibleCells();
			}
		}
	}

});