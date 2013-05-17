jQuery(function(){
  
  
  
  var $scenes 		= null,
  scenesByMarker 	= {},
  $navTabs = null;
  
  $scenes = jQuery('.scene');
  
	$scenes.each(function (i,s) {
		var $s = jQuery(s);
		scenesByMarker[$s.data('title')] = $s;
		$s.hide();
		$("#score-nav-tabs").append("<div>" + (i+1) + "</div>");
	})
	$scenes.first().show();
	
	$navTabs = $('#score-nav-tabs > *');
	
	$navTabs.first().addClass("current");
	$navTabs.click(function() {
	  $navTabs.removeClass("current");
	  $(this).addClass("current");
	  $scenes.hide();
	  $($scenes[$(this).index()]).show();
	});

/*
	var messenger 		= new PostMessenger(window),
		globalConfig 	= null,
		parentWindow 	= null,
		parentWindowOrigin = null,
		currentScene    = null;
		



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
	*/
});