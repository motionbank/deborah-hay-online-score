/**
 *	This is the base class for the paged content views in the lower interface (sub).
 */

var SubContentContentView = module.exports = Backbone.View.extend({

	scenes : null,
	totalPages : 0,
	currentScene : null,
	currentPage : 0,
	elementId : '#missing-id',
	$pages : null,
	sub : null,
	subContent : null,

	loadData : function ( next, path ) {
		jQuery.ajax({
			url: path, dataType: 'json',
			success: function ( data ) {
				this.scenes = data;
				_.map( this.scenes, function(b){
					b.pageStart = this.totalPages;
					this.totalPages += b.html.length;
				}, this);
				this.currentScene = this.scenes[0];
				this.render();
				next();
			},
			error : function (err) {
				console.log( path );
				throw( err );
			},
			context: this
		});
	},

	render : function () {

		var $el = jQuery( '<div id="'+this.elementId+'" style="display:none;margin-top:200px"></div>' );
		this.setElement($el);
		
		var content = jQuery( _.template( require('js/templates/sub-content/paged-content'), {scenes: this.scenes} ) );
		this.$el.append( content );

		jQuery( '#sub-content' ).append( this.$el );

		jQuery( '.nav-prev', this.$el ).click(
			(function(t){return function () {
				t.prevScene.apply(t,arguments) 
			}})(this)
		);

		jQuery( '.nav-next', this.$el ).click(
			(function(t){return function () { 
				t.nextScene.apply(t,arguments)
			}})(this)
		);
	},
	
	hide : function ( next ) {

		this.$el.animate({
			marginTop: '200px'
		},{
			duration: 150,
			complete : function(){
				jQuery(this).hide();
				next();
			}
		});
	},

	show : function ( next ) {
		
		this.$el.show();
		this.showScene(true);
		this.$el.animate({
			marginTop: '0px'
		},{
			duration: 150,
			complete : next
		});
	},

	changeScene : function ( newScene, page ) {
		var pages = 0;
		if ( page ) {
			page = parseInt(page) - 1;
		} else {
			page = 0;
		}
		for ( var i = 0; i < this.scenes.length; i++ ) {
			if ( this.scenes[i].scene == newScene && this.currentScene !== this.scenes[i] ) {
				this.currentPage = pages + page;
				this.currentScene = this.scenes[i];
				this.showScene();
				return;
			}
			pages += this.scenes[i].html.length;
		}
	},

	nextScene : function () {
		this.currentPage++;
		if ( this.currentPage < this.totalPages ) {
			this.showScene();
			this.updateScene();
		} else {
			this.currentPage = this.totalPages-1;
		}
	},

	prevScene : function () {
		this.currentPage--;
		if ( this.currentPage >= 0 ) {
			this.showScene();
			this.updateScene();
		} else {
			this.currentPage = 0;
		}
	},

	updateScene : function () {
		var pages = 0;
		for ( var i = 0; i < this.scenes.length; i++ ) {
			pages += this.scenes[i].html.length;
			if ( pages > this.currentPage ) {
				this.currentScene = this.scenes[i];
				var subPage = this.currentPage-this.scenes[i].pageStart+1;
				if ( subPage > 1 ) {
					this.sub.changeSceneTo( this.scenes[i].scene, subPage );
				} else {
					this.sub.changeSceneTo( this.scenes[i].scene );
				}
				return;
			}
		}
	},

	showScene : function ( jumpTo ) {

		if ( this.$el.is(':hidden') ) return;

		if ( !this.$pages ) {
			this.$pages = jQuery( '.pages', this.$el );
		}

		var currentPosition = jQuery( '.page', this.$pages ).first().position();
		var nextPosition = jQuery( '[data-page-num="'+this.currentPage+'"]', this.$pages ).first().position();
		var css = {
			marginLeft: (currentPosition.left-nextPosition.left) + 'px'
		};

		if ( !jumpTo ) {
			this.$pages.animate( css, {
				duration: 300
			});
		} else {
			this.$pages.css(css);
		}
	}
});