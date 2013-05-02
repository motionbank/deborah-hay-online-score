
var CellView = module.exports = require('js/views/cell-view').extend({

	activate : function () {
		this.$el.addClass( 'active' );
		this.isActive = true;

		var self = this;

		var iframe = jQuery( '<iframe id="iframe-'+this.cid+'" src="'+this.cell.get('contentUrl')+'?v='+this.cell.get('title')+'&id='+this.cell.get('videoId')+'" '+
									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
		iframe.load(function(){
			var win = document.getElementById('iframe-'+self.cid).contentWindow;
			var app = gridView.getApp();
			var postmessenger = app.getPostMessenger();

			postmessenger.send('connect',null,win);

			// app.on( 'vimeo:finish', function(req, resp){
			// 	if ( req.message.source === win ) {
			// 		gridView.playNext(self);
			// 		self.deactivate();
			// 	}
			// });
			// postmessenger.send({
			// 	name: 'addEventListener', data: 'finish', 
			// 	receiver: win, receiverOrigin: 'http://player.vimeo.com',
			// 	nameAlias: 'method', dataAlias: 'value'
			// });
			// postmessenger.send({
			// 	name: 'play', data: null, 
			// 	receiver: win, receiverOrigin: 'http://player.vimeo.com',
			// 	nameAlias: 'method', dataAlias: 'value'
			// });
		});
		this.$container.empty();
		this.$container.append(iframe);
	},

	sceneChanged : function (newScene) {
		if ( this.isVisible && !this.isActive ) {
			var imgSrc = 'imgs/cells/recordings/posters/'+this.cell.get('title')+'-'+newScene.replace(/[^-a-z0-9]/gi,'-').replace(/-+/ig,'-')+'.png';
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