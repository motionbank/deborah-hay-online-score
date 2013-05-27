
var cellData = {}, cellViews = {}, cellViewsArr = [];
var categories = [];

var views = {};

var currentSet = null;

var cellBorderHandle = 5;
var gridXVisible = 4, gridYVisible = 3;
var cellWidth, cellHeight;
var lastRatio = 0.0;

var app = null, config = null, setSelectorView = null;
$mainTitleLink = null;

var clickedCellCid = null;

var GridView = module.exports = Backbone.View.extend({

	el : '#grid-view',

	initialize : function ( _, mainapp ) {

		var self = this;
		app = mainapp;
		config = app.getConfig();

		$mainTitleLink = jQuery('#main-title a');

		this.$elParent = this.$el.parent();
		
		app.on( 'change:slider', function bbChangeSliderCB (val) {
			self.setPosition( val );
		});

		app.on( 'route:changeset', function bbRouteChangeSetCB (nextSetName){
			this.loadSet(nextSetName);
		}, this);

		app.on( 'route:selectset', function () {
			this.deactivateAll();
			this.$elParent.hide();
		}, this);

		app.on( 'grid:activate-next-by-attr', this.activateNextByAttr, this );
		app.on( 'grid:deactivate-all', this.deactivateAll, this );
		app.on( 'grid:activate', this.setClicked, this );

		setSelectorView = new (require('js/views/select-set-view'))({}, self, app);

		var touchEventManager = this.$el.hammer();
		touchEventManager.on('swiperight', function (event) {
			event.stopPropagation();
			app.trigger('change:position','<<');
		});
		touchEventManager.on('swipeleft', function (event) {
			event.stopPropagation();
			app.trigger('change:position','>>');
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
				url: 'http://' + config.apiHost + '/sets/' + set.id,
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

		this.show();

		this.deactivateAll();

		currentSet = set;
		this.updateGridDimensions();

		views.CellView = views.CellView || require('js/views/cell-view');

		this.$el.empty(); // TODO: more sane way of cleaning up?

		$mainTitleLink.html( currentSet.title );
		$mainTitleLink.attr( 'href', '#set/'+currentSet.path );

		cellViews = {};
		cellViewsArr = [];
		clickedCellCid = null;

		var renderedCells = [];

		for ( var i = 0; i < currentSet.cells.length; i++ ) {

			var opts = currentSet.cells[i];
			
			try {
				views[opts.type] = views[opts.type] || require('js/views/cell-view-'+opts.type);
			} catch (e) { /* ignore */ }

			var cv = new ( views[opts.type] || views.CellView )( opts, app );
			renderedCells.push( cv.render() );

			cellViews[opts.type] = cellViews[opts.type] || [];
			cellViews[opts.type].push( cv );

			cellViewsArr.push( cv );
		}

		this.$el.append( renderedCells );

		this.updateVisibleCells();
	},

	setPosition : function ( ratio ) {

		if ( !cellData || !currentSet ) return;

		lastRatio = ratio;

		this.updateVisibleCells();
	},

	updateVisibleCells : function () {

		if ( !cellData || !currentSet ) return;

		var w = this.$el.width();
		var h = this.$el.height();

		var gridWidth = currentSet.grid_cols;
		var xFrom = Math.round( lastRatio * (gridWidth-gridXVisible) );
		var cw = 100.0/gridXVisible;
		var ch = 100.0/gridYVisible;

		_.each( cellViewsArr, function(cv, i){ 
			var cellDim = cv.cell.get('extra');
			// ... not too far left or right
			if ( !( (cellDim.x + (cellDim.width-1)) < xFrom ||
					 cellDim.x > xFrom+gridXVisible ) 
				) {
				
				// show, set position and size in % to make responsive
				cv.show();
				cv.$el.css({
					position: 'absolute',
					left: 	(cw*(cellDim.x-xFrom))+'%',
					top: 	(ch*cellDim.y)+'%',
					width: 	(cw*cellDim.width)+'%',
					height: (ch*cellDim.height)+'%'
				});

				// add media-query style classes to cells
				cv.$el.attr( 'class', cv.$el.attr('class').replace(/cell-(width|height)-[0-9]+/ig,'') );
				cv.$el.addClass( 'cell-width-'+ (parseInt(((w/gridXVisible)*cellDim.width) /50)*50) ).
					   addClass( 'cell-height-'+(parseInt(((h/gridYVisible)*cellDim.height)/50)*50) );
			} else {
				cv.hide();
			}
		});

		this.checkSlider();
	},

	updateGridDimensions : function () {

		if ( !currentSet ) return;

		var w = this.$el.width();
		var h = this.$el.height();
		
		var ch = parseInt( Math.floor( h / currentSet.grid_rows ) );
		var cw = (currentSet.cell_width / currentSet.cell_height) * ch;

		gridXVisible = parseInt( w / cw );
		gridYVisible = currentSet.grid_rows;

		if ( w - (gridXVisible * cw) > cw / 2 ) {
			gridXVisible++;
		}
		cw = parseInt( Math.floor( w / gridXVisible ) );

		cellWidth = cw;
		cellHeight = ch;

		this.checkSlider();
	},

	checkSlider : function () {

		if ( currentSet.grid_cols <= gridXVisible ) {

			app.getSlider().hide();

		} else {

			app.getSlider().setSize( gridXVisible / (currentSet.grid_cols * 1.0) );
			app.getSlider().setPosition( lastRatio, false );
			app.getSlider().show();
		}
	},

	show : function () {
		this.$elParent.show();
		if ( cellData.cells && cellData.cells.length > (gridXVisible * gridYVisible) ) { // if returning to same as before
			app.getSlider().show();
		}
		this.setPosition(0);
	},

	deactivateAll : function () {
		if ( cellData && cellViewsArr ) {
			for ( var i = 0; i < cellViewsArr.length; i++ ) {
				cellViewsArr[i].deactivate();
			}
		}
	},

	setClicked : function ( cell_cid ) {
		clickedCellCid = cell_cid;
	},

	activateNextByAttr : function ( key, value ) {
		for ( var i = 0; i < cellViewsArr.length; i++ ) {
			var cell = cellViewsArr[i];
			if ( cell.cell.get(key) === value ) {
				cell.activate();
				return;
			}
		}
	},

	// playNext : function ( prevCellView ) {

	// 	var i = cellViewsArr.indexOf( prevCellView );
	// 	if ( i === -1 ) return;
	// 	var n = i+1;
	// 	n %= cellViewsArr.length;
	// 	if ( cellViewsArr[n].cid === clickedCellCid ) return;
	// 	while ( cellViewsArr[n].isVisible === false 
	// 			|| cellViewsArr[n].$el.hasClass('type-context') !== true ) {
	// 		n++;
	// 		n %= cellViewsArr.length;
	// 		if ( n === i ) return;
	// 		if ( cellViewsArr[n].cid === clickedCellCid ) return;
	// 	}
	// 	cellViewsArr[n].activate();
	// },

	getApp : function () {
		return app;
	},

	sizeChanged : function () {
		if ( currentSet ) {

			var gridXVisiblePrev = gridXVisible, gridYVisiblePrev = gridYVisible;
			this.updateGridDimensions();

			if ( gridXVisible !== gridXVisiblePrev || gridYVisible !== gridYVisiblePrev ) {

				this.updateVisibleCells();
			}
		}
	}

});