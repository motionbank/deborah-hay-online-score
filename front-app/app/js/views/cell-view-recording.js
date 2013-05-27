
var CellView = require('js/views/cell-view');
var __super = CellView.prototype;

var CellViewRecording = module.exports = require('js/views/cell-view').extend({

	respondToSceneChange : true,

	iFrameWindow : null,
	messenger : null,

	activate : function () {

		this.$el.addClass( 'active' );
		this.isActive = true;

		var self = this;
		var app = this.getApp();
		var config = app.getConfig();

		this.iframe = jQuery( '<iframe id="iframe-'+this.cid+'" '+
									 'src="'+this.cell.get('content-url')+'?v='+this.cell.get('file-name')+'&id='+this.cell.get('videoId')+'" '+
									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
		this.iframe.load(function(){

			self.iFrameWindow = document.getElementById('iframe-'+self.cid).contentWindow;

			app.trigger('change:recording', self.cell.get('recording'));

			messenger = app.getPostMessenger();
			messenger.send( 'connect', config, self.iFrameWindow );
		});

		this.$container.empty();
		this.$container.append( this.iframe );
	},

	sceneChanged : function (newScene) {
		if ( this.isVisible ) {
			if ( !this.isActive ) {
				var config = this.getApp().getConfig();
				var imgSrc = 'http://' + config.cloudFront.fileHost + 
								config.cloudFront.baseUrl + '/cells/recording/full/' +
								this.cell.get('file-name')+'-'+newScene.replace(/[^-a-z0-9]/gi,'-').replace(/-+/ig,'-')+'.png';
				var img = new Image();
				var self = this;
				img.onload = function () {
					self.$el.css({
						'background-image': 'url("'+imgSrc+'")'
					});
				}
				img.onerror = function () {
					self.$el.css({
						'background-image': 'url("http://' + config.cloudFront.fileHost + 
								config.cloudFront.baseUrl + '/cells/poster/full/missing.jpg")'
					});
				}
				img.src = imgSrc;
			} else {
				messenger.send( 'set-scene', newScene, this.iFrameWindow );
			}
		}
	}
});