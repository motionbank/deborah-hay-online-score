
var config		= require('./config/config'),
	express 	= require('express'),
	_			= require('underscore'),
	ejs			= require('ejs'),
	orm 		= require('orm'),
	aws			= require('aws-sdk'),
	fs 			= require('fs'),
	http 		= require('http'),
	url 		= require('url'),
	im 			= require('imagemagick'),
	vimeo 		= require('vimeo')(config.vimeo.apiKey, config.vimeo.apiSecret),
	vimeoStore  = {},
	dbModels	= null,
	app 		= express(),
	pathBase 	= '/admin',
	viewOpts 	= {
		title: '<3',
		messages: []
	},
	noop 		= function(){},
	idNumeric 	= noop,
	message 	= noop,
	error 		= noop,
	noError		= noop,
	s3FileUpload = noop,
	fixSetPath  = noop,
	vimeoAuthed = noop;


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
				cb( null, users[0] ); // store this user in req.user
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

// set up Amazon S3 for uploads
app.use( function (req, res, next) {
	aws.config.update(config.aws);
	next();
});

/*
 +	custom MIDDLEWARE
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

idNumeric = function (req, res, next) {
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
	throw( error );
};

noError = function (req,res,err) {
	if (err) {
		error(req,res,err);
		return false;
	} else {
		return true;
	}
};

s3FileUpload = function ( req, res, file, basePath, next ) {
	var s3 			= new aws.S3(),
		s3Req 		= {Bucket: config.aws.bucket},
		s3Client 	= s3.client;

	var err = null;

	var fileName = file.name.
						toLowerCase().
							replace(/[^-.a-z0-9]+/ig,'-').
								replace(/^-+|-+$/,'');

	if ( fileName.length < 10 ) {
		err = new Error('That filename is too short, needs at least 10 chars');
		next(err,null);
		return;
	}

	var fileNameUnique = fileName;
	var filePath = basePath + fileNameUnique;
	var fileNameStub = fileName.replace(/\.[^.]+$/,'');
	var retries = 0;

	var step = function(next,done) {
		s3.client.headObject(_.extend(s3Req,{
			Key: filePath
		}),function(err,data){
			if ( !data ) {
				// that's ok, nothing there yet
				done();
			} else {
				retries++;
				fileNameUnique = fileName.replace( fileNameStub, fileNameStub + '-' + retries );
				filePath = basePath + fileNameUnique;
				if ( retries > 10 ) {
					error(req,res,new Error('That file existed and automatic renaming failed, '+
											'please try again with a different name'));
					return;
				}
				next(step,done);
			}
		});
	}

	var done = function () {
		var uploadIt = function () {
			s3.client.putObject(_.extend(s3Req,{
				Key: filePath,
				Body: file.buffer
			}),function (err,data) {
				if ( noError(req,res,err) ) {
					next(null,{
						name: fileNameUnique,
						path: filePath,
						s3Data: data
					});
				}
			});
		}
		if ( !('buffer' in file && file.buffer) ) {
			fs.readFile( file.path, function (fserr, buf) {
				if ( noError(req,res,err) ) {
					file.buffer = buf;
					uploadIt();
				}
			});
		} else {
			uploadIt();
		}
	}

	step(step,done);
};

toSetPath = function (path) {
	var nPath = '';
	
	if ( !path || path.replace(/[\s]+/ig,'').length == 0 ) {
		nPath = 'generated-path-'+(new Date());
	} else {
		nPath = path + '';
	}
	
	nPath = nPath.
				toLowerCase().
					replace(/[^a-z0-9]+/ig,'-').
						replace(/-+/ig,'-').
							replace(/^-+|-+$/,'');
	
	if ( nPath.length === 0 ) {
		return toSetPath();
	}

	return nPath;
};

vimeoAuthed = function (req, res, next) {
	var vSession = vimeoStore && vimeoStore[req.user.id];
	if ( vSession && 
		 vSession.access &&
		 vSession.expires - (new Date()).getTime() > 0 ) {
		next();
	} else {
		delete vimeoStore[req.user.id];
		res.redirect( pathBase + '/vimeo/oauth' );
	}
};

/*
 +	routes ...
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

// INDEX

app.get( '/', function (req,res){
	res.redirect( pathBase + '/');
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
		title: 'create new set',
		set: false
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
		path: toSetPath(req.body.title),
		poster: 'missing.jpg',
		creator_id: req.user.id
	}],function(err, sets){
		if (err) {
			error(req, res, err);
		} else if ( sets.length == 0 ) {
			error(req,res,'Set was not created .. hm?!');
		} else {
			var set = sets[0];
			var saveSet = function (set) {
				set.save(function(err){
					if ( noError(req,res,err) ) {
						res.redirect( pathBase + '/sets/'+set.id+'/layout');
					}
				});
			}
			if ( req.files && req.files.poster && req.files.poster.size > 0 ) {
				s3FileUpload( req, res, 
							  {name: req.files.poster.name,
							   path: req.files.poster.path}, 
							  config.aws.basePath+'/sets/poster/full/', 
							  function (err, s3file) {
					if ( noError(req,res,err) ) {

						_.each( req.models.sets.posterSizes, function(pSize){
							im.resize( _.extend( pSize.size,{
								srcPath: req.files.poster.path,
								dstPath: req.files.poster.path + '_' + pSize.name
							}), function (err, stdout, stderr) {
								if ( err ) console.log( err );
								else {
									s3FileUpload( req, res, {
													name: s3file.name, 
													path: req.files.poster.path + '_' + pSize.name
												  }, 
												  config.aws.basePath+'/sets/poster/'+ pSize.name +'/',
												  function (err, s3file) {
										if (err) console.log(err);
										else {
											// fine!
										}
									});
								}
							});
						});

						set.poster = s3file.name;
						saveSet(set);
					}
				});
			} else {
				saveSet(set);
			}
		}
	});
});

// SETS - READ

app.get( pathBase + '/sets/:id', idNumeric, function(req, res){
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

app.post( pathBase + '/sets/:id/save', idNumeric, function (req, res) {
	//console.log( req.body );
	if ( req.user.id !== parseInt(req.body.user_id) ) {
		error(req,res,'Uuups. Something went wrong!');
		return;
	}
	req.models.sets.get(req.params.id, function(err, set){
		if ( noError(req,res,err) ) {
			var saveSet = function (set,fileName) {
				set.save({
					title: req.body.title,
					path: toSetPath(req.body.path),
					description: req.body.description,
					cell_width: req.body.cell_width,
					cell_height: req.body.cell_height,
					poster: fileName || set.poster || 'missing.jpg'
				},function(){
					if (err) {
						error( req, res, err );
					} else {
						message(req,'Set was saved!');
						res.redirect( pathBase + '/sets/'+set.id+'/layout');
					}
				});
			}
			if ( req.files && req.files.poster && req.files.poster.size > 0 ) {
				s3FileUpload( req, res, {
							   name: req.files.poster.name,
							   path: req.files.poster.path }, 
							  config.aws.basePath+'/sets/poster/full/', 
							  function (err, s3file) {
					if ( noError(req,res,err) ) {

						_.each( req.models.sets.posterSizes, function(pSize){
							im.resize( _.extend( pSize.size,{
								srcPath: req.files.poster.path,
								dstPath: req.files.poster.path + '_' + pSize.name
							}), function (err, stdout, stderr) {
								if ( err ) console.log( err );
								else {
									s3FileUpload( req, res, {
													name: s3file.name, 
													path: req.files.poster.path + '_' + pSize.name
												  }, 
												  config.aws.basePath+'/sets/poster/'+ pSize.name +'/',
												  function (err, s3file) {
										if (err) console.log(err);
										else {
											// fine!
										}
									});
								}
							});
						});

						saveSet(set, s3file.name);
					}
				});
			} else {
				saveSet(set,false);
			}
		}
	});
});

// SETS - LAYOUT (ADD CELLS VIEW)

app.get( pathBase + '/sets/:id/layout', idNumeric, function(req, res){
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

app.post( pathBase + '/sets/:id/layout', idNumeric, function(req,res){
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
										  { x:c.x, y:c.y, width:c.width, height:c.height } );
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

app.get( pathBase + '/sets/:id/edit', idNumeric, function(req, res){
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

app.get( pathBase + '/sets/:id/delete', idNumeric, function(req, res){
	req.models.sets.get(req.params.id,function(err,set){
		if (err) {
			error( req, res, err );
		} else {
			// TODO remove poster images from S3!
			set.remove(function(err){
				if (err) {
					error( req, res, err );
				} else {
					message(req,'Set »'+set.title+'« (#'+set.id+') was deleted!');
					res.redirect( pathBase + '/');
				}
			});
		}
	});
});

// CELLS - NEW

app.get( pathBase + '/cells/new', function (req, res) {
	res.render('cells/new', _.extend(viewOpts,{
		title: 'create new cell',
		types: req.models.cells.cellTypes(),
		cell: {}
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
			description: req.body.description
		}],function(err, cells){
			if (err) {
				error(req,res,err);
			} else {

				var cell = cells[0];
				var cbs = [];

				if ( typeof req.body.field_keys === 'string' ) {
					req.body.field_keys = [req.body.field_keys];
					req.body.field_values = [req.body.field_values];
				}
				_.each(req.body.field_keys,function(key,i){
					var val = req.body.field_values[i];
					if ( val === '' && key === '' ) return;
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

				if ( req.files && req.files.poster && req.files.poster.size > 0 ) {
					cbs.push(function(next){
						s3FileUpload( req, res, {
									  	name: req.files.poster.name,
									  	path: req.files.poster.path },
									  config.aws.basePath+'/cells/poster/full/', 
									  function (err, s3file) {
							if ( noError(req,res,err) ) {

								_.each( req.models.cells.posterSizes, function(pSize){
									im.resize( _.extend( pSize.size,{
										srcPath: req.files.poster.path,
										dstPath: req.files.poster.path + '_' + pSize.name
									}), function (err, stdout, stderr) {
										if ( err ) console.log( err );
										else {
											s3FileUpload( req, res, {
															name: s3file.name, 
															path: req.files.poster.path + '_' + pSize.name
														  }, 
														  config.aws.basePath+'/cells/poster/'+ pSize.name +'/',
														  function (err, s3file) {
												if (err) console.log(err);
												else {
													// fine!
												}
											});
										}
									});
								});

								cell.poster = s3file.name;
								next();
							}
						});
					});
				}

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

// CELLS - LIST TYPE

app.get( pathBase + '/cells/type/:type', function (req,res){
	var type = req.params.type.replace(/[^a-z]+/ig,'');
	req.models.cells.find({type:type},['type','title'],function(err,cells){
		if (noError(req,res,err)) {
			res.render('cells/list',_.extend(viewOpts,{
				title: 'All cells of type »'+type+'«',
				cells: cells
			}));
		}
	});
});

// CELLS - VIEW

app.get( pathBase + '/cells/:id', idNumeric, function(req,res){
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

app.get( pathBase + '/cells/:id/edit', idNumeric, function(req,res){
	req.models.cells.get(req.params.id, function(err,cell){
		if ( noError(req,res,err) ) {
			cell.getFields(function(err,fields){
				if ( noError(req,res,err) ) {
					cell.fields = fields;
					var renderOpts = _.extend(viewOpts,{
						title: 'cell (#'+cell.id+')',
						cell: cell,
						types: req.models.cells.cellTypes()
					});
					if ( !req.xhr ) {
						res.render('cells/edit',renderOpts);
					} else if ( req.accepts('json') ) {
						var file = './views/cells/_edit.ejs';
						var tplStr = require('fs').readFileSync(file).toString();
						res.send({
							html: ejs.render(tplStr,_.extend(renderOpts,{
								filename: file
							})),
							cell: cell
						});
					} else {
						error(req,res,'Uh, not sure how to handle this one ..');
					}
				}
			});
		}
	});
});

// CELLS - UPDATE

app.post( pathBase + '/cells/:id/save', idNumeric, function(req, res){
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
						description: req.body.description
					}, function(err){
						if ( noError(req,res,err) ) {
							var cbs = [];

							if ( typeof req.body.field_keys === 'string' ) {
								req.body.field_keys = [req.body.field_keys];
								req.body.field_values = [req.body.field_values];
							}
							_.each( req.body.field_keys, function(key,i) {
								var val = req.body.field_values[i];
								if ( val === '' && key === '' ) return;
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

							if ( req.files && req.files.poster && req.files.poster.size > 0 ) {
								cbs.push(function(next){
									s3FileUpload( req, res, {
													name: req.files.poster.name,
													path: req.files.poster.path }, 
												  config.aws.basePath+'/cells/poster/full/', 
												  function (err, s3file) {
										if ( noError(req,res,err) ) {

											_.each( req.models.cells.posterSizes, function(pSize){
												im.resize( _.extend( pSize.size,{
													srcPath: req.files.poster.path,
													dstPath: req.files.poster.path + '_' + pSize.name
												}), function (err, stdout, stderr) {
													if ( err ) console.log( err );
													else {
														s3FileUpload( req, res, {
																		name: s3file.name, 
																		path: req.files.poster.path + '_' + pSize.name
																	  }, 
																	  config.aws.basePath+'/cells/poster/'+ pSize.name +'/',
																	  function (err, s3file) {
															if (err) console.log(err);
															else {
																// fine!
															}
														});
													}
												});
											});

											cell.poster = s3file.name;
											next();
										}
									});
								});
							}

							cbs.push(function(){
								cell.save(function(){
									if (err) {
										error(rer,res,err);
									} else {
										if ( !req.xhr ) {
											res.redirect( pathBase + '/cells/'+cell.id );
										} else if ( req.accepts('json') ) {
											res.send({
												cell: cell
											});
										} else {
											error(req,res,'Unable to save this cell');
										}
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

app.get( pathBase + '/cells/:id/delete', idNumeric, function(req,res){
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

					var s3 = new aws.S3();
					var sizes = req.models.cells.posterSizes;
					sizes.push({name:'full'});
					_.each( sizes, function(pSize){
						s3.client.deleteObject({
							Bucket: config.aws.bucket,
							Key: config.aws.basePath+'/cells/poster/'+ pSize.name +'/'+cell.poster
						},function(err,data){
							if (err) throw(err);
						});
					});

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

// VIMEO - LOGIN OAUTH

app.get( pathBase + '/vimeo/oauth', function (req, res) {
	// https://github.com/twentyrogersc/vimeo
	vimeo.getRequestToken( req.protocol+'://'+req.host+':'+config.port+pathBase+'/vimeo/oauth_callback', 
						   ['read'],
						   function (err, vreq) {
		vimeoStore[req.user.id] = {
			oauth_secret: vreq.secret,
			cache : {}
		};
		res.redirect( vreq.redirect );
	});
});

// VIMEO - OAUTH CALLBACK

app.get( pathBase + '/vimeo/oauth_callback', function (req, res) {
	var oauth_token = req.query.oauth_token,
		oauth_verifier = req.query.oauth_verifier;
	// https://github.com/twentyrogersc/vimeo
	var vSession = vimeoStore[req.user.id];
	vimeo.getAccessToken( oauth_token, 
						  vSession.oauth_secret, 
						  oauth_verifier, 
						  function(err, access) {
		if ( noError(req, res, err) ) {
			vSession.access = access;
			var tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			vSession.expires = tomorrow.getTime(); // 1 day
	  		// access containes access token and access token secret ready for vimeo calls
	  		vimeo.people('getInfo', {}, access, function(err, vres) {
	    		vSession.user = vres.person;
	    		message('You are now logged in to Vimeo!');
	    		res.redirect( pathBase + '/vimeo/albums' );
	  		});
		}
	});
});

// VIMEO - ALBUMS

app.get( pathBase + '/vimeo/albums', vimeoAuthed, function (req, res) {
	// https://developer.vimeo.com/apis/advanced/methods/vimeo.albums.getAll
	vimeo.albums( 'getAll', 
		 		  { user_id:'motionbank', sort:'newest', per_page:50 }, 
				  function( err, vres ) {
	/*{ generated_in: '0.0350', stat: 'ok', albums: { on_this_page: '11',
     page: '1', perpage: '50', total: '11', album: [ [Object], .. ] } }*/
     	if ( noError(req,res,err) ) {
     		var vCache = vimeoStore[req.user.id].cache;
     		vCache.albums = vCache.albums || {};
     		var albums = vres.albums.album;
     		for ( var i = 0; i < albums.length; i++ ) {
     			vCache.albums['id_'+albums[i].id] = albums[i];
     		}
			res.render('vimeo/albums',_.extend(viewOpts,{
				albumData: vres.albums
			}));
     	}
	});
});

// VIMEO - ALBUM VIEW

app.get( pathBase + '/vimeo/albums/:album_id', vimeoAuthed, function (req, res) {
	try {
		parseInt( req.params.album_id );
	} catch (e) {
		error(req,res,'Album id needs to be numeric');
		return;
	}
	var album_id = req.params.album_id;
    var vSession = vimeoStore[req.user.id];
	// https://developer.vimeo.com/apis/advanced/methods/vimeo.albums.getVideos
	vimeo.albums( 'getVideos', 
				  { album_id: album_id,
					page: req.query.page || 1, 
					per_page: 50, 
					full_response: true }, 
				  vSession.access,
				  function ( err, vres ) {
		if ( noError(req,res,err) ) {
			/*{ generated_in: '0.1490',
  stat: 'ok',
  videos: 
   { on_this_page: '3',
     page: '1',
     perpage: '50',
     total: '3',
     video: [ [Object], [Object], [Object] ] } }*/
     /*{ allow_adds: '0',
       embed_privacy: 'approved',
       id: '64470355',
       is_hd: '0',
       is_transcoding: '0',
       is_watchlater: '0',
       license: '0',
       privacy: 'disable',
       title: 'interview3-39.11-39.36.mp4',
       description: '',
       upload_date: '2013-04-20 20:36:47',
       modified_date: '2013-05-13 06:04:41',
       number_of_likes: '0',
       number_of_plays: '3',
       number_of_comments: '0',
       width: '640',
       height: '360',
       duration: '25',
       owner: { display_name: 'motionbank',
			     id: '7816344',
			     is_plus: '1',
			     is_pro: '0',
			     is_staff: '0',
			     profileurl: 'http://vimeo.com/motionbank',
			     realname: 'motionbank',
			     username: 'motionbank',
			     videosurl: 'http://vimeo.com/motionbank/videos',
			     portraits: { portrait: [Object] } },
       cast: { member: 
		      { display_name: 'motionbank',
		        id: '7816344',
		        role: '',
		        username: 'motionbank' } },
       urls: { url: [ [Object], [Object] ] },
       thumbnails: [ { height: '75',
				       width: '100',
				       _content: 'http://b.vimeocdn.com/ts/409/134/409134512_100.jpg' },
				     { height: '150',
				       width: '200',
				       _content: 'http://b.vimeocdn.com/ts/409/134/409134512_200.jpg' },
				     { height: '360',
				       width: '640',
				       _content: 'http://b.vimeocdn.com/ts/409/134/409134512_640.jpg' } ] }*/
       		var vCache = vimeoStore[req.user.id].cache;
       		var album = vCache.albums && vCache.albums['id_'+album_id] || {title:'',id:album_id};

			res.render('vimeo/album',_.extend(viewOpts,{
				videoData: vres.videos,
				album: album
			}));
		}
	});
});

// VIMEO - ALBUM IMPORT

app.get( pathBase + '/vimeo/albums/:album_id/import', vimeoAuthed, function(req, res){
	try {
		parseInt( req.params.album_id );
	} catch (e) {
		error(req,res,'Album id needs to be numeric');
		return;
	}
	var album_id = req.params.album_id;
    var vSession = vimeoStore[req.user.id];
	// https://developer.vimeo.com/apis/advanced/methods/vimeo.albums.getVideos
	vimeo.albums( 'getVideos', 
				  { album_id: album_id,
					page: req.query.page || 1, 
					per_page: 50, 
					full_response: true }, 
				  vSession.access,
				  function ( err, vres ) {
		if ( noError(req,res,err) ) {

			var attachVimeoPoster = function ( req, res, cell, video, next ) {

				var imgUrl = video.thumbnails.thumbnail;
				imgUrl = imgUrl[imgUrl.length-1]._content;
				var imgUrlOpts = url.parse(imgUrl);

				http.get(imgUrlOpts, function(hres){

					var bindex = 0;
					var iDataLength = parseInt(hres.headers['content-length']);
					var imageData = new Buffer(iDataLength);
					hres.setEncoding('binary');
					hres.on('data',function(chunk){
						imageData.write(chunk, bindex, "binary");
						bindex += chunk.length;
					});
					hres.on('error',function(){
						throw(arguments);
					});
					hres.on('close',function(){
						if ( !endWasCalled ) next();
					});
					var endWasCalled = false;
					hres.on('end', function(){
						
						endWasCalled = true;

						var imgName = imgUrlOpts.pathname.split('/').pop();
						//fs.writeFile( 'test.png', imgData, 'binary', function(err){});
						s3FileUpload( req, res, {
								name: 'vimeo-'+video.id+'_'+imgName, 
								buffer: imageData
							},
							config.aws.basePath+'/cells/poster/full/',
							function(err, s3file){
								if ( noError(req,res,err) ) {

									var cbs = [];

									_.each( req.models.cells.posterSizes, function(pSize){
										cbs.push(function(doNext){
											var opts = _.extend( _.clone(pSize.size),{ srcData: imageData } );
											console.log( opts );
											im.resize(opts, function ( err, stdoutBuffer, stderr ) {
												if ( err ) throw( err );
												else {
													s3FileUpload( req, res, {
																	name: s3file.name, 
																	buffer: new Buffer( stdoutBuffer, 'binary' )
																  }, 
																  config.aws.basePath+'/cells/poster/'+ pSize.name +'/',
																  function (err, s3file) {
														if (err) throw(err);
														else {
															doNext();
														}
													});
												}
											});
										});
									});
									
									cbs.push(function(){
										cell.poster = s3file.name;
										cell.save(function(err){
											if (noError(req,res,err)) {
												next();
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
							}
						);
					});
				});
			}

			var cbs = [];

			_.each(vres.videos.video,function(video){
				cbs.push(
					function(next){
						var field_opts = {name:'vimeo-id',value:video.id};
						req.models.fields.find(field_opts,function(err,fields){
							if ( noError(req,res,err) ) {
								if ( !fields || fields.length == 0 ) {
									req.models.fields.create([field_opts],function(err, fields){
										if ( noError(req,res,err) ) {
											// if this field was not here assume we need new cell
											req.models.cells.create([{
												type: 'context',
												title: video.title,
												description: video.description
											}],function(err,cells){
												if ( noError(req,res,err) ) {
													var cell = cells[0];
													cell.addFields(fields[0]);
													attachVimeoPoster(req, res, cell,video,next);
												}
											});
										}
									});
								} else { // field exists ... find cell and attach
									fields[0].getCell(function(err,cells){

										var cell = cells[0];
										cell.title = video.title;
										cell.description = video.description;
										cell.save(function(err){
											if (noError(req,res,err)) {
												var imgUrl = video.thumbnails.thumbnail;
												imgUrl = imgUrl[imgUrl.length-1]._content;
												var imgUrlOpts = url.parse(imgUrl);
												var imgName = imgUrlOpts.pathname.split('/').pop();

												if ( imgName === ('vimeo-'+video.id+'_'+imgName) ) { // img already poster
													next();
												} else {
													attachVimeoPoster( req, res, cell, video, next );
												}
											}
										});
									});
								}
							}
						});
					}
				);
			});

			cbs.push(function(){
				res.send('ok');
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
});

// LOGOUT

app.get( pathBase + '/logout', function (req, res) {
	req.session = null;
	res.send(401,'Logged out!');
});

app.listen( process.env.VCAP_APP_PORT || config.port );
