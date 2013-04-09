/**
 *	Simple helper to allow asynchronous code to run in sequence
 */

var Initializer = module.exports = (function(){
	var Initializer = function () {
		this.phases = [
			'first',
			'earlier',
			'middle',
			'later',
			'last'
		];
		this.currentPhase = 0;
		this.queue = {};
		for ( var i = 0; i < this.phases.length; i++ ) {
			this.queue[this.phases[i]] = [];
		}
		this.started = false;
	}
	Initializer.prototype = {
		phases : function ( arr ) {
			if ( this.started ) {
				throw( 'Initializer: can change phases after start' );
				return;
			}
			this.phases = [];
			this.currentPhase = 0;
			for ( var i = 0; i < arr.length; i++ ) {
				this.phases.push(arr[i]);
			}
		},
		add : function () {
			// if ( this.started ) {
			// 	throw( 'Initializer: can not add after start' );
			// 	return;
			// }

			var phase = 'middle';
			var callback = function(){};
			var context = null;
			var note = '<no note>';

			if ( arguments ) {
				if ( arguments[0] && typeof arguments[0] === 'object' ) {
					
					var opts = arguments[0];
					if ( 'phase' in opts && opts.phase && typeof opts.phase === 'string' ) phase = opts.phase;
					if ( 'callback' in opts && opts.callback && typeof opts.callback === 'function' ) callback = opts.callback;
					if ( 'context' in opts && opts.context ) context = opts.context;
					if ( 'note' in opts && opts.note && typeof opts.note === 'string' ) note = opts.note;

				} else if ( arguments[0] && typeof arguments[0] === 'string' ) {
					phase = arguments[0];
					if ( arguments[1] && typeof arguments[1] === 'function' ) {
						callback = arguments[1];
					}
					if ( arguments[2] ) {
						context = arguments[2];
					}
				} else if ( arguments[0] && typeof arguments[0] === 'function' ) {
					callback = arguments[0];
					if ( arguments[1] ) {
						context = arguments[1];
					}
				}
			} else {
				return;
			}
			if ( phase in this.queue && this.queue[phase] ) {
				this.queue[phase].push([callback, context, note]);
			} else {
				throw( 'Initializer: that phase does not exist -> '+phase );
			}
		},
		next : function () {
			var bundle = this.queue[this.phases[this.currentPhase]].shift();
			while ( this.currentPhase < this.phases.length && !bundle ) {
				this.currentPhase++;
				if ( this.currentPhase < this.phases.length ) {
					bundle = this.queue[this.phases[this.currentPhase]].shift();
				}
			}
			if ( bundle ) {
				bundle[0].apply(bundle[1],[(function(i){return function(){i.next()}})(this)]);
			}
		},
		start : function () {
			this.started = true;
			this.next();
		},
		toString : function () {
			var s = '';
			for ( var i = 0, k = this.phases.length; i < k; i++ ) {
				var phase = this.phases[i];
				s += phase + "\n";
				for ( var n = 0, m = this.queue[phase].length; n < m; n++ ) {
					s += '    ' + this.queue[phase][n][2] + "\n";
				}
			}
			return s;
		}
	}
	return Initializer;
})();