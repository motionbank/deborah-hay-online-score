
var CellView = module.exports = require('js/views/cell-view').extend({

	respondToSceneChange : true,

	sceneChanged : function (newScene) {
		if ( this.isVisible && !this.isActive ) {
			var imgSrc = this.cfUrl + '/cells/visualization/posters/'+this.cell.get('title')+'_'+newScene.replace(/[^-a-z0-9]/gi,'-').replace(/-+/ig,'-')+'.png';
			var img = new Image();
			var self = this;
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