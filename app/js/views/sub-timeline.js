
var scenes = null;
var app = null, sub = null;

var SubViewTimeline = module.exports = Backbone.View.extend({

	el: '#sub-timeline',

	initialize : function ( initializer, parentApp, parentSubView ) {

		app = parentApp;
		sub = parentSubView;

		var self = this;

		jQuery.ajax({
			url: 'data/scenes.json',
			dataType: 'json',
			success: function (data) {
				scenes = data;

				var totalWidth = 0;
				var gaps = scenes.length * 2;
				for ( var i = 0; i < scenes.length; i++ ) {
					totalWidth += Math.max( 5, scenes[i].length * (800-gaps) );
				}
				for ( var i = 0; i < scenes.length; i++ ) {
					scenes[i].width = Math.max( 5, Math.ceil( scenes[i].length * (totalWidth-gaps) ) );
				}

				self.render();
			},
			error: function (err) {
				throw(err);
			}
		});

		sub.on('change:scene', (function(t){return function(){
			t.changeSceneTo.apply(t,arguments);
		}})(this) );
	},

	render : function () {
		
		this.$el.html( 
			_.template( require('js/templates/timeline'), { scenes: scenes })
		);

		var self = this;

		jQuery( 'a', this.$el ).each(function(i,e){
			e = jQuery(e);
			e.click(function(){
				sub.changeSceneTo(e.data('scene'));
				return false;
			});
		});
	},

	changeSceneTo : function ( scene ) {
		jQuery( '.active', this.$el ).removeClass('active');
		jQuery( '[data-scene="'+scene+'"]', this.$el ).addClass('active');
	}
});