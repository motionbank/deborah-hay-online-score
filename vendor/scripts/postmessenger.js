

/* NOTE ALL COMMENTS ARE REMOVED FROM SRC, PUT INTO resources/js-header.js */

// TODO:
// add WebWorkers? https://developer.mozilla.org/en-US/docs/DOM/Using_web_workers

if ( !(module && 'exports' in module) ) {
	var module = {
		exports : {}
	};
}

if ( !window ) {
	throw( 'PostMessenger can only run in a window context.' );
}

var PostMessenger = module.exports = (function(win){

	/*
	 +	Utilities
	 +
	 L + + + + + + + + + + + + + + + + + + + */

	var isArray = function ( arr ) {
		return (Object.prototype.toString.call( arr ) === '[object Array]');
	}

	var isRegex = function ( rgx ) {
		return (Object.prototype.toString.call( arr ) === '[object RegExp]');
	}

	/*
	 +	Class Matcher
	 *
	 *	TODO:
	 *		use for matching origins as well?
	 +
	 L + + + + + + + + + + + + + + + + + + + */

	 var Matcher = function ( id, matcherFn, callback, context ) {
	 	this.id = id;
	 	var self = this;
	 	this.test = function ( other ) {
	 		var res = matcherFn.apply( self, [other] );
	 		return res;
	 	}
	 	this.callback = callback;
	 	this.context = context;
	 }
	 Matcher.prototype = {
	 	handle : function ( winMessage ) {
	 		if ( 'name' in winMessage.data && 
	 			  this.test( winMessage.data.name ) ) {
	 			var response = new PostMessenger();
	 			response.to( winMessage.source );
	 			this.callback.apply( this.context, [ new Request(winMessage), response ] );
	 			return true;
	 		}
	 		return false;
	 	}
	 }

	/*
	 +	Class Request
	 +
	 L + + + + + + + + + + + + + + + + + + + */

	 var Request = function ( winMessage ) {
	 	this.name = winMessage.data.name;
	 	this.data = winMessage.data.data;
	 	this.source = winMessage.source;
	 	this.origin = winMessage.origin;
	 	this.params = {};
	 }


	/*
	 +	Class PostMessenger
	 +
	 L + + + + + + + + + + + + + + + + + + + */
	 
	/**
	 *	Constructor
	 */
	var PostMessenger = function ( aWindow ) {

		this.allowedOrigins = [];
		this.matchers = [];
		this.receivers = [];
		this.connected = false;

		if ( aWindow ) {
			this.win = aWindow;
			this.winOrigin = this.win.location.protocol + '//' + this.win.location.host;

			this.accept( this.winOrigin );
			this.connect();
		} else {
			this.winOrigin = win.location.protocol + '//' + win.location.host;
		}
	}
	PostMessenger.prototype = {
		/**
		 *	allow( arg [, ...] )
		 *
		 *	Add allowed origins.
		 *
		 *	TODO: 
		 *		add wildcards? ... http://*.moba.org ... http://www.web-*.de
		 *		and/or regex match?
		 */
		accept : function () {
			if ( arguments.length === 0 ) {
				// adds the current origin to allowed origins
				this.accept( this.winOrigin );
			} else if ( arguments.length === 1 ) {
				if ( typeof arguments[0] === 'string' ) {
					this.allowedOrigins.push( arguments[0] );
				} else if ( isArray( arguments[0] ) && arguments[0].length > 0 ) {
					for ( var i = 0, k = arguments[0].length; i < k; i++ ) {
						this.accept( arguments[0][i] );
					}
				}
			} else if ( arguments.length > 1 ) {
				for ( var i = 0, k = arguments.length; i < k; i++ ) {
					this.accept( arguments[i] );
				}
			}
		},
		/**
		 *	on( matcher, callback [, context] )
		 *
		 *	Wire up the actions to take based upon certain events.
		 *
		 *	TODO:
		 *		allow for matcher to be a function that returns true/false?
		 */
		on : function ( matcher, callback, context ) {

			var matcherFn = function () { return false; }
			
			if ( typeof matcher === 'string' ) {
				matcherFn = function ( other ) { return other === matcher };
			} else if ( isRegex(matcher) ) {
				matcherFn = function ( other ) { return other.match( matcher ) };
			} else {
				throw( 'Matcher can only be a string or regex' );
			}

			if ( typeof callback !== 'function' ) {
				throw( 'Callback needs to be a function' );
			}

			if ( !context ) context = null;

			var m = new Matcher( matcher, matcherFn, callback, context );
			this.matchers.push(m);
		},
		/**
		 *
		 */
		connect : function () {
			this.win.addEventListener( 'message', (function(pm){return function(msg){
				if ( pm.connected ) {
					(function( winMessage ) {
						if ( this.allowedOrigins.indexOf( winMessage.origin ) !== -1 ) {
							var didMatch = false;
							for ( var i = 0, k = this.matchers.length; i < k; i++ ) {
								didMatch = didMatch || this.matchers[i].handle( winMessage );
							}
							if ( !didMatch ) {
								console.log( 'Did not match and was ignored: ', winMessage, this.matchers );
							}
						} else {
							console.log( 'Origin did not match: ', winMessage.origin, this.allowedOrigins );
						}
					}).apply(pm,[msg]);
				}
			}})(this) );
			this.connected = true;
		},
		disconnect : function () {
			this.connected = false;
		},
		/**
		 *	myMessanger.add( otherWindow );
		 */
		to : function ( receiver ) {
			if ( receiver && typeof receiver === 'object' && 'postMessage' in receiver ) {
				this.receivers.push( receiver );
			}
		},
		send : function ( name, data, receiver, receiverOrigin ) {
			var message = {name: name, data: data};
			if ( receiver ) {
				receiver.postMessage( message, receiverOrigin || this.winOrigin );
			} else if ( this.receivers.length > 0 ) {
				for ( var i = 0, k = this.receivers.length; i < k; i++ ) {
					this.receivers[0].postMessage( message, this.winOrigin ); // TODO: same origin only?
				}
			}
		}
	}
	return PostMessenger;
})(window);