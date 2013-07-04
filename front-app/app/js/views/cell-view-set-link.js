
var CellView = require('js/views/cell-view');
var __super = CellView.prototype;

var CellViewSetLink = module.exports = CellView.extend({

	respondToSceneChange : false,
	respondToRecordingChange : false,

	initialize : function () {

		__super.initialize.apply( this, arguments );
	
		var setId = this.cell.get('set-id');
		var set = this.set = this.getApp().getSetById( setId );

		if ( !this.set ) {
			throw( 'Unable to find that set! ' + setId );
		}

		this.cell.set( 'title', 		'Set: ' + set.title );
		this.cell.set( 'description', 	set.description );
		this.cell.set( 'link', 			'#set/' + set.path );
	},

	render : function () {

		__super.render.apply( this, arguments );

		var self = this;
		var app = this.getApp();
		var config = app.getConfig();

		var imgSrc 	= 'http://' +
						config.cloudFront.fileHost + 
						config.cloudFront.baseUrl + 
						'/sets/poster/full/' +
						this.set.poster;

		this.$el.css({
			'background-image' : 'url('+imgSrc+')'
		});

		this.$el.click(function(){
			app.navigate( 'set/' + self.set.path, true );
		});

		return this.$el;
	},

	show : function () {

		__super.show.apply( this, arguments );

	}

});