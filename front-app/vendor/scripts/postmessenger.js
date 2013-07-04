/* NOTE ALL COMMENTS ARE REMOVED FROM SRC, PUT INTO resources/js-header.js */

// TODO:
// add WebWorkers? https://developer.mozilla.org/en-US/docs/DOM/Using_web_workers
// add WebSockets?

if ( !(module && 'exports' in module) ) {
	var module = {
		exports : {}
	};
}

if ( !window ) {
	throw( 'PostMessenger can only run in a window context.' );
}

var PostMessenger = module.exports = (function(win){

	var gPostMassengerId = (new Date()).getTime();

	/*
	 +	Utilities
	 +
	 L + + + + + + + + + + + + + + + + + + + */

	var isArray = function ( arr ) {
		return (Object.prototype.toString.call( arr ) === '[object Array]');
	}

	var isRegex = function ( rgx ) {
		return (Object.prototype.toString.call( rgx ) === '[object RegExp]');
	}

	var debug = function () {
		console.log( arguments );
	}

	var sendArgsToOpts = function ( nameOrOpts, data, receiver, receiverOrigin ) {
		var opts = !(arguments.length === 1 && typeof nameOrOpts === 'object') ? {
				name: nameOrOpts, 
				data: data, 
				receiver: receiver, 
				receiverOrigin: receiverOrigin
			} : nameOrOpts;
		return opts;
	}

	/*
	 +	Class Matcher
	 *
	 *	TODO:
	 *		use for matching origins as well?
	 +
	 L + + + + + + + + + + + + + + + + + + + */

	 var Matcher = function ( id, matcherFn, callback, context, nameAlias, dataAlias ) {

	 	this.id = id;
	 	var self = this;
	 	this.test = function ( other ) {
	 		var res = matcherFn.apply( self, [other] );
	 		return res;
	 	}
	 	this.callback = callback;
	 	this.context = context;
	 	this.nameAlias = nameAlias;
	 	this.dataAlias = dataAlias;
	 }
	 Matcher.prototype = {
	 	handle : function ( winMessage ) {
	 		if ( typeof winMessage.data !== 'string' ) {
	 			debug( 'Ignored message because it\'s not a json string' );
	 			return;
	 		}
	 		var data = winMessage.dataParsed = JSON.parse( winMessage.data );
	 		if ( this.nameAlias in data && 
	 			  this.test( data[this.nameAlias] ) ) {
	 			// var response = new PostMessenger();
	 			// response.to( winMessage.source );
	 			var matcher = this;
	 			var response = {
	 				send: function () {
	 					var opts = sendArgsToOpts.apply(null, arguments);
	 					opts.receiver = winMessage.source;
	 					opts.receiverOrigin = winMessage.origin;
	 					opts.nameAlias = opts.nameAlias || matcher.nameAlias;
	 					opts.dataAlias = opts.dataAlias || matcher.dataAlias;
	 					opts.callback = opts.context || matcher.context;

	 					PostMessenger.prototype.send.apply(PostMessenger,[opts]);
	 				}
	 			}
	 			this.callback.apply( this.context, [ new Request(this, winMessage), response ] );
	 			return true;
	 		}
	 		return false;
	 	}
	 }

	/*
	 +	Class Request
	 +
	 L + + + + + + + + + + + + + + + + + + + */

	 var Request = function ( matcher, winMessage ) {
	 	this.name = winMessage.dataParsed[matcher.nameAlias];
	 	this.data = winMessage.dataParsed[matcher.dataAlias];
	 	this.source = winMessage.source;
	 	this.origin = winMessage.origin;
	 	this.message = winMessage;
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

		this.hash = btoa( 'PM' + (++gPostMassengerId) ) . toUpperCase();
		console.log( 'new PostMessenger#' + this.hash );

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
		on : function ( matcherOrOpts, callback, context ) {

			var opts = !(arguments.length === 1 && typeof matcherOrOpts === 'object') ? {
				matcher: matcherOrOpts, callback: callback, context: context
			} : matcherOrOpts;
			opts.nameAlias = opts.nameAlias || 'name';
			opts.dataAlias = opts.dataAlias || 'data';

			var matcherFn = function () { return false; }
			
			if ( typeof opts.matcher === 'string' ) {
				matcherFn = function ( other ) { return other === opts.matcher };
			} else if ( isRegex( opts.matcher ) ) {
				matcherFn = function ( other ) { return other.match( opts.matcher ) };
			} else {
				throw( 'Matcher can only be a string or regex' );
			}

			if ( typeof opts.callback !== 'function' ) {
				throw( 'Callback needs to be a function' );
			}

			if ( !opts.context ) opts.context = null;

			var m = new Matcher( 
				opts.matcher, matcherFn, 
				opts.callback, opts.context, 
				opts.nameAlias, opts.dataAlias );
			this.matchers.push(m);

			return m;
		},
		/**
		 *
		 */
		connect : function () {
			this.win.addEventListener( 'message', 
									  (function connectIIFE (pm){
									  	 return function connectCurry (msg){
				if ( pm.connected ) {
					(function connectHandleReceiveMessage ( winMessage ) {
						if ( this.allowedOrigins.indexOf( winMessage.origin ) !== -1 ) {
							var didMatch = false;
							for ( var i = 0, k = this.matchers.length; i < k; i++ ) {
								didMatch = didMatch || this.matchers[i].handle( winMessage );
							}
							if ( !didMatch ) {
								console.log( 'Did not match and was ignored: ' );
								try { console.log( winMessage.data, winMessage.origin ); } catch ( e ) {}
								console.log( 'Matchers', this.matchers );
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
		 *	myMessenger.add( otherWindow );
		 */
		to : function ( receiver ) {
			if ( receiver && typeof receiver === 'object' && 'postMessage' in receiver ) {
				this.receivers.push( receiver );
			} else {
				debug( 'This receiver was ignored: ', receiver );
			}
		},
		/**
		 *	This should become : 
		 *		- send( name, data, receiver, receiverOrigin )
		 *		- send({ name: ..., data: ..., receiver: ..., receiverOrigin: ..., nameAlias: ..., dataAlias: ..., args: {...} })
		 */
		send : function ( nameOrOpts, data, receiver, receiverOrigin ) {

			var opts = sendArgsToOpts.apply(null, arguments);

			opts.receiverOrigin = opts.receiverOrigin || this.winOrigin;
			opts.nameAlias = opts.nameAlias || 'name';
			opts.dataAlias = opts.dataAlias || 'data';

			var message = {};
			message[opts.nameAlias] = opts.name;
			message[opts.dataAlias] = opts.data;

			if ( opts.args && typeof opts.args === 'object' ) {
				for ( var k in opts.args ) {
					if ( !( k in message ) ) {
						message[k] = opts.args[k];
					}
				}
			}

			if ( opts.receiver ) {
				var msg = JSON.stringify(message);
				if ( 'postMessage' in opts.receiver && opts.receiver.postMessage ) {
					opts.receiver.postMessage( msg, opts.receiverOrigin );
				}
			} else if ( this.receivers.length > 0 ) {
				var msg = JSON.stringify(message);
				for ( var i = 0, k = this.receivers.length; i < k; i++ ) {
					this.receivers[0].postMessage( msg, opts.receiverOrigin ); // TODO: same origin only?
				}
			}
		}
	}
	return PostMessenger;
})(window);