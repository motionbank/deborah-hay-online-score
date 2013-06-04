
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

		var self 	= this,
			app 	= this.getApp(),
			config 	= app.getConfig();

		if ( config.islocal ) {

			var vimeoFileName = this.cell.get('title_org').split('---')[1];
			vimeoFileName = vimeoFileName.replace(/^[\s]*/g,'').replace(/[\s]*$/g,'');
			if ( vimeoFileName.indexOf('.mp4') !== -1 ) vimeoFileName = vimeoFileName.replace('.mp4','');

			this.iframe = jQuery( '<iframe id="iframe-'+this.cid+'" '+
									 'src="modules/flowplayer/fauxmeo.html?'+
									 	'vimeo-id='+this.cell.get('vimeo-id')+'&'+
									 	'vimeo-file='+vimeoFileName+'" '+
									 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
		} else {

			this.iframe = jQuery( '<iframe id="iframe-'+this.cid+'" '+
										 'src="http://player.vimeo.com/video/'+this.cell.get('vimeo-id')+'?api=1" '+
										 'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' );
		}

		this.iframe.load( function () {

			console.log( 'iframe loaded for ..' );
			console.log( self.cid );

			var win = document.getElementById('iframe-'+self.cid).contentWindow;
			var messenger = new PostMessenger(window);

			if ( !config.islocal ) {

				app.on( 'vimeo:finish', function(req, resp){
					if ( req.message.source === win ) {
						app.trigger( 'grid:activate-next-by-attr', 
									 self.cell.get('play-next-key'),
									 self.cell.get('play-next-value') );
						self.deactivate();
					}
				});

				app.on( 'vimeo:ready', function(req,resp){
					messenger.send({
						name: 'play', data: null, 
						receiver: win, receiverOrigin: 'http://player.vimeo.com',
						nameAlias: 'method', dataAlias: 'value'
					});
				});

				messenger.send({
					name: 'addEventListener', data: 'finish', 
					receiver: win, receiverOrigin: 'http://player.vimeo.com',
					nameAlias: 'method', dataAlias: 'value'
				});

			} else {

				messenger.on( 'fauxmeo:ready', function(req, resp){
					console.log('Fauxmeo is ready');
					console.log( self.cid );
				});

				messenger.on( 'fauxmeo:finish', function(req, resp){
						console.log('Fauxmeo has finished');
					if ( req.message.source === win ) {
						console.log( 'Triggered ...', self.cid );
						app.trigger( 'grid:activate-next-by-attr',
									 self.cell.get('play-next-key'),
									 self.cell.get('play-next-value') );
						self.deactivate();
					} else {
						console.log( 'Not triggered ...', self.cid );
					}
				});

				messenger.send( 'connect', config, win );
			}
		});

		this.$container.empty();
		this.$container.append( this.iframe );
	}
});