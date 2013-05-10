jQuery(function(){

	// add a new input filed below "add field"

	jQuery('.cell-edit a.add-fields').click(function(){
		jQuery( '<input type="text" name="field_keys[]" value="" />'+
				'<input type="text" name="field_values[]" value="" /><br />').insertBefore(this);
	});

	// in lists allow for inline editing

	jQuery('.cell-list .cell a.edit-link').click(function(evt){

		var $e = jQuery(this);
		var $cell = $e.parent().parent();
		var id = $cell.data('id');

		if ( id ) {
			evt.preventDefault();
			var $cellEdit = jQuery( '.cell-edit', $cell );
			if ( $cellEdit.get(0) ) {
				$cellEdit.show();
			} else {
				jQuery.ajax({
					url : '/admin/cells/'+id+'/edit',
					dataType: 'json',
					success: function (data, status) {
						$cellEdit = jQuery( data.html );
						$cell.append( $cellEdit );
						extendCellEdit($cellEdit);
					},
					error: function (err) {
						console.log(err);
					}
				});
			}
		}

		var extendCellEdit = function ($cellEdit) {
			jQuery('form', $cellEdit).submit(function(evt){
				evt.preventDefault();
				var data = jQuery(this).serialize();
				jQuery.ajax({
					url: '/admin/cells/'+id+'/save',
					dataType: 'json',
					method: 'post',
					data: data,
					success : function ( data ) {
						var cell = data.cell;
						console.log( cell );
						jQuery( '.title', $cell ).text( cell.title );
						var img = jQuery( '.preview img', $cell );
						img.attr( 'src', img.data('base') + (cell.preview || 'missing.jpg') );
						$cellEdit.hide();
					},
					error : function (err) {
						console.log( err );
					}
				});
				return false;
			});
		}
	});
});