
var gridView = null, app = null;

var SelectSetView = module.exports = Backbone.View.extend({

	el : '#select-set-view',

	initialize : function ( gv, mapp ) {
		gridView = gv;
		app = mapp;
	},

	render : function () {

		var $sets = jQuery('#sets');
		var sets = app.getSets();
		var self = this;

		_.map(sets,function(set,path){
			var $setContainer = jQuery( '<div class="set left" />' );
			var $setLink = jQuery( '<a href="#set/'+path+'">'+
										'<div class="title">'+set.title+'</div>'+
										'<img src="http://d35vpnmjdsiejq.cloudfront.net/dh/app/sets/thumbs/medium/'+set.thumb_m+'" />'+
									'</a>' );
			$setContainer.append( $setLink );
			$setLink.click(function(evt){
				self.hide();
				gridView.show();
			});
			$sets.append( $setContainer );
		});
	},

	show : function () {
		this.render();
		this.$el.show();
	},

	hide : function () {
		this.$el.hide();
	}

});