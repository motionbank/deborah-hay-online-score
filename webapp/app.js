
var express 	= require('express'),
	_			= require('underscore'),
	orm 		= require('orm'),
	app 		= express(),
	reqAcceptsJson = null,
	reqLoadUser = null,
	paramIdIsNumber = null,
	niy			= null;

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

app.use( orm.express( {
	database : "dhayapp",
	protocol : "mysql",
	host     : "localhost",
	port     : 3306,
	user 	 : "dhay",
	password : "dhay",
	query    : {
		pool     : false,
		debug    : true
	}
}, {
    define: function (db, models) {
        models.users = require('./models/users')(db, models, true);
        models.cells = require('./models/cells')(db, models, true);
        models.sets = require('./models/sets')(db, models, true);
    }
} ) );

app.use( express.bodyParser() );

app.use( express.static( __dirname + '/public' ) );

// app.get('/import-sets',reqLoadUser,function(req,rs){
// 	var path = __dirname + '/../app/data';
// 	var collection = require( path + '/collections/' + 'motionbank' );
// 	var cbs = [];
// 	_.map(collection,function(f,p){
// 		var data = require( path + '/sets/' + f.replace('.js','') );
// 		data.link = p;
// 		cbs.push((function(data,models,user){
// 			return function (next) {
// 				models.sets.create([{
// 					title: data.title,
// 					description: data.description || '',
// 					path: data.link,
// 					thumb_s: data.thumbs && data.thumbs.small || '',
// 					thumb_m: data.thumbs && data.thumbs.medium || '',
// 					thumb_l: data.thumbs && data.thumbs.large || '',
// 					grid_x: data.grid.x,
// 					grid_y: data.grid.y,
// 					creator_id: user.id
// 				}],function(err,sets){
// 					if (err) {
// 						console.log(err);
// 						next();
// 					} else if (sets.length === 1) {
// 						var set = sets[0];
// 						var cells = _.map(data.cells,function(cell){
// 							return {
// 								type: cell.type,
// 								title: cell.title,
// 								preview: cell.preview,
// 								content_url: cell.content_url
// 							};
// 						});
// 						models.cells.create(cells,function(err,cells){
// 							if (err) {
// 								console.log(err, cells);
// 								next();
// 							} else {
// 								set.addCells(cells);
// 								set.save(function(err,set){
// 									if (err) {
// 										console.log(err);
// 									}
// 									next();
// 								});
// 							}
// 						});
// 					}
// 				});
// 			}
// 		})(data,req.models,req.user));
// 	});
// 	var cb = cbs.shift();
// 	var nextCb = function () {
// 		if ( cbs.length > 0 ) {
// 			cb = cbs.shift();
// 			cb(nextCb);
// 		}
// 	}
// 	cb(nextCb);
// 	rs.send('OK');
// });

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

app.get( '/users/:id/cells', reqAcceptsJson, paramIdIsNumber, function ( req, res ) {
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

app.post( '/sets', reqAcceptsJson, reqLoadUser, function ( req, res ) {
	var params = req.models.sets.sanitizeInput(req.body);
	params.creator_id = req.user.id;
	req.models.sets.create([params],function(err,sets){
		//console.log( sets );
		if (err) {
			res.json(500,{message:err.message});
		} else if (sets.length <= 0) {
			res.json(500,{message:'No sets created'});
		} else {
			res.redirect(200,'/sets/'+sets[0].id); // TODO: check
		}
	});
});

// curl -X POST -d 'title=title=A title here&type=recording' -L http://localhost:5555/sets/1/cells

app.post( '/sets/:id/cells', reqAcceptsJson, reqLoadUser, paramIdIsNumber, function ( req, res ) {
	req.models.sets.get(req.params['id'], function (err,set) {
		if (err) {
			res.json(500,{message:'set does not exist'});
		} else {
			var params = req.models.cells.sanitizeInput(req.body);
			params.creator_id = req.user.id;
			req.models.cells.create([params],function(err,cells){
				//console.log( cells );
				if (err) {
					res.json(500,{message:err.message});
				} else if (cells.length <= 0) {
					res.json(500,{message:'No cells created for set'});
				} else {
					set.addCells(cells);
					set.save(function(err,set){
						if (err) {
							res.json(500,{message:err.message});
						} else {
							res.redirect(200,'/sets/'+set.id); // TODO: check
						}
					});
				}
			});
		}
	});
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
							set.cells = cells;
							res.json(set);
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
	var params = req.models.cells.sanitizeInput(req.body);
	req.models.cells.create([params],function(err,cells){
		//console.log( cells );
		if (err) {
			res.json(500,{message:err.message});
		} else if (cells.length <= 0) {
			res.json(500,{message:'No cells created'});
		} else {
			res.redirect(200,'/cells/'+cells[0].id); // TODO: check
		}
	});
});

// curl http://localhost:5555/cells
app.get( '/cells', reqAcceptsJson, function ( req, res ) {
	req.models.cells.find(function(err,cells){
		if ( err ) {
			throw( err );
		} else {
			res.json(cells);
		}
	});
});

// curl http://localhost:5555/cells/1
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

app.listen( 5555 );
