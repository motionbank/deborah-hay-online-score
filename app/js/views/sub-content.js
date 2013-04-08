
var app = null;
var views = {}, currentView = 'text';

$sub = null;

var SubContentView = module.exports = Backbone.View.extend({

	el : '#sub-content',

	initialize : function ( initializer, parentApp, subView ) {

		app = parentApp;

		var loadViews = function (next) {
			views.text = new (require('js/views/sub-content/text'))( initializer, subView, this );
			initializer.add('later',function(next){
				views.text.show();
				next();
			});
			views.insights = new (require('js/views/sub-content/insights'))( initializer, subView, this );
			views.comments = new (require('js/views/sub-content/comments'))( initializer, subView, this );
			next();
		}
		initializer.add(loadViews,this);

		subView.on( 'change:content', (function(t){
			return function ( other ) {
				t.changeContentTo( other );
			}
		})(this) );

		$sub = jQuery('#sub');
	},

	render : function () {
	},

	changeContentTo : function ( key ) {

		if ( key in views && views[key] ) {
			views[currentView].hide((function(v,n){ return function () {
				v.show(n);
			}})(views[key],function(){
				currentView = key;
			}));
		}
	},

	show : function () {
		$sub.addClass('open');
		this.trigger('show');
	},

	hide : function () {
		$sub.removeClass('open');
		this.trigger('hide');
	}

});