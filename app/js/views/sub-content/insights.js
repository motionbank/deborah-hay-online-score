
var InsightsView = module.exports = require('js/views/sub-content/paged-content').extend({

	elementId : '#insights-content',

	initialize : function ( initializer, parentSubView, parentView ) {

		this.sub = parentSubView;
		this.subContent = parentView;

		initializer.add(function(next){
			this.loadData(next,'data/insights.json');
		},this);

		this.sub.on( 'change:scene', (function(t){return function(){
			t.changeScene.apply(t,arguments);
		};})(this) );

		this.subContent.on( 'show', (function(t){return function(){
			t.showScene.apply(t,arguments);
		};})(this) );
	}
});