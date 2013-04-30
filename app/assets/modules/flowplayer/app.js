jQuery(function(){

	var onLocalhost = /(localhost|moba-lab.local)/.test(window.location.host);

	var api = new PieceMakerApi( this, 'a79c66c0bb4864c06bc44c0233ebd2d2b1100fbe', 
								 onLocalhost ? 'http://localhost:3000' : 'http://notimetofly.herokuapp.com' );

	var parentWindow = null, parentWindowOrigin = '';
	
	var formats = [
		{ext: '.mp4', type: 'video/mp4'},
		{ext: '.ogv', type: 'video/ogg'},
		//{ext: '.webm', type: 'video/webm'}
		{ext: 'flash', type: 'video/flash'},
	];

	var cloudFrontBaseURL = 's12vlv7g59gljg.cloudfront.net';
	
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

	// http://flowplayer.org/docs/api.html
	// http://flash.flowplayer.org/documentation/api/
	var fpVideoPlayer = flowplayer();

	var $videoContainer = jQuery('#video-container');
	$videoContainer.html('');
	var $videoPlayer = jQuery('<video class="flowplayer" id="video-player" width="640" height="360" style="width: 600px; height: 338px;" '+
									 //'data-rmtp="rtmp://'+cloudFrontBaseURL+'/cfx/st"'+
									 '>');

	for ( var i = 0; i < formats.length; i++ ) {
		if ( formats[i].ext !== 'flash' ) {
			$videoPlayer.append( '<source src="'+videoFileName+formats[i].ext+'" type="'+formats[i].type+'">' );
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
		rtmp: "rtmp://"+cloudFrontBaseURL+"/cfx/st",
  		swf: "http://releases.flowplayer.org/5.3.2/flowplayer.swf",
  		engine: 'flash'
	};
	//console.log( opts );

	jQuery('#video-container').flowplayer(opts);
	fpVideoPlayer = flowplayer();

	fpVideoPlayer.bind('ready',function(){
		fpVideoPlayer.pause();
		api.loadVideo( videoId, videoLoaded );
	});

	fpVideoPlayer.bind('progress',function(evt){
		var now = fpVideoPlayer.video.time * 1000 + currentVideo.happened_at_float;
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

	var videoLoaded = function ( video ) {
		currentVideo = video;
		api.loadEventsByTypeForVideo( currentVideo.id, 'scene', eventsLoaded );
	}

	var eventsLoaded = function ( events ) {
		sceneEvents = events.events;
		messenger.send('get-scene',null,parentWindow);
	}

	var setToScene = function ( newScene ) {
		for ( var i = 0; i < sceneEvents.length; i++ ) {
			if ( sceneEvents[i].title === newScene ) {
				flowplayer().seek( (sceneEvents[i].happened_at_float - currentVideo.happened_at_float) / 1000.0, function () {
					currentScene = sceneEvents[i];
					flowplayer().play();
				});
				return;
			}
		}
		flowplayer().play(); // nothing found? play from beginning i guess
	}

});