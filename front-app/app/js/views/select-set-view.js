
var app 		= null, 
	rendered 	= false, 
	config 		= null,
	$mainTitleLink = null;

var SelectSetView = module.exports = Backbone.View.extend({

	el : '#select-set-view',

	initialize : function ( _, gv, mapp ) {

		app = mapp;
		config = app.getConfig();

		app.on( 'route:selectset', function () {
			this.show();
		}, this);

		app.on( 'route:changeset', function () {
			this.hide();
		}, this);

		$mainTitleLink = jQuery('#main-title a');
	},

	render : function () {

		var $sets = jQuery('#set-list');
		var sets = app.getSets();
		var self = this;
		var containers = [];

		_.map(sets,function(set,path){
			var $setContainer = jQuery( '<div class="set left" />' );
			var $setLink = jQuery( '<a href="#set/'+path+'">'+
										'<div class="title">'+set.title+'</div>'+
										'<img src="http://' + config.cloudFront.fileHost + config.cloudFront.baseUrl + 
																	'/sets/poster/medium/'+set.poster+'" />'+
									'</a>' );
			$setContainer.append( $setLink );
			containers.push( $setContainer );
		});
		$sets.append( containers );

		rendered = true;
	},

	show : function () {
		
		if ( !rendered ) {
			this.render();
		}

		$mainTitleLink.html('Sets curated by Motion Bank');
		$mainTitleLink.attr('href','#sets');
		
		this.$el.show();
	},

	hide : function () {
		this.$el.hide();
	}

});