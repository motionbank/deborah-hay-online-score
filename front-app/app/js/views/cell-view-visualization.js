
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
			var imgSrc = 'http://' + this.config.cloudFront.fileHost + 
							this.config.cloudFront.baseUrl + 
								'/cells/visualization/full/'+this.cell.get('base-path');

			var pathPieces = [];

			if ( this.respondToRecordingChange ) {
				pathPieces.push( this.currentRecording );
			}

			if ( this.respondToSceneChange ) {
				pathPieces.push( scene );
			}

			imgSrc += pathPieces.join('_');

			imgSrc += '.png';

			var img = new Image();
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
		}
	}
});