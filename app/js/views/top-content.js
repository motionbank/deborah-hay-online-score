/**
 *	Top content view, wraps the fold-out menu pages at the top
 *
 *	Each top-content view has it's own template (js/templates/pages/xxx.coffee) and
 *	data file (data/top-content/xxx.json) where xxx is the view ID of the content. The
 *	view ID lives in top-navigation.json.
 */

var app = null;
var topView = null;

var TopContent = module.exports = Backbone.View.extend({

	initialize : function ( initializer, parentApp, parentTopView, aViewId ) {
		
		app = parentApp;
		topView = parentTopView;
		this.viewId = aViewId;

		var self = this;

		var loadContent = function (next) {
			jQuery.ajax({
				url: 'data/top-content/'+this.viewId+'.json',
				dataType: 'json',
				success: function(data){
					self.data = data;
					self.render();
					next();
				},
				error: function(){
					//console.log( 'No JSON found for view: '+self.viewId );
					self.data = {};
					self.render();
					next();
				}
			});
		}
		initializer.add(loadContent, this);
	},

	render : function () {

		// fetch template
		var templates = require('js/templates/all');
		var content = _.template( templates['top-content-'+this.viewId], this.data );
		var section = _.template( templates['top-content-page'], {id: this.viewId, content: content} );

		// create, set element
		var el = jQuery( section );
		jQuery( '#top-content' ).append( el );
		this.setElement( el );

		// wire actions
		var self = this;
		jQuery( 'a.action', this.$el ).each(function(i,e){
			e = jQuery(e);
			e.click(function(evt){
				app.getRouter().navigate(self.viewId+'/'+e.data('path'),{trigger:true});
				jQuery( '.active', self.$el ).removeClass('active');
				e.addClass( 'active' );
				return false;
			});
			e.removeClass( 'action' );
		});
	}
});