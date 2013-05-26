
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
	config : null,

	$h1Title : null, 
	$container : null,

	initialize : function ( opts, gv ) {

		var self = this;

		this.gridView = gv;
		this.config = this.gridView.getApp().getConfig();

		CellModel = CellModel || require('js/models/cell-model');

		this.cell = new CellModel( opts );
		this.gridView.$el.append( this.render() );

		this.respondToRecordingChange = this.cell.get('per-recording') === 'true' ? true : false;
		this.respondToSceneChange = this.cell.get('per-scene') === 'false' ? false : true;

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
		var cellType = this.cell.get('type');

		if ( this.respondToSceneChange && scene ) { 
			this.sceneChanged( scene ); 
		} else if ( cellType !== 'title' && cellType !== 'text' ) {
			var imgSrc = this.cell.get('poster');

			if ( this.$el.css('background-image') === 'none' && imgSrc ) {
				imgSrc = 'http://' + this.config.cloudFront.fileHost + this.config.cloudFront.baseUrl + '/cells/poster/full/' + imgSrc;
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

		this.sceneChanged( this.gridView.getApp().getScene() );

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