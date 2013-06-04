jQuery(function(){

	var onLocalhost = /(localhost|.+\.local)/.test(window.location.host);

	var api = null, config = null;

	var parentWindow = null, parentWindowOrigin = '';
	
	var formats = [
		{ext: '.mp4', type: 'video/mp4'},
		{ext: '.ogv', type: 'video/ogg'},
		//{ext: '.webm', type: 'video/webm'}
		{ext: 'flash', type: 'video/flash'},
	];
	
	// var sceneEvents = [];
	// var currentScene = null;

	var vimeoId = window.location.search.split('vimeo-id=')[1].split('&')[0];
	var vimeoFile = window.location.search.split('vimeo-file=')[1].split('&')[0];

	var messenger = new PostMessenger(window);

	messenger.on('connect',function(req,resp){
		if ( parentWindow ) return;

		parentWindow = req.message.source;
		parentWindowOrigin = req.message.origin;

		config = req.data;
		// api = new PieceMakerApi( this, config.pieceMaker.apiKey, 'http://' + config.pieceMaker.host );

		initFully();

		//api.useProxy( parentWindow, parentWindowOrigin ); // TODO: repair this sucker
	});

	var initFully = function () {

		messenger.on('set-scene',function(req,resp){
			setToScene( req.data );
		});

		var $videoContainer = jQuery('#video-container');
		$videoContainer.html('');

		var $videoPlayer = jQuery('<video class="flowplayer" id="video-player" />');

		for ( var i = 0; i < formats.length; i++ ) {

			if ( formats[i].ext !== 'flash' ) {

				$videoPlayer.append( '<source src="http://' + config.fauxmeo.host + 
										config.fauxmeo.basePath + '/' + 
										vimeoFile+formats[i].ext+'" '+
										'type="'+formats[i].type+'">' );
			} else {

				// $videoPlayer.append( '<source src="mp4:dh/vimeo/'+vimeoId+'" '+
				// 						'type="'+formats[i].type+'">' );
			}
		}

		$videoContainer.append( $videoPlayer );

		var opts = {
			// sources: [
			// 	{ type: 'mp4',   src: videoFolder,  					   suffix: 'mp4'  },
			// 	{ type: 'ogg',   src: videoFolder.replace('.mp4','.ogv'),  suffix: 'ogv'  },
			// 	{ type: 'flash', src: 'mp4:'+videoFolder,		  		   suffix: 'mp4'  }
			// ],
			//rtmp: "rtmp://"+config.cloudFront.streamer+"/cfx/st",
			//swf: "http://releases.flowplayer.org/5.3.2/flowplayer.swf",
	  		//swf: "flowplayer-5.3.2/flowplayer.swf",
	  		engine: 'html5'
		};
		//console.log( opts );

		var fPlayer = null;

		// http://flowplayer.org/docs/api.html
		// http://flash.flowplayer.org/documentation/api/
		flowplayer(function(fp){
			
			fPlayer = fp; // store it in function context

			fPlayer.bind('ready',function(){
				//fPlayer.pause();
				setPlayerSize();
				//api.loadVideo( videoId, videoLoaded );

				messenger.send( 'fauxmeo:ready', null, parentWindow );
			});

			// fPlayer.bind('progress',function(evt){
			// 	var now = fPlayer.video.time * 1000 + currentVideo.happened_at_float;
			// 	var lastScene = currentScene;
			// 	for ( var i = 0; i < sceneEvents.length-1; i++ ) {
			// 		if ( sceneEvents[i+1].happened_at_float > now ) {
			// 			if ( fPlayer.seeking || !fPlayer.playing ) return;
			// 			if ( lastScene !== sceneEvents[i] ) {
			// 				currentScene = sceneEvents[i];
			// 				messenger.send( 'set-scene', currentScene.title, parentWindow );
			// 			}
			// 			return;
			// 		}
			// 	}
			// });

			fPlayer.bind('finish',function(evt){
				messenger.send( 'fauxmeo:finish', null, parentWindow );
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
					//top: ((dh-vh) / 2) + 'px',
				top: '0px',
				width: vw + 'px',
				height: vh + 'px'
			});
		}

		setPlayerSize();

		// var videoLoaded = function ( video ) {
			
		// 	currentVideo = video;
		// 	api.loadEventsByTypeForVideo( currentVideo.id, 'scene', eventsLoaded );
		// }

		// var eventsLoaded = function ( events ) {

		// 	sceneEvents = events.events;
		// 	messenger.send( 'get-scene', null, parentWindow );
		// }

		// var setToScene = function ( newScene ) {

		// 	if ( !currentScene || currentScene.title !== newScene ) { // block own calls after initial get-scene

		// 		for ( var i = 0; i < sceneEvents.length; i++ ) {
		// 			if ( sceneEvents[i].title === newScene ) {
		// 				// if ( fPlayer.seekable ) {
		// 					fPlayer.seek( (sceneEvents[i].happened_at_float - currentVideo.happened_at_float) / 1000.0, 
		// 								  function () {
		// 						currentScene = sceneEvents[i];
		// 						fPlayer.resume();
		// 					});
		// 				// } else {
		// 				// 	console.log( "setToScene, playing" );
		// 				// 	fPlayer.play(0);
		// 				// }
		// 				return;
		// 			}
		// 		}
		// 		// not found ... play from start i guess ... no better wait it out
		// 		// fPlayer.seek(0, function () {
		// 		// 	fPlayer.resume();
		// 		// });
		// 		fPlayer.pause();
		// 	}
		// }
	};
});