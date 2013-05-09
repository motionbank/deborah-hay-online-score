jQuery(function(){
	jQuery('#add-fields').click(function(){
		jQuery( '<input type="text" name="field_keys[]" value="" />'+
				'<input type="text" name="field_values[]" value="" /><br />').insertBefore(this);
	});
});