module.exports = {
	db: {
		database : "your database name",
		protocol : "mysql",
		host     : "localhost",
		port     : 3306,
		user 	 : "your database username",
		password : "your database password",
		query    : {
			pool     : false,
			debug    : true
		}
	},
	orm: {
		sync : true
	}
};