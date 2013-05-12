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
	},
	aws: {
		accessKeyId: 'AKIAIJA4RYGJMVLZ7XJA',
		secretAccessKey: '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',
		region: 'us-west-2'
	}
};