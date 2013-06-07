
var CellModel = null;
var app = null, config = null;

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

	$h1Title : null, 
	$container : null,

	initialize : function ( opts, mainApp ) {

		app = mainApp;

		config = app.getConfig();

		CellModel = CellModel || require('js/models/cell-model');

		this.cell = new CellModel( opts );

		this.respondToRecordingChange 	= this.cell.get('per-recording') === 'true' ? true : false;
		this.respondToSceneChange 		= this.cell.get('per-scene') === 'false' ? false : true;

		//if ( this.respondToSceneChange ) {
			app.on( 'change:scene', function bbChangeScene (){
				this.sceneChanged.apply(this,arguments);
			}, this);
		//}

		//if ( this.respondToRecordingChange ) {
			app.on( 'change:recording', function bbChangeRecording (){
				this.recordingChanged.apply(this, arguments);
			}, this);
		//}

		this.hide();
	},

	render : function () {

		this.$el.addClass( 'type-'+this.cell.get('type') );
		
		var elHtml = _.template( require('js/templates/cell-view-tmpl'), {
			title : this.cell.get('title'),
			link : this.cell.get('link'),
			description : this.cell.get('description') || '',
			content : this.cell.get('content') || '',
		});

		this.$el.html( elHtml );
		this.$container = jQuery( '.content', this.$el );

		var previewImg = this.cell.get('poster');
		if ( !previewImg ) {
			this.$el.addClass( 'no-img' );
		}

		var self = this;
		var app = this.getApp();

		if ( 'title,text,visualization'.split(',').indexOf(this.cell.get('type')) === -1 ) {

			this.$el.click(function(evt){
				if ( self.isActive ) return;
				evt.preventDefault();

				app.trigger('grid:deactivate-all');
				app.trigger('grid:activate',self.cid);
				self.activate();
			});
		}

		return this.$el;
	},

	show : function () {

		if ( this.isVisible ) return;

		this.$el.show();
		this.isVisible = true;

		var self = this;
		var scene = app.getScene();
		var cellType = this.cell.get('type');

		if ( this.respondToSceneChange && scene ) { 

			this.sceneChanged( scene );

		} else if ( cellType !== 'title' && cellType !== 'text' ) {

			var imgSrc = this.cell.get('poster');

			if ( this.$el.css('background-image') === 'none' && imgSrc ) {
				imgSrc = 'http://' + config.cloudFront.fileHost + config.cloudFront.baseUrl + '/cells/poster/full/' + imgSrc;
				var img = new Image();
				img.onload = function () {
					self.$el.css({
						backgroundImage:'url("'+imgSrc+'")'
					});
				};
				img.onerror = function () {
					self.$el.css({
						'background-image': 'url("http://' + config.cloudFront.fileHost + 
								config.cloudFront.baseUrl + '/cells/poster/full/missing.jpg")'
					});
				};
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

		this.sceneChanged( app.getScene() );

		this.$container.html('');
	},

	recordingChanged : function (newRecording) {
	},

	sceneChanged : function (newScene) {
		if ( this.isVisible && !this.isActive ) {
			//console.log( 'scene changed: ' + newScene );
		}
	},

	getApp : function () {
		return app;
	},

	getConfig : function () {
		return config;
	}
});