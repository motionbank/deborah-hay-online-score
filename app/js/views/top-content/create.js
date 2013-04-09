var CreateView = module.exports = require('js/views/top-content/simple-html-content').extend({

	initialize : function () {
		this.initTemplate( 'create' );
		this.render();
	}

});