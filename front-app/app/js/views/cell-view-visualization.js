
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