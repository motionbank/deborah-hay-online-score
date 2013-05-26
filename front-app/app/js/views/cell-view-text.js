
var CellView = require('js/views/cell-view');
var CellViewText = module.exports = CellView.extend({

	// instance variables

	iframe : null,
	iframeWindow : null,
	postmessenger : null,

	initialize: function () {

		// call initialize on super!
		CellView.prototype.initialize.apply(this,arguments);

		this.activate();
	},

	activate : function () {
		this.$el.addClass( 'active' );
		this.isActive = true;

		var self = this;
		var app = self.gridView.getApp();
		self.postmessenger = app.getPostMessenger();
		
		this.iframe = jQuery( '<iframe id="iframe-'+this.cid+'" '+
									 'src="'+this.cell.get('content-url')+'" '+
									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
		this.iframe.load(function(){
			
			self.iframeWindow = document.getElementById('iframe-'+self.cid).contentWindow;
			self.postmessenger.send( 'connect', self.gridView.getApp().getConfig(), self.iframeWindow );
		
		});

		this.$container.empty();
		this.$container.append( this.iframe );
	},

	deactivate : function () {
		// noop
	},

	sceneChanged : function ( newScene ) {

		if ( this.isVisible ) {

			this.postmessenger.send( 'set-scene', newScene, this.iframeWindow );
		}
	}
});