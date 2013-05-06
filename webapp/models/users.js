var bcrypt = require('bcrypt');

module.exports = function (db, models, sync) {

	var model = db.define('users',{
		email : {
			type: 'text',
			required: true
		},
		name : {
			type: 'text',
			required: true
		},
		password : {
			type: 'text',
			required: true
		}
	},{
		cache: false,
		methods : {
			publicProfile : function () {
				// this.getSets(function(e,s){
				// 	console.log(s);
				// });
				return {
					id: this.id,
					name: this.name,
					email: '...@'+(this.email.split('@')[1])
				};
			},
			testPassword : function ( pswd ) {
				return bcrypt.compareSync( pswd, this.password );
			},
			getSets : function ( cb ) {
				models.sets.find({creator_id: this.id},cb);
			}
		}
	});

	model.createPassword = function ( pswd ) {
		var salt = bcrypt.genSaltSync( 10 )
			hash = bcrypt.hashSync( pswd, salt );
		return hash;
	};

	model.testPassword = function ( pswd, hash ) {
		return bcrypt.compareSync( pswd, hash );
	}

	// remember to drop table before
	if ( sync === true ) {
		model.sync(function(err){
			if (err) {
				throw(err);
			} else {
				console.log( 'Table "users" synced.' );
				model.create([{
					id: 1,
					name:'Motion Bank',
					email:'florian@motionbank.org',
					password:model.createPassword('as-time-sites-fly')
				}],function(err,u){
					if (err) {
						// ignore, user probably exists
					} else if (u.length === 1) {
						// OK!
					}
				});
			}
		});
	}

	return model;
}