jQuery(function(){
	jQuery( 'a[confirm]' ).click(function(evt){
		evt.preventDefault();
		var $link = jQuery(this);
		if ( confirm($link.attr('confirm')) ) {
			window.location.href = $link.attr('href');
		}
		return false;
	});
});