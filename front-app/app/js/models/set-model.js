
var SetModel = module.exports = Backbone.Model.extend({

	defaults : {
		title : 'A set title',
		description : 'A longer text describing this set',
		path : 'path/to/this/set',
		poster : '',
		grid_cols : '',
		grid_rows : '',
		cell_width : '',
		cell_height : '',
		creator : { /* a user */ },
		cells : [ /* some cells */ ]
	},

	initialize : function () {

	}

});