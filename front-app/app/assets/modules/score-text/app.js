jQuery(function(){

	var messenger 		= new PostMessenger(window),
		globalConfig 	= null,
		parentWindow 	= null,
		parentWindowOrigin = null,
		currentScene    = null,
		$scenes 		= {};

	jQuery('.scene').each(function (i,s) {
		console.log(s);
		var $s = jQuery(s);
		$scenes[$s.data('title')] = $s;
		$s.hide();
	});

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

		if ( newScene !== currentScene && newScene in $scenes ) {
			if ( currentScene ) {
				$scenes[currentScene].hide();
			}
			$scenes[newScene].show();
			currentScene = newScene;
		} else {
			// TODO, what to display if we can not make sense of the scene?
			// ... like playing a Vimeo video
		}
	}
});