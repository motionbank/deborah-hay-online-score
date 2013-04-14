
var CellModel = null;

var CellView = module.exports = Backbone.View.extend({

	tagName : 'article',
	attributes : {
		'class' : 'w4 h3 cell'
	},

	cell : null,
	isVisible : false,
	isActive : false,

	initialize : function ( opts, gridView ) {

		CellModel = CellModel || require('js/models/cell-model');

		this.cell = new CellModel( opts );
		gridView.$el.append( this.render() );

		gridView.on('change:grid', function () {

		});

		this.hide();
	},

	render : function () {

		this.$el.addClass( this.cell.get('type') );
		
		// var v = parseInt( 120 + Math.random() * 100 );
		// this.$el.css({
		// 	backgroundColor: 'rgb('+v+','+v+','+v+')'
		// });

		var $h1Title = jQuery( '<h1 class="title">'+this.cell.get('title')+'</h1>' );
		this.$el.html( $h1Title );

		var previewImg = this.cell.get('preview');
		if ( previewImg ) {
			this.$el.css({
				'background-image' : 'url(imgs/cells/'+previewImg+')'
			});
			//$h1Title.hide();
		} else {
			this.$el.css({
				'background-image' : 'none',
				'background-color' : 'white'
			});
			$h1Title.css({
				'color' : 'black',
				'display' : 'block'
			});
		}

		return this.$el;
	},

	show : function () {
		this.$el.show();
	},

	hide : function () {
		this.$el.hide();
	}
});