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

	var router = null;

	var api = null;

	var messenger = null;


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

		initializer.add( 'last', function(next){
			api = new PieceMakerApi( this, "a79c66c0bb4864c06bc44c0233ebd2d2b1100fbe", 
									 (false ? "http://localhost:3000" : "http://notimetofly.herokuapp.com") );
	    	api.loadPiece( 3, function(){
	    		apiPieceLoaded.apply(this,arguments);
	    		next();
	    	});
		}, this);

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

		router = new (require('js/router'))( app );

		appState = new (require('js/models/appstate'))({id:1});
	}
	App.prototype = {
	}
	return App;
})();