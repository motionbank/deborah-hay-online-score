
var gridView 	= null, 
	app 		= null, 
	rendered 	= false, 
	config 		= null;

var SelectSetView = module.exports = Backbone.View.extend({

	el : '#select-set-view',

	initialize : function ( _, gv, mapp ) {

		gridView = gv;
		app = mapp;
		config = app.getConfig();

		app.on( 'route:selectset', function () {
			this.show();
		}, this);
	},

	render : function () {

		var $sets = jQuery('#sets');
		var sets = app.getSets();
		var self = this;

		_.map(sets,function(set,path){
			var $setContainer = jQuery( '<div class="set left" />' );
			var $setLink = jQuery( '<a href="#set/'+path+'">'+
										'<div class="title">'+set.title+'</div>'+
										'<img src="http://' + config.cloudFront.fileHost + config.cloudFront.baseUrl + 
																	'/sets/poster/medium/'+set.poster+'" />'+
									'</a>' );
			$setContainer.append( $setLink );
			$setLink.click(function jqClickSet (evt){
				self.hide();
				gridView.setPosition(0);
				gridView.show();
			});
			$sets.append( $setContainer );
		});

		rendered = true;
	},

	show : function () {
		if ( !rendered ) {
			this.render();
		}
		this.$el.show();
	},

	hide : function () {
		this.$el.hide();
	}

});