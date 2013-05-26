/**
 *	Quite a beast this is.
 */

jQuery(function(){

	// EJS template for Grid cells
	var tplGridCell = '<div class="grid-cell z-behind <%= classes.join(\' \') %>" '+
							'title="<%= title %> (#<% id %>), <%= type %>" '+
							'data-id="<%= id %>" '+
							'data-connection-id="" '+
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
		$cellList 		= jQuery('.cell-list'),
		$cells 			= jQuery('.cell', $cellList),
		types 			= layoutEditor.types,
		filters 		= {},
		set 			= layoutEditor.set,
		connections 	= layoutEditor.connections,
		cellHeight 		= -1,
		cellWidth 		= -1,
		cfBase 			= 'http://d35vpnmjdsiejq.cloudfront.net/dh/app/cells';

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
	$cells.each(function(i,e){

		var $cell = jQuery(e),
			cell_id = $cell.data('id'),
			set_id = layoutEditor.set.id;

		$cell.draggable({
			revert: true,
			revertDuration: 20,
			helper: function () {
				var $cell = jQuery(this);
				var $dragEl = jQuery('<div class="cell drag-helper" />');
				$dragEl.append( jQuery( '.poster', $cell ).clone() );
				$dragEl.append( jQuery( '.title', $cell ).text() );
				$dragEl.data('id',cell_id);
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

					var cellId = $cell.data('id'),
						itemId = $item.data('id');

					var cellConnectionId = $cell.data('connection-id'),
						itemConnectionId = $item.data('connection-id');
					
					if ( evt.metaKey ) {

						if ( cellId && itemId /* TODO cell type check here */ ) {
							
							var cbs = [];
							var dbCell = null, dbItem = null;
							var dbItemConnectionFields = [];

							if ( !cellConnectionId ) {
								cbs.push(function (next) {
									jQuery.ajax({
										url: '/admin/sets/'+set.id+'/cells/'+cellId+'/connections',
										method: 'post', dataType: 'json',
										data: {
											id: cellId, x: $cell.data('x'), y: $cell.data('y'),
											width: $cell.data('width'), height: $cell.data('height')
										},
										success: function (resp) {
											$cell.data('connection-id', resp.connection_id);
											cellConnectionId = resp.connection_id;
											dbCell = resp.cell;
											next();
										},
										error: function () { throw(err); }
									});
								});
							} else {
								cbs.push(function(next){
									jQuery.ajax({
										url: '/admin/sets/'+set.id+'/cells/'+cellId+'/connections/'+cellConnectionId+'/fields',
										dataType: 'json',
										success: function (resp) {
											dbCell = resp.cell;
											next();
										},
										error: function () { throw(err); }
									});
								});
							}
							if ( !itemConnectionId ) {
								cbs.push(function (next) {
									jQuery.ajax({
										url: '/admin/sets/'+set.id+'/cells/'+itemId+'/connections',
										method: 'post',
										dataType: 'json',
										data: {
											id: itemId, x: $item.data('x'), y: $item.data('y'),
											width: $item.data('width'), height: $item.data('height')
										},
										success: function (resp) {
											$item.data('connection-id', resp.connection_id);
											itemConnectionId = resp.connection_id;
											dbItem = resp.cell;
											next();
										},
										error: function (err) {
											throw(err);
										}
									});
								});
							} else {
								cbs.push(function(next){
									jQuery.ajax({
										url: '/admin/sets/'+set.id+'/cells/'+cellId+'/connections/'+itemConnectionId+'/fields',
										dataType: 'json',
										success: function (resp) {
											dbItem = resp.cell;
											dbItemConnectionFields = resp.fields;
											next();
										},
										error: function () { throw(err); }
									});
								});
							}

							cbs.push(function(){
								if ( dbCell && dbItem && dbCell.type === 'context' && dbItem.type === 'context' ) {
									var cellVimeoId = null;
									_.each( dbCell.fields, function(f){
										if ( f.name === 'vimeo-id' && f.value ) {
											cellVimeoId = f.value;
										}
									});
									if ( !cellVimeoId ) {
										alert( 'Huh, missing the vimeo-id. Strange.' );
										console.log( dbCell, dbItem, $cell, $item );
									} else {
										var data = {
											set_id: 		set.id, 
											cell_id: 		itemId,
											connection_id: 	itemConnectionId,
											field_keys: 	[],
											field_values: 	[]
										};
										for ( var fi = 0; fi < dbItemConnectionFields.length; fi++ ) {
											var f = dbItemConnectionFields[fi];
											if ( f.name === 'play-next' && f.value === cellVimeoId ) {
												alert('Already linked, nothing to do here');
												return;
											}
											data.field_keys.push( f.name );
											data.field_values.push( f.value );
										};
										data.field_keys.push('play-next');
										data.field_values.push(cellVimeoId);
										jQuery.ajax({
											url : '/admin/sets/'+set.id+'/cells/'+itemId+'/connections/'+itemConnectionId+'/fields',
											dataType : 'json', method: 'post',
											data : data,
											success : function ( resp ) {
												alert('Linked!');
											},
											error : function (err) { throw(err); }
										});
									}
								} else {
									alert( 'Uh .. something went wrong!' );
									console.log( dbCell, dbItem, $cell, $item );
								}
							});

							var nextCb = function () {
								if ( cbs.length > 0 ) {
									var cb = cbs.shift();
									cb(nextCb);
								}
							}
							nextCb();
						}

					} else {

						// swap IDs, backgrounds, content

						var cBgImg = $cell.css('background-image'),
							iBgImg = $item.css('background-image');

						$cell.data('id',itemId||null);
						$cell.data('connection-id',itemConnectionId||null);
						$cell.css({
							backgroundImage: iBgImg
						});
						if ( !itemId ) {
							$cell.data('width', 1);
							$cell.data('height',1);
							$cell.css({
								backgroundColor: '#c7dddd'
							});
							$cell.addClass('z-behind');
						}

						$item.data('id',cellId||null);
						$item.data('connection-id',cellConnectionId||null);
						$item.css({
							backgroundImage: cBgImg
						});
						if ( !cellId ) {
							$item.data('width', 1);
							$item.data('height',1);
							$item.css({
								backgroundColor: '#c7dddd'
							});
							$item.addClass('z-behind');
						}

						resetGridWidth();
					}

				} else { // ... list item was dropped

					var columns = set.grid_cols;
					var rows 	= set.grid_rows;

					jQuery('.grid .just-dropped, .grid .drag-hover').
						removeClass('just-dropped').
							removeClass('drag-hover');
					
					var id 		= $item.data( 'id' ),
						iBgImg 	= $item.data('poster');
					
					$cell.data( 'id', id );
					$cell.data( 'connection-id', null );
					$cell.addClass('just-dropped');
					$cell.css({
						backgroundImage: 
							'url("'+cfBase+'/poster/small/'+$item.data('poster')+'")'
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

		},
		stop : function (evt,ui) {

			jQuery(this).css({
				zIndex: 'auto'
			});
		}
	};

	var selectGridCell = function ( $e ) {
		var $selPrev = $selectedCell;
		
		deselectGridCells();
		
		if ( $selPrev !== $e ) {
			$e.addClass('selected');
			$selectedCell = $e;
		}
	}

	var deselectGridCells = function () {
		jQuery('.grid .grid-cell.selected').removeClass('selected');
		$selectedCell = null;
	}

	var makeGridCellInteractive = function ( $e ) {

		$e.draggable(draggableGridCellOpts);

		$e.click(function(){
			
			selectGridCell($e);

		}).dblclick(function(){

			var id = $e.data('id');
			var connection_id = $e.data('connection-id');
			var $cell = jQuery( '.cell[data-id='+id+']', $cellList );

			if ( id ) {
				$cellList.animate({
					scrollTop: $cellList.scrollTop() + ($cell.offset().top - $cellList.offset().top)
				}, {
					duration: 500,
					complete : function () {
						jQuery('.cell-form', $cell).hide();
						showSetFieldsEditor( $e, $cell, connection_id );
					}
				});

				if ( connection_id ) {
					deselectGridCells();
				}
			}

		}).hover(function(){

			var id = $e.data('id');
			var $cell = jQuery( '.cell[data-id='+id+']', $cellList );

			$cell.css({
				backgroundColor: 'rgba(255,0,0,0.2)'
			});

		}, function(){

			$cells.css({
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
					height: $e.data('height') || 1,
					connection_id: $e.data('connection-id')
				});
				save_cols = Math.max( save_cols, parseInt($e.data('x'))+parseInt($e.data('width')) ); // remove unneeded cols/rows
				save_rows = Math.max( save_rows, parseInt($e.data('y'))+parseInt($e.data('height')) );
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
			success : function (resp) {
				var connections = [];
				_.each(resp.cells,function(c){
					connections.push({
						id: c.extra.connection_id,
						cell_id: c.id
					});
					$cell = jQuery( '.grid .grid-cell[data-id='+c.id+'][data-x='+c.extra.x+'][data-y='+c.extra.y+']' );
					$cell.css({
						backgroundImage: 'url(\''+cfBase+'/poster/small/'+c.poster+'\')'
					});
					$cell.data('connection-id',c.extra.connection_id);
					$listItem = jQuery('.cell-list .cell[data-id='+c.id+']');
				});
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

	jQuery(document).keydown(function(evt){
		if ( evt.which === 8 || evt.which === 46 ) {
			if ( $selectedCell && confirm('Remove selected cell?') ) {
				evt.preventDefault();

				var $cell = $selectedCell;
				$selectedCell = null;

				$cell.data('id', null);
				$cell.data('width',  1);
				$cell.data('height', 1);
				$cell.css({
					backgroundImage: 'none'
				});
				$cell.removeClass('selected');

				return false;
			}
		}
	});

	var showSetFieldsEditor = function ( $gridCell, $cell, connection_id ) {

		var set_id = layoutEditor.set.id;
		var cell_id = $cell.data('id');

		if ( !connection_id ) {

			// add connection
			jQuery.ajax({
				url: '/admin/sets/'+set_id+'/cells/'+cell_id+'/connections',
				method: 'post',
				dataType: 'json',
				data: {
					id: cell_id, x: $gridCell.data('x'), y: $gridCell.data('y'),
					width: $gridCell.data('width'), height: $gridCell.data('height')
				},
				success: function (resp) {
					//console.log( resp );
					$gridCell.data('connection-id', resp.connection_id);
					insertSetFieldsEditor( $cell, resp.connection_id, [] );
				},
				error : function () {

				}
			});

		} else {

			jQuery.ajax({
				url: '/admin/sets/'+set_id+'/cells/'+cell_id+'/connections/'+connection_id+'/fields',
				dataType: 'json',
				success: function(resp){
					insertSetFieldsEditor( $cell, connection_id, resp.fields );
				},
				error: function (err) {
				},
				complete: function () {
				}
			});
		}
	};

	var insertSetFieldsEditor = function ( $cell, connection_id, fields ) {

		var set_id = layoutEditor.set.id;
		var cell_id = $cell.data('id');

		var tpl = new EJS({
			text : jQuery('#tpl-set-fields-form').text(),
			type : '['
		});

		var tplHtml = tpl.render({
			set: layoutEditor.set,
			cell: {
				id: cell_id
			},
			connection_id: connection_id,
			fields: fields
		});

		tplHtml = jQuery.parseHTML( tplHtml ); // Huh? Why do i need this?
		var $formContainer = jQuery( tplHtml );

		jQuery( 'a.add-more-action', $formContainer ).click(function(evt){
			evt.preventDefault();
			jQuery('<input type="text" name="field_keys" value="" />'+
				   '<input type="text" name="field_values" value="" />'+
				   '<br/>').insertBefore( this );
		});

		var $form = jQuery( 'form', $formContainer );
		$form.submit(function(evt){
			evt.preventDefault();
			var data = $form.serialize();
			console.log( data );
			jQuery.ajax({
				url: '/admin/sets/'+set_id+'/cells/'+cell_id+'/connections/'+connection_id+'/fields',
				method: 'post',
				data: data,
				dataType: 'json',
				success: function (resp) {
					//console.log(resp);
				},
				error: function (err) {
					console.log(err);
				},
				complete: function() {
					$formContainer.remove();
				}
			});
		});

		$cell.append( tplHtml );
	}

	jQuery('.filters a.action-type-filter').each(function(i,e){
		var $filter = jQuery(e);
		$filter.click(function(evt){
			evt.preventDefault();
			var type = $filter.data('type');
			var $heading = jQuery( '.list-item-group.type-'+type, $cellList );
			//jQuery('.cell-list .cell.type-'+type).show();
			$cellList.animate({
				scrollTop: $cellList.scrollTop() + ($heading.offset().top - $cellList.offset().top)
			}, {
				duration: 500,
				complete : function () {
				}
			});
		});
	});
});