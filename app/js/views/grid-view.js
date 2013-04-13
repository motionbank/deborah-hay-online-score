
var cellData = {}, cellViews = [];
var categories = [];

var GridView = module.exports = Backbone.View.extend({

	el : '#grid-view',

	initialize : function () {

		cellData = require('data/cell-data');

		var CellView = require('js/views/cell-view');

		for ( var k in cellData ) {
			categories.push( k );
			var area = cellData[k];
			for ( var i = 0; i < area.length; i++ ) {
				var opts = area[i];
				opts['type'] = k;
				opts['title'] += ' '+opts['type']+' '+i;
				//cellViews[k] = cellViews[k] || [];
				//cellViews[k].push( new CellView( opts, this ) );
				cellViews.push( new CellView( opts, this ) );
			}
		}
	},

	setRatio : function ( ratio ) {
		// var cat = parseInt( ratio * 5 );
		// if ( cat >= categories.length ) cat = categories.length-1;

		// var frag = ratio-cat;
		// if ( cat == 0 || cat == 4 ) {
		// 	_.each( cellViews[categories[cat]], function(cv){ cv.show() });
		// }

		var iFrom = parseInt( ratio * cellViews.length ) - 12;
		iFrom = iFrom < 0 ? 0 : iFrom;
		var iTo = iFrom + 12;
		_.each( cellViews, function(cv, i){ cv.hide() });
		for ( var i = iFrom; i < iTo; i++ ) {
			cellViews[i].show();
		}
	}

});