/**
 *	Main app.
 */


var App = module.exports = (function(){

	/*
	 +	static private variables
	 +
	 L + + + + + + + + + + + + + + + + + + + + + + + + + + */

	 // /(localhost|.+\.local)/.test(window.location.host)
	var config = require('js/config/config');

	var app = null;
	var appState = null;
	var appStarted = false;

	var router = null, slider = null, gridView = null;

	var pm = null, pmCache = null;

	var messenger = null;

	var currentScene = 'fred + ginger';
	var currentPerformance = ('D02T03,D04T03,D06T03'.split(',')[parseInt(Math.random()*3)]);
	var currentSet = false;

	var sets = {}, setsById = {};

	/*
	 +	static private helpers
	 +
	 L + + + + + + + + + + + + + + + + + + + + + + + + + + */

	var debug = function () {
		if ( config && config.debug ) {
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
		_.extend( this, Backbone.Events );
		
		initializer.add( 'last', function initCreatePieceMaker (next){
			pm = new PieceMakerApi( this, config.pieceMaker.apiKey, 'http://' + config.pieceMaker.host );
	    	pm.loadPiece( 3, function pmPieceLoaded (){
	    		apiPieceLoaded.apply(this,arguments);
	    		next();
	    	});
		}, this);

		messenger = new PostMessenger(window);

		messenger.on( 'piecemakerapi', function msgrPmApi (req,resp) {
			var cacheKey = '[' + req.data.options.type + '] ' + req.data.options.url;
			if ( cacheKey in pmCache && pmCache[cacheKey] ) {
				resp.send('piecemakerapi',{
					data: pmCache[cacheKey],
					requestId: req.data.requestId
				});
			} else {
				pm.fetch( req.data.options, 
					function ( data ) {
						if ( req.data.options.type == 'get' ) {
							pmCache[cacheKey] = data;
						}
						resp.send('piecemakerapi',{
							data: data,
							requestId: req.data.requestId
						});
					}, 
					function ( err ) {
						// TODO, handle this
						if ( config && config.debug ) console.log( err );
				});
			}
		});

		messenger.on( 'log', function msgrLog (req,resp){
			if ( config && config.debug ) console.log(req.data);
		});

		messenger.on( 'get-scene', function msgrGetScene (req,resp){
			resp.send('set-scene',currentScene);
		});

		messenger.on( 'set-scene', function msgrSetScene (req,resp){
			currentScene = req.data;
			app.trigger('change:scene',currentScene);
		});

		app.on('change:recording',function(rec){
			currentPerformance = rec;
		});

		messenger.on( 'get-config', function msgrGetConfig (req,resp){
			resp.send('set-config',config);
		});

		messenger.accept( 'http://player.vimeo.com' );
		
		// messenger.on({
		// 	matcher: 'finish', 
		// 	callback: function msgrVimeoFinish ( req, resp ) {
		// 		app.trigger('vimeo:finish', req, resp);
		// 	},
		// 	nameAlias: 'event'
		// });

		// messenger.on({
		// 	matcher: 'ready', 
		// 	callback: function msgrVimeoReady ( req, resp ) {
		// 		app.trigger('vimeo:ready', req, resp);
		// 	},
		// 	nameAlias: 'event'
		// });

		/*
		- getperformance ()
		- performance changed (perf-id)
		- getscene ()
		- scene changed (scene-id)
		- time changed (time)
		- next in line (line-id)
		*/

		gridView = new (require('js/views/set-view'))( {}, app );

		slider = new (require('js/slider'))( app );

		slider.on('all',function(){
			app.trigger.apply(app,arguments);
		});

		var startApp = function ( next ) {

			if ( appStarted ) return;
			
			var $menuContainer = jQuery('#main-menu-container');

			var dur = 1200;

			jQuery( '#content' ).
				css({
					opacity: 0
				}).
				show().
				animate({
					opacity: 1
				},{
					duration: dur, 
					query: false,
					complete: function () {
						setTimeout(function(){
							jQuery( '#main-title a' ).html('...');
							jQuery( '.content', $menuContainer ).show();
							next();
						}, dur/2);
					}
				});

			jQuery( '#cover' ).
				animate({
					opacity: 0
				},{
					duration: (2*dur)/3, 
					query: false,
					complete : function () {
						jQuery( this ).hide();
					}
				});

			appStarted = true;
		};

		router = new (require('js/router'))();

		router.on('all',function(){
			if ( !appStarted ) {
				var cb = (function(app,args){return function () {
					app.trigger.apply( app, args );
				}})(app, arguments);
				startApp( cb );
			} else {
				app.trigger.apply(app,arguments);
			}
		});

		router.on('route:changeset',function(set){
			currentSet = set;
		});

		router.on('route:selectset',function(set){
			slider.hide();
		});

		var apiRetrys = 0;
		initializer.add( function initAppApi (next){
			jQuery.ajax({
				url: 'http://' + config.apiHost + '/users/1/sets',
				dataType: 'json',
				success: function jqAjaxSuccessUserSets (userWithSets) {
					sets = {}; setsById = {};
					_.each(userWithSets.sets,function(set){
						if ( !sets[set.path] ) {
							sets[set.path] = set;
							setsById['id-'+set.id] = set;
						} else {
							throw( 'Duplicate path!', set.path, set.id, sets[set.path].id );
						}
					});
					next();
				},
				error:function (err) {
					if ( apiRetrys < 5 ) {
						setTimeout( function initAppApiRetry () {
							if ( config && config.debug ) console.log( 'Retry (@1) ' + apiRetrys );
							initAppApi( next );
						}, 200 + (apiRetrys * 200) );
						apiRetrys++;
					} else {
						throw(err);
					}
				}
			});
		}, this);

		appState = new (require('js/models/appstate'))({id:1});
	}
	App.prototype = {
		getSlider : function () {
			return slider;
		},
		getPostMessenger : function () {
			return messenger;
		},
		getScene : function () {
			return currentScene;
		},
		getPerformance : function () {
			return currentPerformance;
		},
		getSet : function ( setUrl ) {
			return sets[setUrl];
		},
		getSetById : function ( setId ) {
			return setsById['id-'+setId];
		},
		getSets : function () {
			return sets;
		},
		getConfig : function () {
			return config;
		},
		sizeChanged : function () {
			gridView.sizeChanged();
		},
		navigate : function () {
			router.navigate.apply( router, arguments ); // pass on
		}
	}
	return App;
})();