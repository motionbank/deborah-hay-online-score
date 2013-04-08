/**
 *	This view mainly takes care of the top content display.
 *
 *	
 */

/*
 +	static private variables
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

var app = null;

var menuTree = null;
var menuTreeHash = {};
var activeMenuId = null;

var views = {};

var $top = null, $topContent = null, $topContentWrapper = null;

/*
 +	static private helpers
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

var showContent = function ( id, andOpen ) {

	var $viewContent = views[id].$el;
	var viewContentPosition = $viewContent.position();
	var topContentWrapperMarginLeft = parseInt( ( $topContent.css('margin-left') || '0px' ).replace('px') );

	var tcCss = {
		marginLeft: (36-viewContentPosition.left+topContentWrapperMarginLeft) + 'px'
	};
	if ( !andOpen ) {
		$topContent.css(tcCss);
	} else {
		$topContent.animate(
		tcCss, 
		{
			duration : 300,
			queue: true
		});
	}

	$topContentWrapper.animate({ 
		height: ($viewContent.height()+36)+'px' 
	},{
		duration : 300,
		complete : function(){
			$top.addClass('open');
		},
		queue: true
	});
}

var hideContent = function () {

	$topContentWrapper.animate({
		height: '0px' 
	},{
		duration : 300,
		complete : function(){
			$top.removeClass('open');
		}
	});
}

/*
 +	"class" TopView
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

var TopView = module.exports = Backbone.View.extend({

	el : '#top-navigation',

	initialize : function ( initializer, parentApp ) {

		app = parentApp;

		var self = this;

		var loadTopNavigation = function ( next ) {
			jQuery.ajax({
				url: 'data/top-navigation.json',
				dataType: 'json',
				success: function ( data ) {
					var router = app.getRouter();
					menuTree = data;
					
					_.each( menuTree, function (item) {

						router.route( 
							item.route, 
							'page-'+item.id, 
							function(){
								self.changeTo(item.id);
							}
						);

						menuTreeHash[item.id] = item;
					});

					// add content pages
					// TODO: add these later, they will cause lot's of loading if added here at once!
					var TopContent = require('js/views/top-content');
					for ( var i = 0; i < menuTree.length; i++ ) {
						views[menuTree[i].id] = new TopContent( initializer, app, this, menuTree[i].id );
					}

					self.render();
					next();
				},
				error: function (err) {
					throw( err );
				}
			});
		}
		initializer.add(loadTopNavigation, this);

		$top = jQuery('#top');
		$topContentWrapper = jQuery( '#top-content-wrapper', $top );
		$topContent = jQuery( '#top-content', $topContentWrapper );
	},

	render : function () {

		var self = this;

		// add from template
		this.$el.html( _.template( require('js/templates/all')['top-navigation'], {items: menuTree} ) );
		
		// add action to links, are sent to router
		jQuery( 'a', this.$el ).each(function(i,e){
			e = jQuery(e);
			var eTrigger = function(evt){
				if ( e.hasClass('active') === false ) {
					app.getRouter().navigate( menuTreeHash[e.data('id')].route, {trigger:true} );
				}
				return false;
			};
			e.hover(eTrigger);
			e.click(eTrigger);
		});

		// add hover / open behaviour to top
		$top.hover(function(){
			// if ( activeMenuId ) {
			// 	showContent( activeMenuId, false );
			// }
		},function(){
			hideContent();
		});
	},

	changeTo : function ( id ) {

		//app.debug( id );

		if ( activeMenuId && activeMenuId === id ) return;

		jQuery('a.active', this.$el).removeClass('active');
		jQuery('a[data-id="'+id+'"]', this.$el).addClass( 'active' );

		if ( $top.hasClass('open') ) {
			showContent( id, true );
		} else {
			showContent( id, false );
		}

		activeMenuId = id;
	}
});