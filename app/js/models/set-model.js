
var SetModel = module.exports = Backbone.Model.extend({

	defaults : {
		title : 'A set title',
		description : 'A longer text describing this set',
		path : 'path/to/this/set',
		thumb_s : '',
		thumb_m : '',
		thumb_x : '',
		grid_x : '',
		grid_y : '',
		creator : { /* a user */ },
		cells : [ /* some cells */ ]
	},

	initialize : function () {

	}

});