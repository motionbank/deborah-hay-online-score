
var CellView = require('js/views/cell-view');
var __super = CellView.prototype;

var CellViewContext = module.exports = require('js/views/cell-view').extend({
	
	initialize: function () {

		// call initialize on super!
		__super.initialize.apply(this,arguments);

		this.respondToSceneChange = this.respondToRecordingChange = false;
	},
	
	activate : function () {

		this.$el.addClass( 'active' );
		this.isActive = true;

		var self 	= this,
			app 	= this.getApp(),
			config 	= app.getConfig(),
			iframeWin = null;

		if ( config.islocal ) {

			var vimeoFileName = this.cell.get('vimeo-file');

			if ( !vimeoFileName ) {
				vimeoFileName = this.cell.get('title_org').split('---')[1];
				vimeoFileName = vimeoFileName.replace(/^[\s]*/g,'').replace(/[\s]*$/g,'');
				if ( vimeoFileName.indexOf('.mp4') !== -1 ) vimeoFileName = vimeoFileName.replace('.mp4','');
			}

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
		
		var messenger = self.messenger = new PostMessenger(window);

		if ( !config.islocal ) {

			messenger.accept( 'http://player.vimeo.com' )

			messenger.on({
				matcher: 'finish', 
				callback: function(req, resp){
					console.log( messenger.hash + '-finish' );
					app.trigger( 'grid:activate-next-by-attr', 
								 self.cell.get('play-next-key'),
								 self.cell.get('play-next-value') );
					self.deactivate();
				},
				nameAlias: 'event'
			});

			messenger.on({
				matcher: 'ready', 
				callback: function( req, resp ){
					console.log( messenger.hash + '-ready' );
					resp.send({
						name: 'play', data: '',
						nameAlias: 'method'
					});
				},
				nameAlias: 'event'
			});

		} else {

			messenger.on( 'fauxmeo:ready', function(req, resp){

			});

			messenger.on( 'fauxmeo:finish', function(req, resp){
				if ( req.message.source === iframeWin ) {
					app.trigger( 'grid:activate-next-by-attr',
								 self.cell.get('play-next-key'),
								 self.cell.get('play-next-value') );
					self.deactivate();
					messenger.disconnect();
				} else {
				}
			});

		}

		this.iframe.load( function () {

			iframeWin = document.getElementById('iframe-'+self.cid).contentWindow;

			if ( !config.islocal ) {

				messenger.send({
					name: 'addEventListener', data: 'finish', 
					receiver: iframeWin, receiverOrigin: 'http://player.vimeo.com',
					nameAlias: 'method', dataAlias: 'value'
				});

			} else {
				
				messenger.send( 'connect', config, iframeWin );
			
			}
		});

		this.$container.empty();
		this.$container.append( this.iframe );
	},

	deactivate : function () {
		
		__super.deactivate.apply(this,arguments);
		
		if ( this.messenger ) {
			this.messenger.disconnect();
			this.messenger = null;
		}
	}
});