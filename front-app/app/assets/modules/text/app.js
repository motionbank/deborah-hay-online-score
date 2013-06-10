jQuery(function(){

	var messenger 		= new PostMessenger(window),
		globalConfig 	= null,
		parentWindow 	= null,
		parentWindowOrigin = null,
		currentScene    = null,

		$scenes 	= null,
		scenesByMarker = {},
		tabsByMarker = {},
		$navTabs 	= null;

	messenger.on('connect',function(req,res){

		if ( parentWindow ) return;

		parentWindow = req.message.source;
		parentWindowOrigin = req.message.origin;

		res.send('get-config');
		res.send('get-scene');
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

				$navTabs.removeClass("current");
				var $tab = tabsByMarker[newScene];
				if ( $tab ) {
					$tab.show();
					$tab.addClass("current");
				}

			} else {
				// TODO: how to handle this?
				//console.log( 'Unable to find scene: ' + newScene );
			}
		} else {
			// TODO, what to display if we can not make sense of the scene?
			// ... like playing a Vimeo video
		}
	}

	$scenes = jQuery('.scene');
	$scoreTabsContainer = jQuery('#score-nav-tabs');
	var tabsContainerHeight = $scoreTabsContainer.height();
	var tabHeight = null;
  
	$scenes.each(function (i,s) {
		var $s = jQuery(s), marker = $s.data('title');
		scenesByMarker[marker] = $s;
		$s.hide();
		$tab = jQuery( '<div class="tab" title="('+( i+1 )+') '+$s.data('title')+'">' + ( i+1 ) + '</div>' );
		$tab.css({
			height: (100.0/$scenes.length)+'%'
		});
		jQuery( "#score-nav-tabs" ).append( $tab );
		tabsByMarker[marker] = $tab;
	})
	$scenes.first().show();

	$navTabs = jQuery('#score-nav-tabs > *');

	$navTabs.first().addClass("current");
	$navTabs.click(function() {

		$navTabs.removeClass("current");

		var $self = jQuery(this);
		$self.addClass("current");

		$scenes.hide();

		$newScene = jQuery($scenes[$self.index()]);
		$newScene.show();

		currentScene = $newScene.data('title');
		messenger.send('set-scene',currentScene,parentWindow);
	});
});