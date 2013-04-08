var App = module.exports = (function(){

	/*
	 +	static private variables
	 +
	 L + + + + + + + + + + + + + + + + + + + + + + + + + + */

	var app = null;
	
	var views = {};

	var router = null;
	var appState = null;
	var messenger = null;
	var iframeWindow = null;

	var api = null;
	var apiCache = {
	};
	var recordings = [], scenes = [];
	var currentRecordings = [], currentScenes = [];


	/*
	 +	static private helpers
	 +
	 L + + + + + + + + + + + + + + + + + + + + + + + + + + */

	var debug = function () {
		if ( true ) {
			for ( var i = 0; i < arguments.length; i++ ) {
				console.log( arguments[i] );
			}
		}
	}

	var apiPieceLoaded = function ( piece ) {
		//console.log( 'Piece loaded: ' + piece.id );
	}

	/*
	 +	"class" App
	 +
	 L + + + + + + + + + + + + + + + + + + + + + + + + + + */

	var App = function ( initializer ) {

		app = this;

		var loadRecordings = function ( next ) {
			jQuery.ajax({
				url: 'data/top-content/performances.json',
				dataType: 'json',
				success: function (data) {
					recordings = data.recordings;
					next();
				},
				error: function (err) {
					throw(err);
				}
			});
		}
		initializer.add(loadRecordings, this);

		var loadScenes = function ( next ) {
			jQuery.ajax({
				url: 'data/scenes.json',
				dataType: 'json',
				success: function (data) {
					scenes = data;
					next();
				},
				error: function (err) {
					throw(err);
				}
			});
		}
		initializer.add(loadScenes, this);

		var startApi = function(next){
			api = new PieceMakerApi( this, "a79c66c0bb4864c06bc44c0233ebd2d2b1100fbe", 
									 (false ? "http://localhost:3000" : "http://notimetofly.herokuapp.com") );
	    	api.loadPiece( 3, function(){
	    		apiPieceLoaded.apply(this,arguments);
	    		next();
	    	});
		}
		initializer.add('last',startApi,this);

		messenger = new PostMessenger(window);

		messenger.on( 'piecemakerapi', function (req,resp) {
			var cacheKey = '[' + req.data.options.type + '] ' + req.data.options.url;
			if ( cacheKey in apiCache && apiCache[cacheKey] ) {
				resp.send('piecemakerapi',{
					data: apiCache[cacheKey],
					requestId: req.data.requestId
				});
			} else {
				api.fetch( req.data.options, 
					function ( data ) {
						if ( req.data.options.type == 'get' ) {
							apiCache[cacheKey] = data;
						}
						resp.send('piecemakerapi',{
							data: data,
							requestId: req.data.requestId
						});
					}, 
					function ( err ) {
						console.log( err );
				});
			}
		});

		messenger.on( 'getPerformances', function (req,resp) {
			if ( currentRecordings && currentRecordings.length ) {
				resp.send('setPerformances',{
					ids: currentRecordings
				});
			}
		});

		messenger.on( 'getScenes', function (req,resp) {
			if ( currentScenes && currentScenes.length ) {
				resp.send('setScenes',{
					scenes: currentScenes
				});
			}
		});

		router = new (require('js/router'))( app );

		var initViews = function ( next ) {
			views.top = new (require('js/views/top'))( initializer, app );
			views.sub = new (require('js/views/sub'))( initializer, app );
			next();
		}
		initializer.add(initViews, this);

		appState = new (require('js/models/appstate'))({id:1});
	}
	App.prototype = {
		
		// called when iframe is loaded, see init.js
		iframeLoaded : function (evt) {
			debug( 'iframeLoaded()' );
			iframeWindow = jQuery('iframe').get(0).contentWindow;
			messenger.send('connect',{},iframeWindow);
		},

		setPerformancesById : function ( ids ) {
			currentRecordings = ids;
			messenger.send('setPerformances',{
				ids : currentRecordings
			}, iframeWindow);
		},

		setPerformancesByKey : function ( key ) {
			if ( recordings ) {
				var ids = [];
				for ( var i = 0; i < recordings.length; i++ ) {
					var name = recordings[i].name.replace(' ','-').toLowerCase();
					if ( key === 'all' || key === name ) {
						ids = ids.concat( recordings[i].ids );
					}
				}
				if ( ids.length > 0 ) {
					currentRecordings = ids;
					messenger.send('setPerformances',{
						ids : currentRecordings
					}, iframeWindow);
				}
			}
		},

		setScenes : function ( key, page ) {
			for ( var i = 0; i < scenes.length; i++ ) {
				if ( key === scenes[i].scene ) {
					currentScenes = [scenes[i].marker];
					messenger.send('setScenes',{
						scenes : currentScenes
					}, iframeWindow);
					views.sub.trigger( 'change:scene', key, page );
					return;
				}
			}
		},

		// getter for router
		getRouter : function () {
			return router;
		},

		debug : debug
	}
	return App;
})();