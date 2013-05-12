
var CellView = module.exports = require('js/views/cell-view').extend({

	respondToSceneChange : true,

	activate : function () {
		this.$el.addClass( 'active' );
		this.isActive = true;

		var self = this;

		var iframe = jQuery( '<iframe id="iframe-'+this.cid+'" src="'+this.cell.get('content-url')+'?v='+this.cell.get('title')+'&id='+this.cell.get('videoId')+'" '+
									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
		iframe.load(function(){

			var win = document.getElementById('iframe-'+self.cid).contentWindow;
			var app = self.gridView.getApp();

			app.trigger('change:recording', self.cell.get('recording'));

			var postmessenger = app.getPostMessenger();
			postmessenger.send('connect',null,win);
		});
		this.$container.empty();
		this.$container.append(iframe);
	},

	sceneChanged : function (newScene) {
		if ( this.isVisible && !this.isActive ) {
			var imgSrc = this.cfUrl + '/cells/recording/full/'+this.cell.get('title')+'-'+newScene.replace(/[^-a-z0-9]/gi,'-').replace(/-+/ig,'-')+'.png';
			var img = new Image();
			var self = this;
			img.onload = function () {
				self.$el.css({
					'background-image': 'url("'+imgSrc+'")'
				});
			}
			img.onerror = function () {
				self.$el.css({
					'background-image': 'none',
					'background-color': '#eeeeee'
				});
			}
			img.src = imgSrc;
		}
	}

});