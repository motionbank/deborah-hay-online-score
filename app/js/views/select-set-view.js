
var gridView = null;

var SelectSetView = module.exports = Backbone.View.extend({

	el : '#select-set-view',

	initialize : function () {
	},

	setGridView : function ( gv ) {

		gridView = gv;
		this.render(); // TODO: load later?
	},

	render : function () {

		var $sets = jQuery('#sets');
		var setUrls = gridView.getSetUrls();
		var self = this;

		for ( var k in setUrls ) {
			if ( k === '<front>' ) continue;
			var set = require('data/'+setUrls[k]);
			var $setContainer = jQuery( '<div class="set left" />' );
			var $setLink = jQuery( '<a href="#set/'+k+'">'+
										'<div class="title">'+set.title+'</div>'+
										'<img src="imgs/thumbs/'+set.thumbs.medium+'" />'+
									'</a>' );
			$setContainer.append( $setLink );
			$setLink.click(function(evt){
				self.hide();
				gridView.show();
			});
			$sets.append( $setContainer );
		}
	},

	show : function () {
		this.$el.show();
	},

	hide : function () {
		this.$el.hide();
	}

});