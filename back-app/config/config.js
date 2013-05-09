module.exports = {
	db: {
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
	},
	orm: {
		sync : true
	}
};