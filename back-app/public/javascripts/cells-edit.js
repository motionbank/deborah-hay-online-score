jQuery(function(){

	// add a new input filed below "add field"

	jQuery('.cell-edit a.add-fields:not(.cell-add-fields)').click(function(evt){
		evt.preventDefault();
		jQuery( '<input type="text" name="field_keys" value="" />'+
				'<input type="text" name="field_values" value="" /><br />').insertBefore(this);
		return false;
	}).addClass('cell-add-fields');

	// in lists allow for inline editing

	jQuery('.cell-list .cell:not(.cell-edit-inline)').each(function(i,e){

		var $cell = jQuery(e);
		var id = $cell.data('id');
		var $editLink = jQuery('a.edit-action', $cell);

		$editLink.click(function(evt){

			if ( id ) {
				evt.preventDefault();

				var $cellEdit = jQuery( '.cell-edit', $cell );
				var $otherForm = jQuery( '.cell-form:not(.cell-edit)', $cell );
				$otherForm.hide();

				if ( $cellEdit.get(0) ) {
					$cellEdit.toggle();
				} else {
					jQuery.ajax({
						url : '/admin/cells/'+id+'/edit',
						dataType: 'json',
						success: function (data, status) {
							$cellEdit = jQuery( data.html );
							if ( jQuery('.cell-list') ) {
								jQuery( '.poster-container', $cellEdit ).hide();
							}
							$cell.append( $cellEdit );
							extendCellEdit($cellEdit);
						},
						error: function (err) {
							console.log(err);
						}
					});
				}
			}
		});

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
						jQuery( '.title a', $cell ).text( cell.title );
						var img = jQuery( '.poster img', $cell );
						img.attr( 'src', img.data('base') + (cell.poster || 'missing.jpg') );
						$cellEdit.hide();
					},
					error : function (err) {
						console.log( err );
					}
				});
				return false;
			});
		};

	}).addClass('cell-edit-inline');
});