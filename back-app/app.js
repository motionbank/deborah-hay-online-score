
var express 	= require('express'),
	_			= require('underscore'),
	orm 		= require('orm'),
	app 		= express(),
	config		= require('./config/config'),
	reqAcceptsJson = null,
	reqLoadUser = null,
	paramIdIsNumber = null,
	niy			= null;

// appfog settings

if ( process.env.VCAP_SERVICES 
     && process.env.VCAP_SERVICES['mysql-5.1']
     && process.env.VCAP_SERVICES['mysql-5.1'][0]
     && process.env.VCAP_SERVICES['mysql-5.1'][0]['credentials'] ) {
  config.db = process.env.VCAP_SERVICES['mysql-5.1'][0]['credentials'];
  config.db.database = config.db.name;
}

/*
 +	Middlewares
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

reqAcceptsJson = function ( req, res, next ) {
	if ( req.accepts('json') === undefined ) {
		res.send( 'Sorry, JSON only here.' );
		return;
	}
	next();
}

niy = function ( req, res, next ) {
	res.json(500,{message: 'Not implemented yet.'});
}

paramIdIsNumber = function ( req, res, next ) {
	if ( !isNaN( parseInt(req.params['id']) ) ) {
		next();
	} else {
		res.json(500,{message:'Really funny, HAHA!'});
	}
}

reqLoadUser = function (req, res, next) {
	req.models.users.get(1,function(err,user1){
		if (err) {
			throw(err);
		} else {
			req.user = user1;
			next();
		}
	});
}

/*
 +	set up APP
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

// set up ORM2, 
// see https://github.com/dresende/node-orm2
app.use( orm.express( config.db, {
    define: function (db, models) {
        models = require('./models/models')(db, models, (config.orm && config.orm.sync));
    }
}));

// gzip compress
app.use( express.compress() );

// handle POST data
app.use( express.bodyParser() );

// static files
app.use( express.static( __dirname + '/public' ) );

// CORS, TODO: set to our domain only!
app.use( function(req, res, next) {
	var oneof = false;
	if (req.headers.origin) {
		res.header('Access-Control-Allow-Origin', req.headers.origin);
		oneof = true;
	}
	if (req.headers['access-control-request-method']) {
    	res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
		oneof = true;
	}
	if (req.headers['access-control-request-headers']) {
		res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
		oneof = true;
	}
	if (oneof) {
		res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
	}
    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
		res.send(200);
    } else {
		next();
	}
});

/*
 +	CRUD users
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

app.post( '/users', reqAcceptsJson, niy, function ( req, res ) {
});

app.get( '/users', reqAcceptsJson, function ( req, res ) {
	req.models.users.find(function(err,users){
		if ( err ) {
			throw(err);
		} else {
			users = _.map(users,function(u,i){
				return u.publicProfile();
			});
			res.json(users);
		}
	});
});

app.get( '/users/:id', reqAcceptsJson, paramIdIsNumber, function ( req, res ) {
	req.models.users.get(req.params['id'], function(err,user){
		if ( err ) {
			throw(err);
		} else {
			user = user.publicProfile();
			res.json(user);
		}
	});
});

app.get( '/users/:id/sets', reqAcceptsJson, paramIdIsNumber, function ( req, res ) {
	req.models.users.get(req.params['id'], function(err,user){
		if (err) {
			throw(err);
		} else {
			user.getSets(function(err, sets){
				if (err) {
					res.json(500,{message:err.message});
				} else {
					user = user.publicProfile();
					user.sets = sets;
					res.json(user);
				}
			});
		}
	});
});

app.put( '/users/:id', reqAcceptsJson, niy, paramIdIsNumber, function ( req, res ) {
});

app.delete( '/users/:id', reqAcceptsJson, niy, paramIdIsNumber, function ( req, res ) {
});

/*
 +	CRUD sets
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

// curl -X POST -d 'title=A title here&description=A longer description here' -L http://localhost:5555/sets

app.post( '/sets', reqAcceptsJson, niy, reqLoadUser, function ( req, res ) {
	// var params = req.models.sets.sanitizeInput(req.body);
	// params.creator_id = req.user.id;
	// req.models.sets.create([params],function(err,sets){
	// 	//console.log( sets );
	// 	if (err) {
	// 		res.json(500,{message:err.message});
	// 	} else if (sets.length <= 0) {
	// 		res.json(500,{message:'No sets created'});
	// 	} else {
	// 		res.redirect(200,'/sets/'+sets[0].id); // TODO: check
	// 	}
	// });
});

// curl -X POST -d 'title=title=A title here&type=recording' -L http://localhost:5555/sets/1/cells

app.post( '/sets/:id/cells', reqAcceptsJson, niy, reqLoadUser, paramIdIsNumber, function ( req, res ) {
	// req.models.sets.get(req.params['id'], function (err,set) {
	// 	if (err) {
	// 		res.json(500,{message:'set does not exist'});
	// 	} else {
	// 		var params = req.models.cells.sanitizeInput(req.body);
	// 		params.creator_id = req.user.id;
	// 		req.models.cells.create([params],function(err,cells){
	// 			//console.log( cells );
	// 			if (err) {
	// 				res.json(500,{message:err.message});
	// 			} else if (cells.length <= 0) {
	// 				res.json(500,{message:'No cells created for set'});
	// 			} else {
	// 				set.addCells(cells);
	// 				set.save(function(err,set){
	// 					if (err) {
	// 						res.json(500,{message:err.message});
	// 					} else {
	// 						res.redirect(200,'/sets/'+set.id); // TODO: check
	// 					}
	// 				});
	// 			}
	// 		});
	// 	}
	// });
});

app.get( '/sets', reqAcceptsJson, function ( req, res ) {
	req.models.sets.find(function(err,sets){
		if ( err ) {
			throw(err);
		} else {
			res.json(sets);
		}
	});
});

app.get( '/sets/:id', reqAcceptsJson, paramIdIsNumber, function ( req, res ) {
	req.models.sets.get(req.params['id'],function(err,set){
		if ( err ) {
			throw(err);
		} else {
			set.getCreator(function(err,creator){
				if ( err ) {
					throw(err);
				} else {
					set.creator = creator && creator.publicProfile();
					set.getCells(function(err,cells){
						if ( err ) {
							throw(err);
						} else {
							var cbs = [];
							_.each(cells,function(c){
								cbs.push(function(next){
									c.getFields(function(err,fields){
										if ( err ) {
											throw(err);
										} else {
											var setFields = [];
											_.each(fields,function(f){
												if ( f.extra.connection_id === 0 || 
													 f.extra.connection_id === c.extra.connection_id ) {
													console.log(f.id,c.id,c.extra.connection_id);
													setFields.push(f);
												}
											});
											c.fields = setFields;
											next();
										}
									});
								});
							});
							cbs.push(function(){
								set.cells = cells;
								res.json(set);
							});
							var cb = cbs.shift();
							var nextCb = function () {
								if (cbs.length > 0) {
									var cb = cbs.shift();
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

app.put( '/sets/:id', reqAcceptsJson, niy, paramIdIsNumber, function ( req, res ) {
});

app.delete( '/sets/:id', reqAcceptsJson, niy, paramIdIsNumber, function ( req, res ) {
});

/*
 +	CRUD cells
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

// curl -X POST -d 'title=A title here&type=recording' -L http://localhost:5555/cells

app.post( '/cells', reqAcceptsJson, reqLoadUser, function ( req, res ) {
	// var params = req.models.cells.sanitizeInput(req.body);
	// req.models.cells.create([params],function(err,cells){
	// 	//console.log( cells );
	// 	if (err) {
	// 		res.json(500,{message:err.message});
	// 	} else if (cells.length <= 0) {
	// 		res.json(500,{message:'No cells created'});
	// 	} else {
	// 		res.redirect(200,'/cells/'+cells[0].id); // TODO: check
	// 	}
	// });
});

// curl http://localhost:5555/cells
app.get( '/cells', reqAcceptsJson, function ( req, res ) {
	req.models.cells.find(['type','title'],function(err,cells){
		if ( err ) {
			throw( err );
		} else {
			res.json(cells);
		}
	});
});

// curl http://localhost:5555/cells/1
app.get( '/cells/:id', reqAcceptsJson, paramIdIsNumber, function ( req, res ) {
	req.models.cells.get(req.params['id'],function(err,cell){
		if (err) {
			res.json(500,{message:err.message});
		} else {
			var sets = cell.getSets(function(err,sets){
				cell.sets = sets;
				res.json(cell);
			});
		}
	});
});

app.put( '/cells/:id', reqAcceptsJson, niy, paramIdIsNumber, function ( req, res ) {
});

// curl -X DELETE http://localhost:5555/cells/1
app.delete( '/cells/:id', reqAcceptsJson, niy, paramIdIsNumber, function ( req, res ) {
});

/*
 +	other routes
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

app.get('/',function(req,rs){
	rs.send('This is just a Motion Bank online score website backend, '+
			'please visit: <a href="http://motionbank.org/">motionbank.org</a>');
});

app.listen( process.env.VCAP_APP_PORT || 5555 );
