
var CellView = module.exports = require('js/views/cell-view').extend({

	respondToSceneChange : true,

	sceneChanged : function (newScene) {

		if ( this.isVisible && !this.isActive ) {

			var self = this;
			var scene = newScene.replace(/[^-a-z0-9]/gi,'-').replace(/-+/ig,'-');
			var recording = '';

			var imgSrc = this.cfUrl + '/cells/'+this.cell.get('base-path')+scene+'.png';

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