
var CellView = require('js/views/cell-view');
var __super = CellView.prototype;

var currentlyPlaying = null;

var CellViewRecording = module.exports = require('js/views/cell-view').extend({

	respondToSceneChange : true,

	iFrameWindow : null,
	messenger : null,

	render: function () {

		// call render on super!
		var rendered = __super.render.apply(this,arguments);

		if ( this.cell.get('auto-activate-on-start') ) {
			this.activate();
		}

		return rendered;
	},

	activate : function () {

		this.$el.addClass( 'active' );
		this.isActive = true;

		var self = this;
		var app = this.getApp();
		var config = app.getConfig();

		currentlyPlaying = this;

		this.iframe = jQuery( '<iframe id="iframe-'+this.cid+'" '+
									 'src="'+this.cell.get('content-url')+'?'+
									 	'v='+this.cell.get('file-name')+'&'+
									 	'id='+this.cell.get('videoId')+'" '+
									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );

		this.iframe.load(function(){

			self.iFrameWindow = document.getElementById('iframe-'+self.cid).contentWindow;

			// TODO: potantially problematic as you'd see some old / unrelated material
			if ( self.cell.get('recording') ) {
				app.trigger('change:recording', self.cell.get('recording'));
			}

			messenger = app.getPostMessenger();
			messenger.send( 'connect', config, self.iFrameWindow );

			messenger.on( 'flowplayer:finish', function(req, resp){
				app.trigger( 'grid:activate-next-by-attr', 
							 currentlyPlaying.cell.get('play-next-key'), 
							 currentlyPlaying.cell.get('play-next-value') ); // TODO! why are these not all called?

				currentlyPlaying = null;
				self.deactivate();
			});
		});

		this.$container.empty();
		this.$container.append( this.iframe );
	},

	sceneChanged : function (newScene) {
		var app = this.getApp();

		if ( this.isVisible ) {
			if ( !this.isActive ) {
				var config = app.getConfig();
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
				app.getPostMessenger().send( 'set-scene', newScene, this.iFrameWindow );
			}
		}
	}
});