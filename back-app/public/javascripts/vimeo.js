jQuery(function(){
	var $videoList = jQuery('.vimeo-video-list');

	if ( $videoList && $videoList.length > 0 ) {

		var triggerImportAction = function ( $listItem, $importAction ) {
			var videoId = $listItem.data('id');
			$importAction.hide();
			var ta = new TextAnimator(jQuery('.progress',$listItem),200);
			ta.start();
			jQuery.ajax({
				url: '/admin/vimeo/video/'+videoId+'/import',
				data: {},
				dataType: 'json',
				success : function (resp) {
					ta.stop();
					$importAction.show();
					$importAction.attr('href','/admin/cells/'+resp.cell.id);
					$importAction.html('done!');
				},
				error : function () {
					ta.stop();
					$importAction.show();
				}
			});
		}

		jQuery( '.list-item', $videoList ).each(function(i,v){
			var $listItem = jQuery(v);
			jQuery('.actions a.import-action', $listItem ).click(function(evt){
				evt.preventDefault();
				triggerImportAction( $listItem, jQuery(this) );
				return false;
			});
		});

		jQuery( 'a.import-all-action', $videoList ).click(function(evt){
			evt.preventDefault();
			jQuery('.list-item', $videoList ).each(function(i,a){
				triggerImportAction( jQuery(a), jQuery('.actions a.import-action', a) );
			});
			return false;
		});
	}
});