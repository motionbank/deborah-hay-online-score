
var express 	= require('express'),
	_			= require('underscore'),
	orm 		= require('orm'),
	dbModels	= null,
	config		= require('./config/config'),
	app 		= express(),
	pathBase 	= '/admin',
	viewOpts 	= {
		title: '<3',
		messages: []
	},
	noop 		= function(){},
	ensureParamIdNumeric = noop,
	message 	= noop,
	error 		= noop,
	noError		= noop;


// appfog settings

if ( process.env.VCAP_SERVICES 
     && process.env.VCAP_SERVICES['mysql-5.1']
     && process.env.VCAP_SERVICES['mysql-5.1'][0]
     && process.env.VCAP_SERVICES['mysql-5.1'][0]['credentials'] ) {
  config.db = process.env.VCAP_SERVICES['mysql-5.1'][0]['credentials'];
  config.db.database = config.db.name;
}

/*
 +	set up APP
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

// connect to database
app.use( orm.express( config.db, {
    define: function (db, models) {
        models = require('./models/models')(db, models, true);
        dbModels = models;
    }
}));

// basic authentication and loading user
app.use( express.basicAuth( function( user, pass, cb ) {
	dbModels.users.find({name:user},function(err,users){
		if (err) cb(err,null);
		else if (!users || users.length === 0) cb({message:'User not found'},null);
		else if (users && users[0]) {
			if (!users[0].testPassword(pass)) cb({message:'Wrong password'},null);
			else {
				viewOpts.user = users[0];
				cb( null, users[0] );
			}
		}
	});
}));

// handle POST data
app.use( express.bodyParser() );

// static files
app.use( express.static( __dirname + '/public' ) );

// set ejs as view engine
app.set( 'view engine', 'ejs' );

// sessions
app.use( express.cookieParser('0h My S3cr3t K3y S0 F1n3') );
app.use( function appUseCookieSessionWrapper (req, res, next) {
	var exprCookSessFn = express.cookieSession();
	exprCookSessFn.apply(null,arguments);
	viewOpts.messages = req.session.messages;
	req.session.messages = [];
});

/*
 +	custom MIDDLEWARE
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

ensureParamIdNumeric = function (req, res, next) {
	if ( !req.params.id ) {
		throw( 'Missing id from params!' );
	} else {
		var id = -1;
		try {
			id = parseInt( req.params.id );
		} catch (e) {
			throw( e );
		}
		if ( id <= 0 ) {
			// hm, check this too? TODO!
		}
		next();
	}
};

message = function (req, message) {
	if ( req.session ) {
		if ( !req.session.messages ) {
			req.session.messages = [];
		}
		req.session.messages.push({
			route: req.route, 
			message: message
		});
	}
};

error = function (req, res, error) {
	console.log( 'At '+req.route );
	console.log( error );
	res.render('error',_.extend(viewOpts,{
		title: 'E R R 0 R !', 
		message: error + ''
	}));
};

noError = function (req,res,err) {
	if (err) {
		error(req,res,err);
		return false;
	} else {
		return true;
	}
}

/*
 +	routes ...
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

// INDEX

app.get( '/', function (req,res){
	res.redirect('/admin/');
});

app.get( pathBase, function (req, res) {
	req.user.getSets(function(err,sets){
		if (err) {
			error( req, res, err );
		} else {
			req.user.sets = sets;
			res.render('index', _.extend(viewOpts,{
				title: 'index'
			}));
		}
	});
});

// SETS - NEW

app.get( pathBase + '/sets/new', function (req, res) {
	res.render('sets/new', _.extend(viewOpts,{
		title: 'create new set'
	}));
});

// SETS - CREATE

app.post( pathBase + '/sets/new', function (req, res) {
	//console.log( req.body );
	if ( req.user.id !== parseInt(req.body.user_id) ) {
		error( req, res, 'Uuups. Something went wrong!');
		return;
	}
	req.models.sets.create([{
		title: req.body.title,
		description: req.body.description,
		path: req.body.title.toLowerCase().replace(/[^a-z0-9]+/ig,'-').replace(/-+/ig,'-'),
		creator_id: req.user.id
	}],function(err, sets){
		if (err) {
			error(req, res, err);
		} else if ( sets.length == 0 ) {
			error(req,res,'Set was not created .. hm?!');
		} else {
			res.redirect('/admin/sets/'+sets[0].id+'/layout');
		}
	});
});

// SETS - READ

app.get( pathBase + '/sets/:id', ensureParamIdNumeric, function(req, res){
	req.models.sets.get(req.params.id,function(err,set){
		if (err) {
			error( req, res, err );
		} else {
			res.render('sets/view',_.extend(viewOpts,{
				title: '»'+set.title+'« (#'+set.id+')', 
				set: set
			}));
		}
	});
});

// SETS - UPDATE

app.post( pathBase + '/sets/:id/save', ensureParamIdNumeric, function (req, res) {
	//console.log( req.body );
	if ( req.user.id !== parseInt(req.body.user_id) ) {
		error(req,res,'Uuups. Something went wrong!');
		return;
	}
	req.models.sets.get(req.params.id, function(err, set){
		if (err) {
			error(req,res,err);
		} else {
			set.save({
				title: req.body.title,
				path: req.body.path,
				description: req.body.description
			},function(){
				if (err) {
					error( req, res, err );
				} else {
					message(req,'Set was saved!');
					res.redirect('/admin/sets/'+set.id+'/layout');
				}
			});
		}
	});
});

// SETS - LAYOUT (ADD CELLS VIEW)

app.get( pathBase + '/sets/:id/layout', ensureParamIdNumeric, function(req, res){
	req.models.sets.get(req.params.id,function(err,set){
		if (err) {
			error( req, res, err );
		} else {
			set.getCells(function(err,cells){
				if (err) error(req,res,err);
				else {
					var grid = [];
					_.each(cells,function(c){
						if ( c.extra ) {
							if (!grid[c.extra.y]) grid[c.extra.y] = [];
							grid[c.extra.y][c.extra.x] = c;
						}
					});
					set.cells = cells;
					req.models.cells.find(['type','title'],function(err, cells){
						var types = [];
						_.each(cells,function(c){
							if ( types.indexOf(c.type) === -1 ) types.push(c.type);
						});
						types.sort();
						res.render('sets/layout',_.extend(viewOpts,{
							title: 'Layout set »'+set.title+'« (#'+set.id+')', 
							set: set,
							grid: grid,
							cells: cells,
							types: types
						}));
					});
				}
			});
		}
	});
});

// SETS - SAVE CELLS FROM LAYOUT

app.post( pathBase + '/sets/:id/save-cells', ensureParamIdNumeric, function(req,res){
	req.models.sets.get(req.params.id,function(err,set){
		if (err) {
			error( req, res, err );
		} else {
			//console.log( req.body.cells );
			var cellIds = [];
			_.each(req.body.cells,function(c){
				cellIds.push(c.id);
			});
			req.models.cells.find({id:cellIds},function(err,cells){
				if (err) {
					error(req,res,err);
				} else {

					set.removeCells();

					var cellsById = {};
					_.each(cells,function(c){
						cellsById['id-'+c.id] = c;
					});
					
					var cbs = [];

					_.each(req.body.cells,function(c){
						cbs.push(function(next){
							set.addCells( cellsById['id-'+c.id],
										  {x:c.x,y:c.y} );
							next();
						});
					});

					cbs.push(function(next){
						if ( req.body.grid_cols * req.body.grid_rows >= cells.length ) {
							set.grid_cols = req.body.grid_cols;
							set.grid_rows = req.body.grid_rows;
						} else {
							error(req,res, 'Cell number does not match grid x,y' );
						}
						set.save(function(err){
							if (err) {
								error(req,res,err);
							} else {
								res.send('OK!');
							}
						});
					});

					var cb = cbs.shift();
					var nextCb = function () {
						if ( cbs.length > 0 ) {
							cb = cbs.shift();
							cb(nextCb);
						}
					}
					cb(nextCb);
				}
			});
		}
	});
});

// SETS - EDIT

app.get( pathBase + '/sets/:id/edit', ensureParamIdNumeric, function(req, res){
	req.models.sets.get(req.params.id,function(err,set){
		if (err) {
			error( req, res, err );
		} else {
			res.render('sets/edit',_.extend(viewOpts,{
				title: 'edit set »'+set.title+'« (#'+set.id+')', set: set
			}));
		}
	});
});

// SETS - DELETE

app.get( pathBase + '/sets/:id/delete', ensureParamIdNumeric, function(req, res){
	req.models.sets.get(req.params.id,function(err,set){
		if (err) {
			error( req, res, err );
		} else {
			set.remove(function(err){
				if (err) {
					error( req, res, err );
				} else {
					message(req,'Set »'+set.title+'« (#'+set.id+') was deleted!');
					res.redirect('/admin/');
				}
			});
		}
	});
});

// CELLS - NEW

app.get( pathBase + '/cells/new', function (req, res) {
	res.render('cells/new', _.extend(viewOpts,{
		title: 'create new cell',
		types: req.models.cells.cellTypes()
	}));
});

// CELLS - CREATE

app.post( pathBase + '/cells/new', function (req, res) {
	//console.log( req.body );
	if ( req.user.id !== parseInt(req.body.user_id) ) {
		error( req, res, 'Uuups. Something went wrong!');
	} else if ( req.models.cells.cellTypes().indexOf( req.body.type ) === -1 ) {
		error( req, res, 'That type is not allowed!' );
	} else {
		req.models.cells.create([{
				type: req.body.type,
				title: req.body.title,
				preview: req.body.preview
		}],function(err, cells){
			if (err) {
				error(req,res,err);
			} else {
				var cell = cells[0];
				
				var cbs = [];
				_.each(req.body.field_keys,function(key,i){
					var val = req.body.field_values[i];
					cbs.push(function(next) {
						req.models.fields.create([{
							name: key,
							value: val
						}], function (err, fields) {
							if (err) {
								error(req,res,err);
							} else {
								cell.addFields(fields[0]);
								next();
							}
						});
					});
				});
				cbs.push(function(){
					cell.save(function(){
						if (err) {
							error(rer,res,err);
						} else {
							res.redirect( pathBase + '/cells/'+cell.id );
						}
					});
				});
				var cb = cbs.shift();
				var nextCb = function () {
					if ( cbs.length > 0 ) {
						cb = cbs.shift();
						cb(nextCb);
					}
				}
				cb(nextCb);
			}
		});
	}
});

// CELLS - LIST

app.get( pathBase + '/cells', function (req,res){
	req.models.cells.find(['type','title'],function(err,cells){
		if (noError(req,res,err)) {
			res.render('cells/list',_.extend(viewOpts,{
				title: 'All cells',
				cells: cells
			}));
		}
	});
});

// CELLS - VIEW

app.get( pathBase + '/cells/:id', ensureParamIdNumeric, function(req,res){
	req.models.cells.get(req.params.id,function(err,cell){
		if ( noError(req,res,err) ) {
			cell.getFields(function(err,fields){
				if (noError(req,res,err)) {
					cell.fields = fields;
					res.render('cells/view',_.extend(viewOpts,{
						title: 'cell (#'+cell.id+')',
						cell: cell
					}));
				}
			});
		}
	});
});

// CELLS - EDIT

app.get( pathBase + '/cells/:id/edit', ensureParamIdNumeric, function(req,res){
	req.models.cells.get(req.params.id, function(err,cell){
		if ( noError(req,res,err) ) {
			cell.getFields(function(err,fields){
				if ( noError(req,res,err) ) {
					cell.fields = fields;
					res.render('cells/edit',_.extend(viewOpts,{
						title: 'cell (#'+cell.id+')',
						cell: cell,
						types: req.models.cells.cellTypes()
					}));
				}
			});
		}
	});
});

// CELLS - UPDATE

app.post( pathBase + '/cells/:id/save', ensureParamIdNumeric, function(req, res){
	req.models.cells.get(req.params.id,function(err,cell){
		if ( noError(req,res,err) ) {
			cell.getFields(function(err,fields){
				if ( noError(req, res, err) ) {
					cell.removeFields();
					if ( fields ) {
						_.each(fields,function(field){
							field.remove(/* just assume it's ok */);
						});
					}
					cell.save({
						title: req.body.title,
						type: req.body.type,
						preview: req.body.preview
					}, function(err){
						if ( noError(req,res,err) ) {
							var cbs = [];
							_.each(req.body.field_keys,function(key,i){
								var val = req.body.field_values[i];
								cbs.push(function(next) {
									req.models.fields.create([{
										name: key,
										value: val
									}], function (err, fields) {
										if (err) {
											error(req,res,err);
										} else {
											cell.addFields(fields[0]);
											next();
										}
									});
								});
							});
							cbs.push(function(){
								cell.save(function(){
									if (err) {
										error(rer,res,err);
									} else {
										res.redirect( pathBase + '/cells/'+cell.id );
									}
								});
							});
							var cb = cbs.shift();
							var nextCb = function () {
								if ( cbs.length > 0 ) {
									cb = cbs.shift();
									cb(nextCb);
								}
							}
							cb(nextCb);
						}
					});
				}
			});
		}
	});
});

// CELLS - DELETE

app.get( pathBase + '/cells/:id/delete', ensureParamIdNumeric, function(req,res){
	req.models.cells.get(req.params.id, function(err,cell){
		if ( noError(req,res,err) ) {
			cell.getFields(function(err,fields){
				if ( noError(req,res,err) ) {
					cell.fields = fields;
					cell.removeFields();
					if ( fields ) {
						_.each(fields,function(field){
							field.remove(/* just assume it's ok */);
						});
					}
					cell.remove(function(err){
						if (noError(req,res,err)) {
							message(req,'Cell deleted');
							res.redirect(pathBase+'/cells');
						}
					});
				}
			});
		}
	});
});

// LOGOUT

app.get( pathBase + '/logout', function (req, res) {
	req.session = null;
	res.send(401,'Logged out!');
});

app.listen( process.env.VCAP_APP_PORT || 5556 );
