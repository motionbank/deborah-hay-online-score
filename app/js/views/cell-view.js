
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

		gridView = gv;
		CellModel = CellModel || require('js/models/cell-model');

		this.cell = new CellModel( opts );
		gridView.$el.append( this.render() );

		opts.grid = opts.grid || {x:4,y:3};
		this.$el.addClass( 'w'+opts.grid.x );
		this.$el.addClass( 'h'+opts.grid.y );

		this.hide();
	},

	render : function () {

		this.$el.addClass( this.cell.get('type') );
		
		var elHtml = _.template( require('js/templates/cell-view-tmpl'), {
			title : this.cell.get('title'),
			content : ''
		});

		this.$el.html( elHtml );
		this.$container = jQuery( '.content', this.$el );

		var previewImg = this.cell.get('preview');
		if ( previewImg ) {
			this.$el.css({
				'background-image' : 'url(imgs/cells/'+previewImg+')'
			});
		} else {
			this.$el.addClass( 'no-img' );
		}

		var self = this;

		this.$el.click(function(evt){
			if ( self.isActive ) return;
			evt.preventDefault();
			gridView.deactivateAll();
			self.activate();
		});

		return this.$el;
	},

	show : function () {
		this.$el.show();
		this.isVisible = true;
	},

	hide : function () {
		this.$el.hide();
		this.isVisible = false;
	},

	activate : function () {

		this.$el.addClass( 'active' );
		this.isActive = true;

		this.$container.html( '<iframe src="'+this.cell.get('contentUrl')+'" frameborder="0" allowtransparency allowfullscreen ></iframe>' );
	},

	deactivate : function () {
		this.$el.removeClass( 'active' );
		this.isActive = false;

		this.$container.html('');
	}
});