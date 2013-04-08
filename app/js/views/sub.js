/**
 *	Sub is the bottom navigation.
 */

var app = null;

var menuTree = null, menuTreeHash = {};
var views = {};

var $sub;
var currentScene = null, currentContent = "";

/*
 +	The view ..
 +
 L + + + + + + + + + + + + + + + + + + + + + + + */

var SubView = module.exports = Backbone.View.extend({
	
	el : '#sub-navigation',
	
	initialize : function ( initializer, parentApp ) {
		app = parentApp;

		var loadSubNavigation = function (next) {
			var self = this;
			jQuery.ajax({
				url: 'data/sub-navigation.json',
				dataType: 'json',
				success: function (data) {
					menuTree = data;
					var router = app.getRouter();

					_.each( menuTree, function (item) {
						menuTreeHash[item.id] = item;
						router.route(
							item.route,
							'sub-page-'+item.id,
							function () {
								self.changeContentTo( item.id );
							}
						);
					});

					self.render();
					self.changeContentTo( menuTree[0].id );
					next();
				},
				error: function (err) {
					throw( err );
				}
			});
		}
		initializer.add(loadSubNavigation,this);

		var createViews = function (next) {
			views.timeline = new (require('js/views/sub-timeline'))( initializer, app, this );
			views.subContent = new (require('js/views/sub-content'))( initializer, app, this );
			next();
		}
		initializer.add(createViews,this);

		$sub = jQuery('#sub');
	},
	
	render : function () {

		// add from template
		this.$el.html( _.template( require('js/templates/all')['sub-navigation'], {items: menuTree} ) );

		// add action
		jQuery( 'a', this.$el ).each(function(i,e){
			e = jQuery(e);
			e.click(function(){
				if ( e.hasClass('active') === false ) {
					app.getRouter().navigate( menuTreeHash[e.data('id')].route, {trigger:true} );
					return false;
				}
			});
		});

		// add hover / open behaviour to top
		$sub.hover(function(){
			views.subContent.show();
		},function(){
			views.subContent.hide();
		});
	},

	changeSceneTo : function ( scene, page ) {
		app.getRouter().navigate( 'text/'+scene+(page?'/'+page:'') ,{trigger:true} );
		if ( currentScene !== scene ) {
			this.trigger('change:scene', scene, page );
			currentScene = scene;
		}
	},

	changeContentTo : function ( other ) {
		if ( other !== currentContent ) {
			currentContent = other;
			jQuery( '.active', this.$el ).removeClass( 'active' );
			jQuery( '[data-id="'+other+'"]', this.$el ).addClass( 'active' );
			this.trigger('change:content',currentContent);
		}
	}
});