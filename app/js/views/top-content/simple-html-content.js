var SimpleHTMLContentPage = module.exports = Backbone.View.extend({

	htmlTemplate : '',
	htmlTemplateArgs : {},
	elementId : '',

	initTemplate : function ( key ) {
		this.htmlTemplate = require( 'js/templates/top-content/'+key );
		this.htmlTemplateArgs = null;
		this.elementId = 'top-content-'+key;
	},

	render : function () {
		var el = jQuery( '<div id="'+this.elementId+'" class="top-content-page"></div>' );
		jQuery( '#top-content' ).append( el );
		this.setElement( el );
		var html = _.template( this.htmlTemplate, this.htmlTemplateArgs );
		this.$el.html( html );
	}
	
});