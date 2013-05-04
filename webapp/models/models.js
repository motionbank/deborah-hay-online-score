module.exports = function (db, models, sync) {
	models.users 	= require('./models/users')(db, models, sync);
    models.cells 	= require('./models/cells')(db, models, sync);
    models.fields 	= require('./models/fields')(db, models, sync);
    models.sets 	= require('./models/sets')(db, models, sync);
    return models;
}