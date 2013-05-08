jQuery(function(){

	var tplTableRow = '<td class="grid-cell <%= classes.join(\' \') %>" '+
						  'data-x="<%= x %>" '+
						  'data-y="<%= y %>"><%= html %></td>'

	var $table = jQuery( '.grid' );

	var resetTableWidth = function () {
		var ch = (144-10) / layoutEditor.set.grid_y;
		var cw = (layoutEditor.set.grid_width / layoutEditor.set.grid_height) * ch;
		var table_width = cw * layoutEditor.set.grid_x + 10;
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

	resetTableWidth();

	jQuery('.cell-list .cell').each(function(i,e){
		var $e = jQuery(e);
		$e.draggable({
			revert: true,
			revertDuration: 20,
			helper: 'clone',
			appendTo: '#main',
			containment: '#main',
			// cursorAt: {
			// 	left: $e.width()/2, 
			// 	//top: $e.height()/2
			// }
		});
	});

	var droppableGridCellOpts = {
		over: function () {
			var $cell = jQuery(this);
			$cell.css({
				backgroundColor: 'white'
			})
		},
		out: function () {
			var $cell = jQuery(this);
			$cell.css({
				backgroundColor: ''
			})
		},
		drop: function (evt, ui) {

			var $cell = jQuery(this);
			var $item = ui.draggable;
			$item.data('droppedOnGrid',true);

			$cell.css({
				backgroundColor: ''
			});

			if ( $item.hasClass('grid-cell') ) {

				if ( $item.hasClass('add-x') || $cell.hasClass('add-x') ) return;
				if ( $item.hasClass('add-y') || $cell.hasClass('add-y') ) return;
				
				// swap IDs
				var cellId = $cell.data('id'),
					itemId = $item.data('id');

				var cBgImg = $cell.css('background-image'),
					iBgImg = $item.css('background-image');

				$cell.data('id',itemId||null);
				//$cell.html(itemId||'');
				$cell.css({
					backgroundImage: iBgImg
				});
				$item.data('id',cellId||null);
				//$item.html(cellId||'');
				$item.css({
					backgroundImage: cBgImg
				});

			} else {

				var columns = jQuery('tr:first', $table).children().length-1;
				var rows = jQuery('tr',$table).length-1;

				if ( $cell.hasClass('add-x') ) {
					$cells = addColumn(columns,rows);
					if (columns === 0 && rows === 0) {
						addRow(columns+1,rows);
						layoutEditor.set.grid_y++;
					}
					$cell = $cells[$cell.data('y')];
					
					layoutEditor.set.grid_x++;
					resetTableWidth();
				} else if ( $cell.hasClass('add-y') ) {
					$cells = addRow(columns,rows);
					$cell = $cells[$cell.data('x')];

					layoutEditor.set.grid_y++;
					resetTableWidth();
				}
				
				var id = $item.data( 'id' );
				
				$cell.data( 'id', id );
				//$cell.html( id );
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
	var draggableGridCellOpts = {
		revert: true,
		revertDuration: 20,
		start : function (evt,ui) {
			jQuery(this).css({zIndex:999});
			
			ui.helper.data('droppedOnGrid',false);
		},
		stop : function (evt,ui) {
			jQuery(this).css({zIndex:'auto'});

			if ( ui.helper.data('droppedOnGrid') === false ) {
				ui.helper.data('id',null);
				ui.helper.css({
					backgroundImage: 'none'
				});
			}
		}
	};

	jQuery('.grid .grid-cell').droppable(
		droppableGridCellOpts).each(function(i,e){
			$e = jQuery(e);
			if ( $e.hasClass('add-x') || $e.hasClass('add-y') ) return;
			$e.draggable(draggableGridCellOpts);
		});

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

	jQuery('#actions form').submit(function(evt){

		evt.preventDefault();

		// TODO: lock interface

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
			url: '/admin/sets/'+layoutEditor.set.id+'/save-cells',
			data: {
				cells: cells,
				grid_x: layoutEditor.set.grid_x,
				grid_y: layoutEditor.set.grid_y,
			},
			method: 'post',
			success : function () {
				window.location.href = window.location.href;
			},
			error : function () {
				console.log( arguments );
			}
		});
	});
})