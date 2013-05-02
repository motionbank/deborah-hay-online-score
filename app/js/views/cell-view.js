
var CellModel = null;
var gridView = null;

var CellView = module.exports = Backbone.View.extend({

	tagName : 'article',
	attributes : {
		'class' : 'cell'
	},

	cell : null,
	isVisible : false,
	isActive : false,

	$h1Title : null, 
	$container : null,

	initialize : function ( opts, gv ) {

		var self = this;

		gridView = gv;
		CellModel = CellModel || require('js/models/cell-model');

		this.cell = new CellModel( opts );
		gridView.$el.append( this.render() );

		opts.grid = opts.grid || {x:4,y:3};
		this.$el.addClass( 'w'+opts.grid.x );
		this.$el.addClass( 'h'+opts.grid.y );

		var app = gridView.getApp();
		app.on('change:scene',function(){
			self.sceneChanged.apply(self,arguments);
		});

		this.hide();
	},

	render : function () {

		this.$el.addClass( 'type-'+this.cell.get('type') );
		
		var elHtml = _.template( require('js/templates/cell-view-tmpl'), {
			title : this.cell.get('title'),
			link : this.cell.get('link'),
			content : ''
		});

		this.$el.html( elHtml );
		this.$container = jQuery( '.content', this.$el );

		var previewImg = this.cell.get('preview');
		if ( !previewImg ) {
			this.$el.addClass( 'no-img' );
		}

		var self = this;

		if ( this.cell.get('type') !== 'title' ) {
			this.$el.click(function(evt){
				if ( self.isActive ) return;
				gridView.setClicked( self );
				evt.preventDefault();
				gridView.deactivateAll();
				self.activate();
			});
		}

		return this.$el;
	},

	show : function () {
		if ( this.isVisible ) return;

		this.$el.show();
		this.isVisible = true;

		var scene = gridView.getApp().getScene();
		if ( scene ) { 
			this.sceneChanged( scene ); 
		} else {
			var imgSrc = this.cell.get('preview');
			if ( imgSrc ) {
				imgSrc = 'imgs/cells/'+imgSrc;
				var img = new Image();
				img.onload = (function(cellView){return function(){
					cellView.$el.css({backgroundImage:'url("'+imgSrc/*+'?'+(new Date()).getTime()*/+'")'});
				}})(this);
				img.src = imgSrc;
			}
		}
	},

	hide : function () {
		this.$el.hide();
		this.isVisible = false;
	},

	activate : function () {
		
	},

	deactivate : function () {
		this.$el.removeClass( 'active' );
		this.isActive = false;

		this.$container.html('');
	},

	sceneChanged : function (newScene) {
		if ( this.isVisible && !this.isActive ) {
			//console.log( 'scene changed: ' + newScene );
		}
	}
});