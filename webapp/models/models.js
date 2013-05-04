module.exports = function (db, models, sync) {
	models.users 	= require('./users')(db, models, sync);
    models.fields 	= require('./fields')(db, models, sync);
    models.cells 	= require('./cells')(db, models, sync);
    models.sets 	= require('./sets')(db, models, sync);
    return models;
}