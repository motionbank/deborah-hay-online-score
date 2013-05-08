
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
	noop = function(){},
	ensureParamIdNumeric = noop,
	message = noop;


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
		req.session.messages.push( message );
	}
}

/*
 +	routes ...
 +
 L + + + + + + + + + + + + + + + + + + + + + + + + */

// INDEX

app.get( pathBase, function (req, res) {
	req.user.getSets(function(err,sets){
		if (err) throw(err);
		else {
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

// SETS - SAVE

app.post( pathBase + '/sets/new', function (req, res) {
	console.log( req.body );
	if ( req.user.id !== parseInt(req.body.user_id) ) {
		res.render( 'error', _.extend(viewOpts,{
			title: 'ERR0R!',
			message: 'Uuups. Something went wrong!'
		}));
		return;
	}
	req.models.sets.create([{
		title: req.body.title,
		description: req.body.description,
		path: req.body.path,
		creator_id: req.user.id
	}],function(err, sets){
		if (err) {
			console.log(err);
			res.render( 'error', _.extend(viewOpts,{
				title: 'ERR0R!', message: err.message
			}));
		} else if ( sets.length == 0 ) {
			console.log( req.body );
			res.render( 'error', _.extend(viewOpts,{
				title: 'ERR0R!', message: 'No clue what went wrong'
			}));
		} else {
			res.redirect('/admin/sets/'+sets[0].id+'/edit');
		}
	});
});

// SETS - EDIT

app.get( pathBase + '/sets/:id/edit', ensureParamIdNumeric, function(req, res){
	req.models.sets.get(req.params.id,function(err,set){
		if (err) {
			console.log(err);
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
			console.log(err);
			res.render( 'error', _.extend(viewOpts,{
				title: 'ERR0R!', message: 'Hm, can\'t get that set ...'
			}));
		} else {
			set.remove(function(err){
				if (err) {
					console.log(err);
					res.render( 'error', _.extend(viewOpts,{
						title: 'ERR0R!', message: 'Did not manage to remove that set'
					}));
				} else {
					message(req,{
						route: req.route,
						message: 'Set deleted!'
					});
					res.redirect('/admin/');
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
