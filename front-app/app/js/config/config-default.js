module.exports = {
	host : 'scores.motionbank.org',
	apiHost : 'deborah-hay-app.eu01.aws.af.cm',
	adminHost : 'deborah-hay-app-admin.eu01.aws.af.cm',
	baseUrl : '/dh',
	runningLocal : true,
	cloudFront : {
		baseUrl : '/dh/app',
		fileHost : 'd35vpnmjdsiejq.cloudfront.net',
		streamer : 's12vlv7g59gljg.cloudfront.net'
	},
	pieceMaker : {
		apiKey : 'a79c66c0bb4864c06bc44c0233ebd2d2b1100fbe',
		host : 'notimetofly.herokuapp.com'
	}
};