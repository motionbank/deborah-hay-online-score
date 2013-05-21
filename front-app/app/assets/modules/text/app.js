jQuery(function(){

	$scenes = jQuery('.scene');
  
	$scenes.each(function (i,s) {
		var $s = jQuery(s), marker = $s.data('title');
		scenesByMarker[marker] = $s;
		$s.hide();
		$tab = jQuery( '<div class="tab">' + ( i+1 ) + '</div>' );
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