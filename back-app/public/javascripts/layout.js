/**
 *	Quite a beast this is.
 */

jQuery(function(){

	// EJS template for Grid cells
	var tplGridCell = '<div class="grid-cell z-behind <%= classes.join(\' \') %>" '+
							'title="<%= title %> (#<% id %>), <%= type %>" '+
							'data-id="<%= id %>" '+
						  	'data-x="<%= x %>" '+
						  	'data-y="<%= y %>" '+
						  	'data-width="<%= width %>" '+
						  	'data-height="<%= height %>" '+
						  		'>'+
						  		'<div class="resize-handle ui-resizable-handle ui-resizable-se">'+
						  	'</div></div>';

	var $grid 			= jQuery( '.grid' ), // cache jQuery Grid
		$selectedCell 	= null,				 // the currently selected cell
		$filterSelect	= jQuery('.filters form select'),
		$cellList 		= jQuery('.cell-list .cell');
		types 			= layoutEditor.types,
		filters 		= {},
		set 			= layoutEditor.set,
		cellHeight 		= -1,
		cellWidth 		= -1;

	var resetGridWidth = function () {

		var gridHeight = $grid.height();
		var helperSize = 15; /* see width, height in layout.css */

		var gridCols = set.grid_cols === 0 ? 1 : set.grid_cols;
		var gridRows = set.grid_rows === 0 ? 1 : set.grid_rows;

		cellHeight = (gridHeight - helperSize) / gridRows;
		cellWidth = (set.cell_width / set.cell_height) * cellHeight;
		var gridWidth = cellWidth * gridCols + helperSize;

		$grid.css({
			width: gridWidth+'px',
			height: gridHeight+'px'
		});

		jQuery('.grid-cell',$grid).each(function(i,e){

			$e = jQuery(e);

			var opts = {
				position: 'absolute',
				left:   ($e.data('x') * cellWidth) + 'px',
				top:    ($e.data('y') * cellHeight) + 'px',
				width:  ((cellWidth * $e.data('width'))-1)  + 'px',
				height: ((cellHeight * $e.data('height'))-1) + 'px'
			};

			$e.css(opts);

			$e.resizable( "option", "grid", [ cellWidth, cellHeight ] );
		});

		jQuery('.add-col',$grid).css({
			height: (gridHeight-helperSize-2) + 'px'
		});
		jQuery('.add-row',$grid).css({
			width: (gridWidth-helperSize-2) + 'px'
		});
	};

	// make all list items (cells) draggable
	$cellList.each(function(i,e){
		var $e = jQuery(e);
		$e.draggable({
			revert: true,
			revertDuration: 20,
			helper: function () {
				var $e = jQuery(this);
				var $dragEl = jQuery('<div class="cell drag-helper" />');
				$dragEl.append( jQuery( '.poster', $e ).clone() );
				$dragEl.append( jQuery( '.title', $e ).text() );
				$dragEl.data('id',$e.data('id'));
				return $dragEl;
			},
			appendTo: '#main',
		});
	});

	// options for droppables (grid cells)
	var droppableGridCellOpts = {
		over: function () {
			var $cell = jQuery(this);
			$cell.addClass('drag-hover');
		},
		out: function () {
			var $cell = jQuery(this);
			$cell.removeClass('drag-hover');
		},
		drop: function (evt, ui) {

			var $cell = jQuery(this);
			$cell.removeClass('drag-hover');

			var $item = ui.draggable;
			$item.data('droppedOnGrid',true);

			$cell.css({
				backgroundColor: ''
			});

			if ( $cell.hasClass('add-col') ) {

				addColumn();
				resetGridWidth();

			} else if ( $cell.hasClass('add-row') ) {

				addRow();
				resetGridWidth();

			} else {

				$cell.removeClass('z-behind');

				// if it's a grid-cell that was dropped
				if ( $item.hasClass('grid-cell') ) {
					
					// swap IDs, backgrounds, content
					var cellId = $cell.data('id'),
						itemId = $item.data('id');

					var cBgImg = $cell.css('background-image'),
						iBgImg = $item.css('background-image');

					$cell.data('id',itemId||null);
					// $cell.html(iBgImg==='none'?itemId:'');
					$cell.css({
						backgroundImage: iBgImg
					});
					$item.data('id',cellId||null);
					// $item.html(cBgImg==='none'?cellId:'');
					$item.css({
						backgroundImage: cBgImg
					});

				} else { // ... list item was dropped

					var columns = set.grid_cols;
					var rows = set.grid_rows;

					jQuery('.grid .just-dropped, .grid .drag-hover').
						removeClass('just-dropped').
							removeClass('drag-hover');
					
					var id = $item.data( 'id' ),
						iBgImg = $item.data('poster');
					
					$cell.data( 'id', id );
					// $cell.html( iBgImg==='none'?id:'' );
					$cell.addClass('just-dropped');
					$cell.css({
						backgroundImage: 
							'url("http://d35vpnmjdsiejq.cloudfront.net/dh/app/cells/'+
								'poster/small/'+$item.data('poster')+'")'
					});
				}
				
			}
		},
		tolerance: 'pointer'
	};

	// options to make grid cells draggable
	var draggableGridCellOpts = {
		revert: true,
		revertDuration: 20,
		start : function (evt,ui) {

			jQuery(this).css({
				backgroundColor: 'inherit',
				zIndex:999
			});

			ui.helper.data('droppedOnGrid',false);
		},
		stop : function (evt,ui) {

			var $e = jQuery(this);

			$e.css({
				zIndex: 'auto'
			});

			if ( ui.helper.data('droppedOnGrid') === false ) {

				$e.data('id',null);
				$e.css({
					backgroundImage: 'none'
				});
			}
		}
	};

	var makeGridCellInteractive = function ( $e ) {

		$e.draggable(draggableGridCellOpts);

		$e.click(function(){
			
			var $selPrev = $selectedCell;
			
			jQuery('.grid .grid-cell.selected').removeClass('selected');
			$selectedCell = null;
			
			if ( $selPrev !== $e ) {
				$e.addClass('selected');
				$selectedCell = $e;
			}

		}).dblclick(function(){

			var id = $e.data('id');
			if ( id ) {
				// var cellTitle = jQuery('.cell-list .cell[data-id='+id+'] .title').text();
				// if ( confirm('Go to cell »'+cellTitle+'«? Unsaved changes will be lost ..') ) {
				// 	window.location.href = '/admin/cells/'+id+'/edit';
				// }
				var $cellList = jQuery('.cell-list')
				$cellList.animate({
					scrollTop: $cellList.scrollTop() + 
									(jQuery( '.cell-list .cell[data-id='+id+']' ).offset().top - $cellList.offset().top)
				}, 500);
			}

		}).hover(function(){

				var id = $e.data('id');
				jQuery( '.cell-list .cell[data-id='+id+']' ).css({
					backgroundColor: 'rgba(255,0,0,0.2)'
				});

			},function(){

				$cellList.css({
					backgroundColor: 'inherit'
				});

		}).resizable({

			autoHide: true,
			handles: "se",

			stop: function ( evt, ui ) {

				var width = Math.round( ui.size.width  / cellWidth  );
				var height = Math.round( ui.size.height / cellHeight );

				for ( var i = set.grid_cols, n = $e.data('x') + width; i < n; i++ ) {
					addColumn();
				}
				for ( var i = set.grid_rows, n = $e.data('y') + height; i < n; i++ ) {
					addRow();
				}

				$e.data( 'width', width );
				$e.data( 'height', height );

				resetGridWidth();
			}
		});
 	};

 	var addColumn = function () {
 		var ejsTpl = new EJS({ text: tplGridCell });
 		for ( var ir = 0; ir < set.grid_rows; ir++ ) {
 			var $cell = jQuery( ejsTpl.render({
 				type: '',
 				id: '',
 				classes: [],
 				title: '',
 				x : set.grid_cols,
 				y : ir,
 				width: 1, height: 1
 			} ) );
 			$cell.droppable( droppableGridCellOpts );
 			makeGridCellInteractive( $cell );
 			$grid.append( $cell );
 		}
 		set.grid_cols++;
 	};

 	var addRow = function () {
 		var ejsTpl = new EJS({ text: tplGridCell });
 		for ( var ic = 0; ic < set.grid_cols; ic++ ) {
 			var $cell = jQuery( ejsTpl.render({
 				type: '',
 				id: '',
 				classes: [],
 				title: '',
 				x : ic,
 				y : set.grid_rows,
 				width: 1, height: 1
 			} ) );
 			$cell.droppable( droppableGridCellOpts );
 			makeGridCellInteractive( $cell );
 			$grid.append( $cell );
 		}
 		set.grid_rows++;
 	};

	// apply droppable and draggable options to grid cells
	jQuery('.grid .grid-cell').
		droppable( droppableGridCellOpts ).
		each(function(i,e){
			makeGridCellInteractive( jQuery(e) );
		});

	jQuery('.grid .cell-adder').
		droppable( droppableGridCellOpts ).
		click(function(evt){
			evt.preventDefault();
			var $self = jQuery(this);
			if ( $self.hasClass('add-col') ) {
				addColumn();
			} else {
				addRow();
			}
			resetGridWidth();
		});

	// action for "save" button, does ajax save
	jQuery('#actions .save-action').click(function(evt){

		evt.preventDefault();

		var cells = [];
		var save_cols = 0;
		var save_rows = 0;

		var $container = jQuery(this);
		var $prog = jQuery('<span class="progress"></span>');
		$prog.insertBefore( $container );
		var tAni = new TextAnimator( $prog, 200 );

		jQuery('.grid-cell',$grid).each(function(i,e){
			
			$e = jQuery(e);
			if ( $e.hasClass('add-x') || $e.hasClass('add-y') ) return;

			var id = $e.data('id');
			if ( id ) {
				cells.push({
					id: id, 
					x: $e.data('x'), 
					y: $e.data('y'),
					width: $e.data('width') || 1, 
					height: $e.data('height') || 1
				});
				save_cols = Math.max( save_cols, parseInt($e.data('x'))+1 ); // remove unneeded cols/rows
				save_rows = Math.max( save_rows, parseInt($e.data('y'))+1 );
			}
		});

		tAni.start();
		$container.hide();
		jQuery.ajax({
			url: '/admin/sets/'+set.id+'/layout',
			data: {
				cells: cells,
				grid_cols: save_cols,
				grid_rows: save_rows,
			},
			method: 'post',
			beforeSend: function () {
				// TODO: lock interface
			},
			success : function () {
				//window.location.href = window.location.href;
			},
			error : function () {
				console.log( arguments );
				alert('Saving failed! See console log ..');
			},
			complete: function (){
				// TODO: unlock interface
				setTimeout(function(){
					tAni.stop();
					$container.show();
					$prog.remove();
				},1000);
			}
		});
	});

	// finally ... reset once at startup
	resetGridWidth();
});