
var cellData = {}, cellViews = {}, cellViewsArr = [];
var categories = [];

var views = {};

var currentSet = null;

var cellBorderHandle = 5;
var gridXVisible = 4, gridYVisible = 3;
var cellWidth, cellHeight;
var lastRatio = 0.0;

var app = null, config = null, setSelectorView = null;
$mainTitleLink = null, $backgroundGrid = null;

var clickedCellCid = null;
var showCellInfo = false;

var autoPlayTid = -1;

var GridView = module.exports = Backbone.View.extend({

	el : '#grid-view',

	initialize : function ( _, mainapp ) {

		var self = this;
		app = mainapp;
		config = app.getConfig();

		$mainTitleLink = jQuery('#main-title a');
		$backgroundGrid = jQuery('#background-grid');

		this.$elParent = this.$el.parent();
		
		app.on( 'change:slider', function bbChangeSliderCB (val) {
			this.setPosition( val );
		}, this);

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

		jQuery('#show-cell-infos-item').click(function(evt){
			evt.preventDefault();
			showCellInfo = !showCellInfo;
			if ( showCellInfo ) {
				jQuery('.cell').addClass('with-info');
			} else {
				jQuery('.cell').removeClass('with-info');
			}
		});

		jQuery('#toggle-set-selector-item').click(function(evt){
			var selectorVisible = setSelectorView.$el.css('display') === 'block';
			var $item = jQuery(this);
			var $link = jQuery('a',$item);
			if ( selectorVisible ) {
				$item.attr('title',$link.data('title-set'));
				$link.attr('href','#set/' + ((currentSet && currentSet.path)||'overview'));
			} else {
				$item.attr('title',$link.data('title-selector'));
				$link.attr('href','#set/sets');
			}
		});
	},

	loadSet : function ( setUrl ) {
		
		var set = app.getSet( setUrl );

		if ( !set ) {
			throw( 'Set could not be loaded: ' + setUrl );
			return;
		}

		if ( currentSet === set ) {
			this.show();
			return;
		}

		if ( !set.cells ) {
			var self = this;
			(function(){
				var apiRetrys = 0;
				var callApi = function () {
					jQuery.ajax({
						url: 'http://' + config.apiHost + '/sets/' + set.id,
						dataType:'json',
						success:function(data){
							set.cells = data.cells;
							self.loadSet( set.path );
						},
						error:function(err){
							if ( apiRetrys < 5 ) {
								setTimeout( function initAppApiRetry () {
									if ( config && config.debug ) console.log( 'Retry (@2) ' + apiRetrys );
									callApi();
								}, 200 + (apiRetrys * 200) );
								apiRetrys++;
							} else {
								throw(err);
							}
						}
					});
				}
				callApi();
			})();
			return;
		}

		currentSet = set;
		this.show();

		this.deactivateAll();

		this.updateGridDimensions();

		views.CellView = views.CellView || require('js/views/cell-view');

		this.$el.empty(); // TODO: more sane way of cleaning up?

		cellViews = {};
		cellViewsArr = [];
		clickedCellCid = null;

		var renderedCells = [];

		for ( var i = 0; i < currentSet.cells.length; i++ ) {

			var opts = currentSet.cells[i];
			
			try {
				views[opts.type] = views[opts.type] || require('js/views/cell-view-'+opts.type);
			} catch (e) { /* ignore */ }

			if ( opts.title ) {
				opts['title_org'] = opts.title;
				opts.title = opts.title.replace(/[\s]*---.+$/,'');
			}

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
		var xFrom = Math.round( lastRatio * (gridWidth - gridXVisible) );
		var cw = 100.0/gridXVisible;
		var ch = 100.0/gridYVisible;
		var absCw = (1.0*w)/gridXVisible,
			absCh = (1.0*h)/gridYVisible;

		_.each( cellViewsArr, function(cv, i){ 

			var cellDim = cv.cell.get('extra');

			cv.$el.removeClass('lastcol').removeClass('lastrow');

			// ... not too far left or right
			if ( !( (cellDim.x + (cellDim.width-1)) < xFrom ||
					 cellDim.x > xFrom+gridXVisible ) 
				) {
				
				var left  = cw * (cellDim.x - xFrom);
				var width = cw *  cellDim.width;

				// show, set position and size in % to make responsive
				cv.show();
				cv.$el.css({
					position: 'absolute',
					left: 	left+'%',
					top: 	(ch*cellDim.y)+'%',
					width: 	width+'%',
					height: (ch*cellDim.height)+'%'
				});

				// add media-query style classes to cells
				cv.$el.attr( 'class', cv.$el.attr('class').replace(/cell-(width|height)-[0-9]+/ig,'') );
				cv.$el.addClass( 'cell-width-'+ (parseInt((absCw*cellDim.width) /50)*50) ).
					   addClass( 'cell-height-'+(parseInt((absCh*cellDim.height)/50)*50) );

				if ( (cellDim.x-xFrom) + cellDim.width >= gridXVisible ) {
					cv.$el.addClass('lastcol');
				}
				if ( cellDim.y+cellDim.height >= gridYVisible ) {
					cv.$el.addClass('lastrow');
				}
			} else {
				cv.hide();
			}

			if ( showCellInfo ) {
				cv.$el.addClass('with-info');
			} else {
				cv.$el.removeClass('with-info');
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

		$backgroundGrid.empty();
		var rows = [];
		for ( var iy = 0; iy < gridYVisible; iy++ ) {
			var cols = [];
			for ( var ix = 0; ix < gridXVisible; ix++ ) {
				var col = jQuery('<td></td>');
				col.css({
					width: (100.0/gridXVisible)+'%'
				});
				if ( ix == gridXVisible-1 ) {
					col.addClass('lastcol');
				}
				cols.push(col);
			}
			var row = jQuery('<tr></tr>');
			if ( iy == gridYVisible-1 ) {
				row.addClass('lastrow');
			}
			row.append(cols);
			rows.push( row );
		}
		$backgroundGrid.append(rows);

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

		if ( currentSet ) {
			$mainTitleLink.html( currentSet.title );
			$mainTitleLink.attr( 'href', '#set/'+currentSet.path );
		}

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

		clearTimeout( autoPlayTid );
	},

	setClicked : function ( cell_cid ) {
		clickedCellCid = cell_cid;
	},

	activateNextByAttr : function ( key, value ) {

		if ( !key || !value ) return;
		
		var self = this;

		clearTimeout( autoPlayTid );

		for ( var i = 0; i < cellViewsArr.length; i++ ) {
			var cell = cellViewsArr[i];
			if ( cell.cell.get(key) === value ) {
				cell.activate();

				var cellDim = cell.cell.get('extra');
				var r = (cellDim.x + cellDim.width / 2.0 - gridXVisible / 2.0) / (currentSet.grid_cols - gridXVisible); // TODO: something is wrong here
				if ( r < 0 ) r = 0;
				if ( r > 1 ) r = 1;
				app.getSlider().setPosition( r, false );
				this.setPosition( r );

				if ( true /* app.getConfig().islocal */ ) {
					autoPlayTid = setTimeout(function(){
						var cellm 	= cell.cell,
							key 	= cellm.get('play-next-key'),
							value 	= cellm.get('play-next-value');
						if ( key && value ) {
							cell.deactivate();
							self.activateNextByAttr( key, value );
						}
					}, 1000 * 60 * 4 );
				}

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