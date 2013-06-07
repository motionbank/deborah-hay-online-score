
var CellView = module.exports = require('js/views/cell-view').extend({

	respondToSceneChange : true,

	recordingChanged : function ( newRecording ) {
		
		this.sceneChanged( this.currentScene );
	},

	sceneChanged : function ( newScene ) {
		this.currentScene = newScene;

		if ( newScene && this.isVisible && !this.isActive ) {

			var self 	= this;
			var app 	= this.getApp();
			var config 	= app.getConfig();

			var scene 	= newScene.replace(/[^-a-z0-9]/gi,'-').replace(/-+/ig,'-');
			var imgSrc 	= 'http://' + config.cloudFront.fileHost + 
								config.cloudFront.baseUrl + 
									'/cells/visualization/full/'+this.cell.get('base-path');

			var pathPieces = [];

			if ( this.respondToRecordingChange === true ) {
				pathPieces.push( app.getPerformance() );
			}

			if ( this.respondToSceneChange === true ) {
				pathPieces.push( scene );
			}

			imgSrc += pathPieces.join('_');

			imgSrc += '.png';

			if ( this.cell.get('fixed-image') ) {
				imgSrc = 'http://' + config.cloudFront.fileHost + 
								config.cloudFront.baseUrl + 
									'/cells/visualization/full/' + this.cell.get('fixed-image');
			}

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