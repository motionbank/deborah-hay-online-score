
var cellData = {}, cellViews = {}, cellViewsArr = [];
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
				opts['preview'] = opts['preview'] === 'missing.jpg' ? opts['type']+'-'+i+'.jpg' : opts['preview'];
				
				cellViews[k] = cellViews[k] || [];
				cellViews[k].push( new CellView( opts, this ) );
				
				cellViewsArr.push( new CellView( opts, this ) );
			}
		}
	},

	setRatio : function ( ratio ) {

		var ratioScaled = ratio * 5;
		var ratioInt = parseInt( ratioScaled );
		if ( ratioInt >= categories.length ) ratioInt = categories.length-1;
		var ratioFrag = ratioScaled-ratioInt;
		var cat = categories[ratioInt];

		var iFrom = Math.max( 0, parseInt( ratioFrag * (cellViews[cat].length-12) ) );
		var iTo = Math.min( iFrom + 12, cellViews[cat].length-1 );
		_.each( cellViews, function(cvCat){ _.each( cvCat, function(cv){ cv.hide() } ) });
		for ( var i = iFrom; i < iTo; i++ ) {
			cellViews[cat][i].show();
		}

		// var iFrom = parseInt( ratio * (cellViewsArr.length-12) );
		// var iTo = iFrom + 12;
		// _.each( cellViewsArr, function(cv, i){ cv.hide() });
		// for ( var i = iFrom; i < iTo; i++ ) {
		// 	cellViewsArr[i].show();
		// }
	}

});