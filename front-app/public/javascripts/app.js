(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

window.require.register("init", function(exports, require, module) {
  /**
   *	
   */

  jQuery(function(){

  	var initializer = new Initializer();
  	var app = null;

  	/*
  	 + 	this slides the start screen
  	 +
  	 L + + + + + + + + + + + + + + + + + + + + + */

  	var enterApp = function(){
  		var $toolContainer = jQuery('#tool-container');
  		var $logo = jQuery('#logo');

  		var tcHeight = $toolContainer.outerHeight();
  		var dur = 550;
  		$toolContainer.animate({
  			marginTop: (-tcHeight)+'px'
  		},{
  			duration: dur, query: false,
  			complete: function enterAppAnimateSlideComplete (){
  				setTimeout(function enterAppAnimateSlider (){
  					$mainMenuSliderLink.animate({height:'8px'},{duration:100});
  				},200);
  				$toolContainer.hide();
  			}
  		});

  		jQuery('img',$logo).animate({
  			opacity: '0'
  		},{
  			duration: dur, query: false,
  			start: function enterAppAnimateLogoStart () {
  				$logo.css({backgroundImage:'url(imgs/logo-dark.png)'});
  			}
  		});

  		return false;
  	};

  	/*
  	 + 	initializations begin here
  	 +
  	 L + + + + + + + + + + + + + + + + + + + + + */

  	initializer.add( function initCreateApp (next){
  		app = new (require('js/app'))( initializer, slider );
  		next();
  	});

  	initializer.add( function initActivateLink (next){
  		/* called from "enter" link on tool/splash screen */
  		jQuery('#link-enter-app').click(enterApp);
  		initializer.add( 'last', function initRandomSliderPosition (next) {
  			app.getSlider().setRatio( 0.25 + Math.random() * 0.5 );
  			//enterApp();
  			next();
  		});
  		next();
  	});

  	initializer.add( 'later', function initBBHistoryStart (next){
  		Backbone.history.start();
  		next();
  	});
  	
  	initializer.start();

  	/*
  	 + 	listen for window changes, this is a tough nut
  	 +
  	 L + + + + + + + + + + + + + + + + + + + + + */

  	jQuery(window).resize(function(){
  		//console.log( 'window size changed' );
  		app.sizeChanged();
  	});
  });
  
});
window.require.register("js/app", function(exports, require, module) {
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
});
window.require.register("js/models/appstate", function(exports, require, module) {
  /**
   *	
   */

  var AppStateModel = module.exports = Backbone.Model.extend({

  	localStorage: new Backbone.LocalStorage("AppStateModel"),

  	defaults : {
  		performances : [],
  		scenes : [],
  		tiles : [] // a 2D array
  	},

  });
});
window.require.register("js/models/cell-model", function(exports, require, module) {
  
  var CellModel = module.exports = Backbone.Model.extend({

  	defaults : {
  		title : 'Missing Title Here',
  		type : 'missing-type',
  		preview : null,
  		/* each field in fields [] will be mapped to this.field_key = field_value */
  		sets : [ /* sets it belongs to */ ]
  	},

  	initialize : function ( opts ) {
  		this.set( opts );
  		var self = this;
  		_.map( opts.fields, function (f) {
  			if ( self.get( f.name ) === undefined ) {
  				self.set( f.name, f.value );
  			} else {
  				console.log( 'Possible cell field conflict: ', f );
  			}
  		});
  	}

  });
});
window.require.register("js/models/set-model", function(exports, require, module) {
  
  var SetModel = module.exports = Backbone.Model.extend({

  	defaults : {
  		title : 'A set title',
  		description : 'A longer text describing this set',
  		path : 'path/to/this/set',
  		thumb_s : '',
  		thumb_m : '',
  		thumb_x : '',
  		grid_cols : '',
  		grid_rows : '',
  		creator : { /* a user */ },
  		cells : [ /* some cells */ ]
  	},

  	initialize : function () {

  	}

  });
});
window.require.register("js/router", function(exports, require, module) {
  /**
   */

  var app = null;

  var Router = module.exports = Backbone.Router.extend({

  	initialize : function ( mainApp ) {
  		app = mainApp;
  	},

  	routes : {
  		'set/:setname' : 'changeset'
  	},

  	changeset : function () {}
  	
  });
});
window.require.register("js/slider", function(exports, require, module) {
  
  var app = null;
  var $mainMenuContainer = $mainMenuSlider = $mainMenuSliderLink = null;
  var currentRatio = 0;

  var SliderController = function( app ) {

  	_.extend( this, Backbone.Events );

  	var self = this;

  	$mainMenuContainer = jQuery('#main-menu-container');
  	$mainMenuSlider = jQuery( '#slider', $mainMenuContainer ); // TODO: safari insists on the line being inside ul
  	$mainMenuSliderLink = jQuery( 'a', $mainMenuSlider );

  	var dragAreaWidth = $mainMenuContainer.width();
  	var isDragging = false, isHover = false;

  	$mainMenuSlider.draggable({
  		axis: 'x',
  		containment: $mainMenuContainer,
  		cursor : 'pointer',
  		start : function () {
  			dragAreaWidth = $mainMenuContainer.width() - $mainMenuSlider.width();
  			isDragging = true;
  		},
  		drag : function (evt, drag) {
  			self.setRatio( drag.position.left / dragAreaWidth );
  		},
  		stop: function (evt, drag) {
  			isDragging = false;
  			if ( !isHover ) {
  				$mainMenuSliderLink.animate({height: '8px'},{duration:100});
  				$mainMenuSliderLink.css({cursor:'default'});
  			}
  		}
  	});

  	$mainMenuSlider.hover(function(evt){
  		isHover = true;
  		$mainMenuSliderLink.animate({height: '72px'},{duration:100});
  		$mainMenuSliderLink.css({cursor:'move'});
  	},function(evt){
  		isHover = false;
  		if ( !isDragging ) {
  			$mainMenuSliderLink.animate({height: '8px'},{duration:100});
  			$mainMenuSliderLink.css({cursor:'default'});
  		}
  	});

  	jQuery(window).keydown(function(evt){
  		if ( evt.which == 37 ) {
  			self.backwards();
  		} else if ( evt.which == 39 ) {
  			self.forwards();
  		}
  	});

  	this.setSize( 0.1 );
  };

  SliderController.prototype = {
  	setRatio : function (r,trigger) {
  		if ( r < 0 || r > 1 ) {
  			throw( 'Bad parameter for setRatio()' ); return;
  		}
  		$mainMenuSlider.css({
  			left: (r * ($mainMenuContainer.width() - $mainMenuSliderLink.width())) + 'px'
  		});
  		if ( trigger === undefined || trigger === true )
  			this.trigger('change:slider',r);
  		currentRatio = r;
  	},
  	setSize : function ( r ) {
  		if ( r < 0 || r > 1 ) {
  			throw( 'Bad parameter for setSize() ' + r ); return;
  		}
  		if ( r == 1 ) return this.hide();

  		var containerWidth = $mainMenuContainer.width();
  		var sliderWidth = $mainMenuSliderLink.width();

  		var sizePx = r * containerWidth;
  		if ( sizePx < 10 ) sizePx = 10;

  		$mainMenuSliderLink.css({width: sizePx});

  		// TODO: reset ratio
  	},
  	forwards : function () {
  		var step = $mainMenuSliderLink.width() / ($mainMenuContainer.width() - $mainMenuSliderLink.width());
  		var nextRatio = currentRatio + step;
  		if ( nextRatio <= 1 ) {
  			this.setRatio( nextRatio );
  		} else if ( currentRatio !== 1 ) {
  			this.setRatio( 1 );
  		}
  	},
  	backwards : function () {
  		var step = $mainMenuSliderLink.width() / ($mainMenuContainer.width() - $mainMenuSliderLink.width());
  		var nextRatio = currentRatio - step;
  		if ( nextRatio >= 0 ) {
  			this.setRatio( nextRatio );
  		} else if ( currentRatio !== 0 ) {
  			this.setRatio( 0 );
  		}
  	},
  	show : function () {
  		$mainMenuSlider.show();
  	},
  	hide : function () {
  		$mainMenuSlider.hide();
  	}
  };

  module.exports = SliderController;
  
});
window.require.register("js/templates/cell-view-tmpl", function(exports, require, module) {
  module.exports = "<div class=\"info\">\n	<h1 class=\"title\"><% if ( link ) { %><a href=\"<%= link %>\"><% } %><%= title %></h1><% if ( link ) { %></a><% } %>\n</div>\n<div class=\"content\"><%= content %></div>";
  
});
window.require.register("js/views/cell-view-context", function(exports, require, module) {
  
  var CellView = module.exports = require('js/views/cell-view').extend({

  	activate : function () {
  		this.$el.addClass( 'active' );
  		this.isActive = true;

  		var self = this;
  		var iframe = jQuery( '<iframe id="iframe-'+this.cid+'" src="'+this.cell.get('contentUrl')+'?api=1" '+
  									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
  		iframe.load(function(){
  			var win = document.getElementById('iframe-'+self.cid).contentWindow;
  			var app = self.gridView.getApp();
  			var postmessenger = app.getPostMessenger();
  			app.on( 'vimeo:finish', function(req, resp){
  				if ( req.message.source === win ) {
  					self.gridView.playNext(self);
  					self.deactivate();
  				}
  			});
  			postmessenger.send({
  				name: 'addEventListener', data: 'finish', 
  				receiver: win, receiverOrigin: 'http://player.vimeo.com',
  				nameAlias: 'method', dataAlias: 'value'
  			});
  			postmessenger.send({
  				name: 'play', data: null, 
  				receiver: win, receiverOrigin: 'http://player.vimeo.com',
  				nameAlias: 'method', dataAlias: 'value'
  			});
  		});
  		this.$container.empty();
  		this.$container.append(iframe);
  	},

  });
});
window.require.register("js/views/cell-view-recording", function(exports, require, module) {
  
  var CellView = module.exports = require('js/views/cell-view').extend({

  	respondToSceneChange : true,

  	activate : function () {
  		this.$el.addClass( 'active' );
  		this.isActive = true;

  		var self = this;

  		var iframe = jQuery( '<iframe id="iframe-'+this.cid+'" src="'+this.cell.get('contentUrl')+'?v='+this.cell.get('title')+'&id='+this.cell.get('videoId')+'" '+
  									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
  		iframe.load(function(){

  			var win = document.getElementById('iframe-'+self.cid).contentWindow;
  			var app = self.gridView.getApp();

  			app.trigger('change:recording', self.cell.get('recording'));

  			var postmessenger = app.getPostMessenger();
  			postmessenger.send('connect',null,win);
  		});
  		this.$container.empty();
  		this.$container.append(iframe);
  	},

  	sceneChanged : function (newScene) {
  		if ( this.isVisible && !this.isActive ) {
  			var imgSrc = this.cfUrl + '/cells/recordings/posters/'+this.cell.get('title')+'-'+newScene.replace(/[^-a-z0-9]/gi,'-').replace(/-+/ig,'-')+'.png';
  			var img = new Image();
  			var self = this;
  			img.onload = function () {
  				self.$el.css({
  					'background-image': 'url("'+imgSrc+'")'
  				});
  			}
  			img.onerror = function () {
  				self.$el.css({
  					'background-image': 'none',
  					'background-color': '#eeeeee'
  				});
  			}
  			img.src = imgSrc;
  		}
  	}

  });
});
window.require.register("js/views/cell-view-visualization", function(exports, require, module) {
  
  var CellView = module.exports = require('js/views/cell-view').extend({

  	respondToSceneChange : true,

  	recordingChanged : function ( newRecording ) {
  		this.currentRecording = newRecording;
  		this.sceneChanged( this.currentScene );
  	},

  	sceneChanged : function ( newScene ) {
  		this.currentScene = newScene;

  		if ( newScene && this.isVisible && !this.isActive ) {

  			var self = this;

  			var scene = newScene.replace(/[^-a-z0-9]/gi,'-').replace(/-+/ig,'-');
  			var imgSrc = this.cfUrl + '/cells/'+this.cell.get('base-path');

  			if ( this.respondToRecordingChange ) {
  				imgSrc += this.currentRecording+'_';
  			}

  			if ( this.respondToSceneChange ) {
  				imgSrc += scene;
  			}

  			imgSrc += '.png';

  			var img = new Image();
  			img.onload = function () {
  				self.$el.css({
  					'background-image': 'url("'+imgSrc+'")'
  				});
  			}
  			img.onerror = function () {
  				self.$el.css({
  					'background-image': 'none'
  				});
  			}
  			img.src = imgSrc;
  		}
  	}
  });
});
window.require.register("js/views/cell-view", function(exports, require, module) {
  
  var CellModel = null;

  var CellView = module.exports = Backbone.View.extend({

  	tagName : 'article',
  	attributes : {
  		'class' : 'cell'
  	},

  	cell : null,
  	isVisible : false,
  	isActive : false,

  	currentRecording : '',
  	currentScene : '',

  	respondToSceneChange : false,
  	respondToRecordingChange : false,

  	gridView : null,

  	cfBaseHTML5 : 'd35vpnmjdsiejq.cloudfront.net',
  	cfUrl : 'http://d35vpnmjdsiejq.cloudfront.net/dh/app',

  	$h1Title : null, 
  	$container : null,

  	initialize : function ( opts, gv ) {

  		var self = this;

  		this.gridView = gv;
  		CellModel = CellModel || require('js/models/cell-model');

  		this.cell = new CellModel( opts );
  		this.gridView.$el.append( this.render() );

  		this.respondToRecordingChange = this.cell.get('per-recording') || false;

  		var app = this.gridView.getApp();

  		app.on( 'change:scene', function bbChangeScene (){
  			self.sceneChanged.apply(self,arguments);
  		});

  		app.on( 'change:recording', function bbChangeRecording (){
  			self.recordingChanged.apply(self, arguments);
  		});

  		this.hide();
  	},

  	render : function () {

  		this.$el.addClass( 'type-'+this.cell.get('type') );
  		
  		var elHtml = _.template( require('js/templates/cell-view-tmpl'), {
  			title : this.cell.get('title'),
  			link : this.cell.get('link'),
  			content : ''
  		});

  		this.$el.html( elHtml );
  		this.$container = jQuery( '.content', this.$el );

  		var previewImg = this.cell.get('preview');
  		if ( !previewImg ) {
  			this.$el.addClass( 'no-img' );
  		}

  		var self = this;

  		if ( this.cell.get('type') !== 'title' ) {
  			this.$el.click(function(evt){
  				if ( self.isActive ) return;
  				self.gridView.setClicked( self );
  				evt.preventDefault();
  				self.gridView.deactivateAll();
  				self.activate();
  			});
  		}

  		return this.$el;
  	},

  	show : function () {
  		if ( this.isVisible ) return;

  		this.$el.show();
  		this.isVisible = true;

  		var scene = this.gridView.getApp().getScene();

  		if ( this.respondToSceneChange && scene ) { 
  			this.sceneChanged( scene ); 
  		} else {
  			var imgSrc = this.cell.get('preview');
  			if ( this.$el.css('background-image') === 'none' && imgSrc ) {
  				imgSrc = this.cfUrl + '/cells/' + imgSrc;
  				var img = new Image();
  				img.onload = (function(cellView){return function domImgLoaded (){
  					cellView.$el.css({
  						backgroundImage:'url("'+imgSrc/*+'?'+(new Date()).getTime()*/+'")'
  					});
  				}})(this);
  				img.src = imgSrc;
  			}
  		}
  	},

  	hide : function () {
  		this.$el.hide();
  		this.isVisible = false;
  	},

  	activate : function () {
  		
  	},

  	deactivate : function () {
  		this.$el.removeClass( 'active' );
  		this.isActive = false;

  		this.$container.html('');
  	},

  	recordingChanged : function (newRecording) {
  	},

  	sceneChanged : function (newScene) {
  		if ( this.isVisible && !this.isActive ) {
  			//console.log( 'scene changed: ' + newScene );
  		}
  	}
  });
});
window.require.register("js/views/select-set-view", function(exports, require, module) {
  
  var gridView = null, app = null;

  var SelectSetView = module.exports = Backbone.View.extend({

  	el : '#select-set-view',

  	initialize : function ( gv, mapp ) {
  		gridView = gv;
  		app = mapp;
  	},

  	render : function () {

  		var $sets = jQuery('#sets');
  		var sets = app.getSets();
  		var self = this;

  		_.map(sets,function(set,path){
  			var $setContainer = jQuery( '<div class="set left" />' );
  			var $setLink = jQuery( '<a href="#set/'+path+'">'+
  										'<div class="title">'+set.title+'</div>'+
  										'<img src="http://d35vpnmjdsiejq.cloudfront.net/dh/app/sets/thumbs/medium/'+set.thumb+'" />'+
  									'</a>' );
  			$setContainer.append( $setLink );
  			$setLink.click(function jqClickSet (evt){
  				self.hide();
  				gridView.show();
  			});
  			$sets.append( $setContainer );
  		});
  	},

  	show : function () {
  		this.render();
  	},

  	hide : function () {
  	}

  });
});
window.require.register("js/views/set-view", function(exports, require, module) {
  
  var cellData = {}, cellViews = {}, cellViewsArr = [];
  var categories = [];

  var views = {};

  var currentCollection = [];
  var currentSet = null;

  var cellBorderHandle = 5;
  var gridXVisible = 4, gridYVisible = 3;
  var cellWidth, cellHeight;
  var lastRatio = 0.0;

  var app = null, setSelectorView = null;
  $mainTitleLink = null;

  var clickedCell = null;

  var GridView = module.exports = Backbone.View.extend({

  	el : '#grid-view',

  	initialize : function ( mainapp ) {

  		var self = this;
  		app = mainapp;

  		$mainTitleLink = jQuery('#main-title a');

  		this.$elParent = this.$el.parent();
  		
  		app.getSlider().on( 'change:slider',function bbChangeSliderCB (val){
  			self.setRatio( val );
  		});

  		app.getRouter().on( 'route:changeset',function bbRouteChangeSetCB (nextSetName){
  			self.loadSet(nextSetName);
  		});

  		setSelectorView = new (require('js/views/select-set-view'))(self, app);

  		var touchEventManager = this.$el.hammer();
  		touchEventManager.on('swiperight', function (event) {
  			event.stopPropagation();
  			app.getSlider().backwards();
  		});
  		touchEventManager.on('swipeleft', function (event) {
  			event.stopPropagation();
  			app.getSlider().forwards();
  		});
  	},

  	loadSet : function ( setUrl ) {
  		
  		var set = app.getSet( setUrl );

  		if ( !set ) {
  			throw( 'Set could not be loaded: ' + setUrl );
  			return;
  		}

  		if ( currentSet === set ) return;

  		if ( !set.cells ) {
  			var self = this;
  			jQuery.ajax({
  				url: (app.isLocal() ? 'http://localhost:5555' : 'http://deborah-hay-app.eu01.aws.af.cm') + '/sets/' + set.id,
  				dataType:'json',
  				success:function(data){
  					set.cells = data.cells;
  					self.loadSet( set.path );
  				},
  				error:function(err){
  					throw(err);
  				}
  			});
  			return;
  		}

  		_.each( cellViewsArr, function(cv, i){ cv.deactivate(); cv.hide(); });

  		currentSet = set;
  		this.updateGridDimensions();

  		views.CellView = views.CellView || require('js/views/cell-view');

  		this.$el.html(''); // TODO: more sane way of cleaning up?

  		$mainTitleLink.html( currentSet.title );

  		cellViews = {};
  		cellViewsArr = [];
  		clickedCell = null;

  		var visibleCells = gridXVisible*gridYVisible;
  		for ( var i = 0, g = visibleCells; i < currentSet.cells.length; i++ ) {

  			try {
  				views[opts.type] = views[opts.type] || require('js/views/cell-view-'+opts.type);
  			} catch (e) {}
  			
  			var opts = currentSet.cells[i];
  			opts['preview'] = opts['preview'] === 'missing.jpg' ? opts.type+'-'+i+'.jpg' : opts['preview'];

  			var cv = new ( views[opts.type] || views.CellView )( opts, this );

  			if ( i < g ) {
  				cv.show();
  			}

  			cellViews[opts.type] = cellViews[opts.type] || [];
  			cellViews[opts.type].push( cv );

  			cellViewsArr.push( cv );
  		}

  		this.updateVisibleCells();
  	},

  	setRatio : function ( ratio ) {

  		if ( !cellData || !currentSet ) return;

  		lastRatio = ratio;

  		this.updateVisibleCells();
  	},

  	updateVisibleCells : function () {

  		if ( !cellData || !currentSet ) return;

  		var gridWidth = currentSet.grid_cols;
  		var xFrom = Math.round( lastRatio * (gridWidth-gridXVisible) );
  		var cw = 100.0/gridXVisible;
  		var ch = 100.0/gridYVisible;

  		_.each( cellViewsArr, function(cv, i){ 
  			var cellDim = cv.cell.get('extra');
  			// ... not too far left or right
  			if ( !( (cellDim.x + (cellDim.width-1)) < xFrom ||
  					 cellDim.x > xFrom+gridXVisible ) 
  				) {
  				cv.show();
  				cv.$el.css({
  					position: 'absolute',
  					left: 	(cw*(cellDim.x-xFrom))+'%',
  					top: 	(ch*cellDim.y)+'%',
  					width: 	(cw*cellDim.width)+'%',
  					height: (ch*cellDim.height)+'%'
  				});
  			} else {
  				cv.hide();
  			}
  		});

  		if ( currentSet.cells.length <= (gridXVisible * gridYVisible) ) {

  			app.getSlider().hide();

  		} else {

  			app.getSlider().setSize( ((gridXVisible * gridYVisible) * 1.0) / currentSet.cells.length );
  			app.getSlider().setRatio( lastRatio, false );
  			app.getSlider().show();
  		}
  	},

  	updateGridDimensions : function () {

  		if ( !currentSet ) return;

  		var w = this.$el.width();
  		var h = this.$el.height();
  		
  		var ch = parseInt( Math.floor( h / currentSet.grid_rows ) );
  		var cw = (currentSet.cell_width / currentSet.cell_height) * ch;

  		gridXVisible = parseInt( w / cw );
  		gridYVisible = currentSet.grid_rows;

  		if ( w - (gridXVisible * cw) > cw / 2 ) {
  			gridXVisible++;
  		}
  		cw = parseInt( Math.floor( w / gridXVisible ) );

  		cellWidth = cw;
  		cellHeight = ch;
  	},

  	toggleSetSelector : function () {
  		if ( this.$elParent.css('display') === 'block' ) {
  			app.getSlider().hide();
  			setSelectorView.show();
  			this.$elParent.hide();
  		} else {
  			setSelectorView.hide();
  			app.getSlider().show();
  			this.$elParent.show();
  		}
  	},

  	toggleSetEditor : function () {

  	},

  	toggleLink : function () {

  	},

  	show : function () {
  		this.$elParent.show();
  		if ( cellData.cells && cellData.cells.length > (gridXVisible * gridYVisible) ) { // if returning to same as before
  			app.getSlider().show();
  		}
  	},

  	deactivateAll : function () {
  		if ( cellData && cellViewsArr ) {
  			for ( var i = 0; i < cellViewsArr.length; i++ ) {
  				cellViewsArr[i].deactivate();
  			}
  		}
  	},

  	setClicked : function ( cell ) {
  		clickedCell = cell.cid;
  	},

  	playNext : function ( prevCellView ) {
  		var i = cellViewsArr.indexOf( prevCellView );
  		if ( i === -1 ) return;
  		var n = i+1;
  		n %= cellViewsArr.length;
  		if ( cellViewsArr[n].cid === clickedCell ) return;
  		while ( cellViewsArr[n].isVisible === false 
  				|| cellViewsArr[n].$el.hasClass('type-context') !== true ) {
  			n++;
  			n %= cellViewsArr.length;
  			if ( n === i ) return;
  			if ( cellViewsArr[n].cid === clickedCell ) return;
  		}
  		cellViewsArr[n].activate();
  	},

  	getApp : function () {
  		return app;
  	},

  	sizeChanged : function () {
  		if ( currentSet ) {

  			var gridXVisiblePrev = gridXVisible, gridYVisiblePrev = gridYVisible;
  			this.updateGridDimensions();

  			if ( gridXVisible !== gridXVisiblePrev || gridYVisible !== gridYVisiblePrev ) {

  				this.updateVisibleCells();
  			}
  		}
  	}

  });
});
