module.exports = function (db, models, sync) {
	
	models.users 	= require('./users')(db, models);
    models.fields 	= require('./fields')(db, models);
    models.cells 	= require('./cells')(db, models);
    models.sets 	= require('./sets')(db, models);
    
    var modelsArr = [
    	models.users,
    	models.fields, 
    	models.cells,
    	models.sets
    ];

    for ( var k in modelsArr ) {
    	modelsArr[k].makeAssociations(models);
    }

    if (sync) {
	    for ( var k in modelsArr ) {
	    	modelsArr[k].doSync();
	    }
    }

    return models;
}