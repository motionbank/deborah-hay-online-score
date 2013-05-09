/**
 *	Quite a beast this is.
 */

jQuery(function(){

	// EJS template for table cells
	var tplTableRow = '<td class="grid-cell <%= classes.join(\' \') %>" '+
						  'data-x="<%= x %>" '+
						  'data-y="<%= y %>"><%= html %></td>'

	var $table 			= jQuery( '.grid' ), // cache jQuery table
		$selectedCell 	= null,				 // the currently selected cell
		$filterSelect	= jQuery('.filters form select'),
		$cellList 		= jQuery('.cell-list .cell');
		types 			= layoutEditor.types,
		filters 		= {},
		set 			= layoutEditor.set;

	// helper: recalculate table cell sizes and set them
	var resetTableWidth = function () {

		var ch = (144-10) / set.grid_rows;
		var cw = (set.cell_width / set.cell_height) * ch;
		var table_width = cw * set.grid_cols + 10;

		$table.css({
			width: table_width+'px',
			height: 144+'px'
		});

		jQuery('.grid-cell',$table).each(function(i,e){
			$e = jQuery(e);
			if ( $e.hasClass('add-x') || $e.hasClass('add-y') ) return;
			$e.css({
				width: cw + 'px',
				height: ch + 'px'
			});
		});
	}

	// use once at startup
	resetTableWidth();

	// make all list items (cells) draggable
	$cellList.each(function(i,e){
		var $e = jQuery(e);
		$e.draggable({
			revert: true,
			revertDuration: 20,
			helper: 'clone',
			appendTo: '#main',
			containment: '#main',
		});
	});

	// options for droppables (grid cells)
	var droppableGridCellOpts = {
		over: function () {
			var $cell = jQuery(this);
			$cell.css({
				backgroundColor: 'white'
			});
		},
		out: function () {
			var $cell = jQuery(this);
			$cell.css({
				backgroundColor: ''
			});
		},
		drop: function (evt, ui) {

			var $cell = jQuery(this);
			var $item = ui.draggable;
			$item.data('droppedOnGrid',true);

			$cell.css({
				backgroundColor: ''
			});

			// if it's a grid-cell that was dropped
			if ( $item.hasClass('grid-cell') ) {

				if ( $item.hasClass('add-x') || $cell.hasClass('add-x') ) return; // adders at right/bottom
				if ( $item.hasClass('add-y') || $cell.hasClass('add-y') ) return;
				
				// swap IDs, backgrounds, content
				var cellId = $cell.data('id'),
					itemId = $item.data('id');

				var cBgImg = $cell.css('background-image'),
					iBgImg = $item.css('background-image');

				$cell.data('id',itemId||null);
				$cell.html(iBgImg==='none'?itemId:'');
				$cell.css({
					backgroundImage: iBgImg
				});
				$item.data('id',cellId||null);
				$item.html(cBgImg==='none'?cellId:'');
				$item.css({
					backgroundImage: cBgImg
				});

			} else { // ... list item was dropped

				var columns = jQuery('tr:first', $table).children().length-1;
				var rows = jQuery('tr',$table).length-1;

				if ( $cell.hasClass('add-x') ) {  // dropped on add column cell (right)

					$cells = addColumn(columns,rows);
					if (columns === 0 && rows === 0) { // grid was empty
						addRow(columns+1,rows);
						set.grid_rows++;
					}
					$cell = $cells[$cell.data('y')];
					
					set.grid_cols++;
					resetTableWidth();

				} else if ( $cell.hasClass('add-y') ) { // dropped on add row cell (bottom)

					$cells = addRow(columns,rows);
					$cell = $cells[$cell.data('x')];

					set.grid_rows++;
					resetTableWidth();
				}
				
				var id = $item.data( 'id' ),
					iBgImg = $item.data('preview');
				
				$cell.data( 'id', id );
				$cell.html( iBgImg==='none'?id:'' );
				$cell.css({
					borderColor: 'red',
					backgroundImage: 
						'url("http://d35vpnmjdsiejq.cloudfront.net/dh/app/cells/'+
							$item.data('preview')+'")'
				});
			}
		},
		tolerance: 'pointer'
	};

	// options to make grid cells draggable
	var draggableGridCellOpts = {
		revert: true,
		revertDuration: 20,
		start : function (evt,ui) {

			jQuery(this).css({zIndex:999});

			ui.helper.data('droppedOnGrid',false);
		},
		stop : function (evt,ui) {

			var $e = jQuery(this);
			$e.css({zIndex:'auto'});

			if ( ui.helper.data('droppedOnGrid') === false ) {

				$e.data('id',null);
				$e.css({
					backgroundImage: 'none'
				});
			}
		}
	};

	// apply droppable and draggable options to grid cells
	jQuery('.grid .grid-cell').droppable(
		droppableGridCellOpts
	).each(function(i,e){

			var $e = jQuery(e);
			if ( $e.hasClass('add-x') || $e.hasClass('add-y') ) return;

			$e.draggable(draggableGridCellOpts);

			$e.click(function(){
				
				var $selPrev = $selectedCell;
				
				jQuery('.grid .grid-cell.selected').removeClass('selected');
				$selectedCell = null;
				
				if ( $selPrev !== $e ) {
					$e.addClass('selected');
					$selectedCell = $e;
				}
			});
	});

	// helper to add a column to table
	var addColumn = function (columns, rows) {

		var ejsTableRow = new EJS({text:tplTableRow});
		var $rows = jQuery('tr',$table);
		var $cells = [];

		for ( var iy = 0; iy <= rows; iy++ ) {

			var cellData = { x:columns, y:iy, html:'', classes:[] };
			var isAdder = (iy === rows && rows > 0);

			if ( isAdder ) {
				cellData.html = '+';
				cellData.classes.push('add-y');
			}
			var $cell = jQuery( ejsTableRow.render(cellData) );
			$cell.droppable(droppableGridCellOpts);
			if ( !isAdder ) {
				$cell.draggable(
					draggableGridCellOpts);
			}

			$lastCell = jQuery('td:last', $rows[iy] ).get(0);
			$cell.insertBefore( $lastCell );
			$cells.push($cell);
		}

		if ( rows === 0 ) {
			$rows.removeClass('add-y');
			jQuery('tr:first td:last').removeClass('add-y');
		}

		return $cells;
	}

	// helper to add row to table
	var addRow = function (columns, rows) {

		var $row = jQuery( '<tr></tr>' );
		var ejsTableRow = new EJS({text:tplTableRow});
		var $cells = [];

		for ( var i = 0; i < columns; i++ ) {

			var cellData = {x:i, y:rows, html:'', classes:[]};
			var isAdder = rows === 0;

			if ( isAdder ) {
				cellData.html = '+';
				cellData.classes.push('add-y');
			}
			var $cell = jQuery( ejsTableRow.render(cellData) );
			$cell.droppable(droppableGridCellOpts);
			if ( !isAdder ) $cell.draggable(draggableGridCellOpts);

			$row.append( $cell );
			$cells.push($cell);
		}

		var cellData = {x:i, y:rows, html:'+', classes:['add-x']};
		if ( rows === 0 ) {
			cellData.classes.push('add-y');
		}
		var $cell = jQuery( ejsTableRow.render(cellData) );
		$cell.droppable(
			droppableGridCellOpts);
		$row.append( $cell );

		if ( rows > 0 ) {
			$row.insertBefore('tr:last', $table);
		} else {
			$table.append($row);
			$row.addClass('add-y');
		}

		return $cells;
	}

	// action for "save" button, does ajax save
	jQuery('#actions form').submit(function(evt){

		evt.preventDefault();

		var cells = [];
		jQuery('.grid-cell',$table).each(function(i,e){
			$e = jQuery(e);
			var id = $e.data('id');
			if ( id ) {
				cells.push({
					id: id, 
					x: $e.data('x'), 
					y: $e.data('y') 
				});
			}
		});

		jQuery.ajax({
			url: '/admin/sets/'+set.id+'/save-cells',
			data: {
				cells: cells,
				grid_cols: set.grid_cols,
				grid_rows: set.grid_rows,
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
			}
		});
	});

	_.each(types, function(t){
		filters[t] = {
			active: true,
			$option: jQuery('option[value='+t+']', $filterSelect),
			$cells: jQuery('.cell-list .cell.type-'+t)
		};
	});

	$filterSelect.change(function(){
		var val = jQuery(this).val();
		if (val === '-- all --') {
			_.each(filters,function(f){
				f.active = true;
			});
		} else if (val === '-- none --') {
			_.each(filters,function(f){
				f.active = false;
			});
		} else {
			filters[val].active = !filters[val].active;
		}
		_.each(filters,function(f,v){
			f.$option.html(f.active ? v : '- ' + v);
			if ( f.active ) {
				f.$cells.show();
			} else {
				f.$cells.hide();
			}
		});
	});

});