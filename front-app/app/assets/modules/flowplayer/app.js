jQuery(function(){

	var onLocalhost = /(localhost|.+\.local)/.test(window.location.host);

	var api = new PieceMakerApi( this, 'a79c66c0bb4864c06bc44c0233ebd2d2b1100fbe', 
								 onLocalhost ? 'http://localhost:3000' : 'http://notimetofly.herokuapp.com' );

	var parentWindow = null, parentWindowOrigin = '';
	
	var formats = [
		{ext: '.mp4', type: 'video/mp4'},
		{ext: '.ogv', type: 'video/ogg'},
		//{ext: '.webm', type: 'video/webm'}
		{ext: 'flash', type: 'video/flash'},
	];

	var cfBaseRTMP = 's12vlv7g59gljg.cloudfront.net';
	var cfBaseHTML5 = 'd35vpnmjdsiejq.cloudfront.net';
	
	var sceneEvents = [];
	var currentScene = null;

	var messenger = new PostMessenger(window);

	var videoFileName = window.location.search.split('v=')[1].split('&')[0];
	var videoId = window.location.search.split('id=')[1].split('&')[0];

	messenger.on('connect',function(req,resp){
		if ( parentWindow ) return;

		parentWindow = req.message.source;
		parentWindowOrigin = req.message.origin;

		//api.useProxy( parentWindow, parentWindowOrigin ); // TODO: repair this sucker
	});
	messenger.on('set-scene',function(req,resp){
		setToScene( req.data );
	});

	var $videoContainer = jQuery('#video-container');
	$videoContainer.html('');
	var $videoPlayer = jQuery('<video class="flowplayer" id="video-player" />');

	for ( var i = 0; i < formats.length; i++ ) {
		if ( formats[i].ext !== 'flash' ) {
			$videoPlayer.append( '<source src="http://'+cfBaseHTML5+'/piecemaker/'+videoFileName+formats[i].ext+'" type="'+formats[i].type+'">' );
		} else {
			$videoPlayer.append( '<source src="mp4:piecemaker/'+videoFileName+'" type="'+formats[i].type+'">' );
		}
	}

	$videoContainer.append( $videoPlayer );

	var opts = {
		// sources: [
		// 	{ type: 'mp4',   src: videoFolder,  					   suffix: 'mp4'  },
		// 	{ type: 'ogg',   src: videoFolder.replace('.mp4','.ogv'),  suffix: 'ogv'  },
		// 	{ type: 'flash', src: 'mp4:'+videoFolder,		  		   suffix: 'mp4'  }
		// ],
		rtmp: "rtmp://"+cfBaseRTMP+"/cfx/st",
  		swf: "http://releases.flowplayer.org/5.3.2/flowplayer.swf",
  		engine: 'flash'
	};
	//console.log( opts );

	var fPlayer = null;

	// http://flowplayer.org/docs/api.html
	// http://flash.flowplayer.org/documentation/api/
	flowplayer(function(fp){
		
		fPlayer = fp; // store it in function context

		fPlayer.bind('ready',function(){
			fPlayer.pause();
			setPlayerSize();
			api.loadVideo( videoId, videoLoaded );
		});

		fPlayer.bind('progress',function(evt){
			var now = fPlayer.video.time * 1000 + currentVideo.happened_at_float;
			var lastScene = currentScene;
			for ( var i = 0; i < sceneEvents.length-1; i++ ) {
				if ( sceneEvents[i+1].happened_at_float > now ) {
					if ( lastScene !== sceneEvents[i] ) {
						currentScene = sceneEvents[i];
						messenger.send('set-scene',currentScene.title,parentWindow);
					}
					return;
				}
			}
		});
	});

	var $videoContainer = jQuery('#video-container').flowplayer(opts);

	jQuery(window).resize(function(){
		setPlayerSize();
	});

	var setPlayerSize = function () {
		var vw = fPlayer.video.width;
		var vh = fPlayer.video.height;
		var $doc = jQuery(document.body);
		var dw = $doc.width();
		var dh = $doc.height();
		var vr = vw/vh;
		var dr = dw/dh;
		if ( dr >= vr ) {
			vw = parseInt( Math.round( vr * dh ) );
			vh = dh;
		} else {
			vh = parseInt( Math.round( dw / vr ) );
			vw = dw;
		}
		jQuery('#video-container').css({
			left: ((dw-vw) / 2) + 'px',
			top: ((dh-vh) / 2) + 'px',
			width: vw + 'px',
			height: vh + 'px'
		});
	}

	var videoLoaded = function ( video ) {
		currentVideo = video;
		api.loadEventsByTypeForVideo( currentVideo.id, 'scene', eventsLoaded );
	}

	var eventsLoaded = function ( events ) {
		sceneEvents = events.events;
		messenger.send( 'get-scene', null, parentWindow );
	}

	var setToScene = function ( newScene ) {

		if ( currentScene ) return; // block own calls after initial get-scene

		for ( var i = 0; i < sceneEvents.length; i++ ) {
			if ( sceneEvents[i].title === newScene ) {
				// if ( fPlayer.seekable ) {
					fPlayer.seek( (sceneEvents[i].happened_at_float - currentVideo.happened_at_float) / 1000.0, function () {
						currentScene = sceneEvents[i];
						fPlayer.resume();
					});
				// } else {
				// 	console.log( "setToScene, playing" );
				// 	fPlayer.play(0);
				// }
				return;
			}
		}
		// not found ... play from start i guess
		fPlayer.seek(0, function () {
			fPlayer.resume();
		});
	}

});