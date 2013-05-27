
var CellView = require('js/views/cell-view');
var __super = CellView.prototype;

var CellViewContext = module.exports = require('js/views/cell-view').extend({
	
	initialize: function () {

		// call initialize on super!
		CellView.prototype.initialize.apply(this,arguments);

		this.respondToSceneChange = this.respondToRecordingChange = false;
	},

	activate : function () {
		this.$el.addClass( 'active' );
		this.isActive = true;

		var self = this;
		var app = this.getApp();

		this.iframe = jQuery( '<iframe id="iframe-'+this.cid+'" '+
									 'src="http://player.vimeo.com/video/'+this.cell.get('vimeo-id')+'?api=1" '+
									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
		this.iframe.load( function () {

			var win = document.getElementById('iframe-'+self.cid).contentWindow;
			var postmessenger = app.getPostMessenger();

			app.on( 'vimeo:finish', function(req, resp){
				if ( req.message.source === win ) {
					app.trigger('grid:activate-next-by-attr','vimeo-id',self.cell.get('play-next'));
					self.deactivate();
				}
			});

			app.on( 'vimeo:ready', function(req,resp){
				postmessenger.send({
					name: 'play', data: null, 
					receiver: win, receiverOrigin: 'http://player.vimeo.com',
					nameAlias: 'method', dataAlias: 'value'
				});
			});

			postmessenger.send({
				name: 'addEventListener', data: 'finish', 
				receiver: win, receiverOrigin: 'http://player.vimeo.com',
				nameAlias: 'method', dataAlias: 'value'
			});
		});

		this.$container.empty();
		this.$container.append( this.iframe );
	}
});