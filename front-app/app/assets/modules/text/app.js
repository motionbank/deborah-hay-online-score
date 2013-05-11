jQuery(function(){

	var messenger 		= new PostMessenger(window),
		globalConfig 	= null,
		parentWindow 	= null,
		parentWindowOrigin = null,
		currentScene    = null,
		scenesByMarker 	= {},
		$scenes 		= null;

	$scenes = jQuery('.scene');
	$scenes.each(function (i,s) {
		var $s = jQuery(s);
		scenesByMarker[$s.data('title')] = $s;
		$s.hide();
	})
	$scenes.first().show();

	messenger.on('connect',function(req,res){

		if ( parentWindow ) return;

		parentWindow = req.message.source;
		parentWindowOrigin = req.message.origin;

		res.send('get-config');
	});

	messenger.on('set-config',function(req,res){
		globalConfig = req.data;
	});

	messenger.on('set-scene',function(req,res){
		setToScene( req.data );
	});

	var setToScene = function ( newScene ) {

		if ( newScene !== currentScene ) {
			if ( newScene in scenesByMarker ) {
				$scenes.hide();
				scenesByMarker[newScene].show();
				currentScene = newScene;
			} else {
				console.log( 'Unable to find scene: ' + newScene );
			}
		} else {
			// TODO, what to display if we can not make sense of the scene?
			// ... like playing a Vimeo video
		}
	}
});