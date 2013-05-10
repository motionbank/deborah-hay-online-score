
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