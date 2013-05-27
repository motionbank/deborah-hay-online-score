
var CellView = require('js/views/cell-view');
var __super = CellView.prototype;

var CellViewText = module.exports = CellView.extend({

	// instance variables

	iframe : null,
	iframeWindow : null,
	postmessenger : null,

	initialize: function () {

		// call initialize on super!
		__super.initialize.apply(this,arguments);
	},

	render : function () {

		__super.render.apply(this,arguments);

		this.$el.addClass( 'active' );
		this.isActive = true;

		var self = this;
		var config = this.getApp().getConfig();

		self.postmessenger = this.getApp().getPostMessenger();
		
		this.iframe = jQuery( '<iframe id="iframe-'+this.cid+'" '+
									 'src="'+this.cell.get('content-url')+'" '+
									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
		this.iframe.load(function(){
			
			self.iframeWindow = document.getElementById('iframe-'+self.cid).contentWindow;
			self.postmessenger.send( 'connect', config, self.iframeWindow );
		
		});

		this.$container.empty();
		this.$container.append( this.iframe );

		return this.$el;
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