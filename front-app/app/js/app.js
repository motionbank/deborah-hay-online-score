/**
 *	Main app.
 */


var App = module.exports = (function(){

	/*
	 +	static private variables
	 +
	 L + + + + + + + + + + + + + + + + + + + + + + + + + + */

	var app = null;
	var appState = null;

	var router = slider = null, gridView = null;

	var onLocalhost = false;
	var api = null;

	var messenger = null;

	var currentScene = '';
	var currentPerformance = '';

	var sets = {};

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
		_.extend( this, Backbone.Events );

		onLocalhost = /(localhost|.+\.local)/.test(window.location.host);
		
		initializer.add( 'last', function initCreatePieceMaker (next){
			api = new PieceMakerApi( this, "a79c66c0bb4864c06bc44c0233ebd2d2b1100fbe", 
									 (onLocalhost ? 'http://localhost:3000' : 'http://notimetofly.herokuapp.com') );
	    	api.loadPiece( 3, function pmPieceLoaded (){
	    		apiPieceLoaded.apply(this,arguments);
	    		next();
	    	});
		}, this);

		messenger = new PostMessenger(window);

		messenger.on( 'piecemakerapi', function msgrPmApi (req,resp) {
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

		messenger.on( 'get-scene', function msgrGetScene (req,resp){
			resp.send('set-scene',currentScene);
		});

		messenger.on( 'set-scene', function msgrSetScene (req,resp){
			currentScene = req.data;
			app.trigger('change:scene',currentScene);
		});

		messenger.on( 'get-config', function msgrGetScene (req,resp){
			resp.send('set-config',{
				onLocalhost : onLocalhost
			});
		});

		messenger.accept( 'http://player.vimeo.com' );
		messenger.on({
			matcher: 'finish', 
			callback: function msgrVimeoFinish ( req, resp ) {
				app.trigger('vimeo:finish', req, resp);
			},
			nameAlias: 'event'
		});

		/*
		- getperformance ()
		- performance changed (perf-id)
		- getscene ()
		- scene changed (scene-id)
		- time changed (time)
		- next in line (line-id)
		*/

		slider = new (require('js/slider'))();

		router = new (require('js/router'))( app );

		gridView = new (require('js/views/set-view'))( app );

		initializer.add( function initAppApi (next){
			jQuery.ajax({
				url: ( onLocalhost ? 'http://localhost:5555' : 'http://deborah-hay-app.eu01.aws.af.cm' ) + '/users/1/sets',
				dataType: 'json',
				success: function jqAjaxSuccessUserSets (userWithSets) {
					sets = {};
					_.each(userWithSets.sets,function(set){
						if ( !sets[set.path] ) {
							sets[set.path] = set;
						} else {
							throw( 'Duplicate path!', set.path, set.id, sets[set.path].id );
						}
					});
					gridView.loadSet('overview');
					next();
				},
				error:function (err) {
					throw(err);
				}
			});
		}, this);

		jQuery( '#change-set-item a' ).click(function jqClickChangeSet (evt){
			evt.preventDefault();
			gridView.toggleSetSelector();
		});
		jQuery( '#link-to-set-item a' ).click(function jqClickGetLink (evt){
			evt.preventDefault();
			gridView.toggleLink();
		});
		jQuery( '#edit-set-item a' ).click(function jqClickEditSet (evt){
			evt.preventDefault();
			gridView.toggleSetEditor();
		});

		appState = new (require('js/models/appstate'))({id:1});
	}
	App.prototype = {
		// setRatio : function (r) {
		// 	gridView.setRatio(r);
		// },
		getRouter : function () {
			return router;
		},
		getSlider : function () {
			return slider;
		},
		getPostMessenger : function () {
			return messenger;
		},
		getScene : function () {
			return currentScene;
		},
		getSet : function (setUrl) {
			return sets[setUrl];
		},
		getSets : function () {
			return sets;
		},
		isLocal : function () {
			return onLocalhost;
		},
		sizeChanged : function () {
			gridView.sizeChanged();
		}
	}
	return App;
})();