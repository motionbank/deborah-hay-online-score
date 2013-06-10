module.exports = {
	debug : false,
	islocal : false,
	host : 'scores.motionbank.org',
	apiHost : 'deborah-hay-app.eu01.aws.af.cm',
	adminHost : 'deborah-hay-app-admin.eu01.aws.af.cm',
	baseUrl : '/dh',
	cloudFront : {
		baseUrl : '/dh/app',
		fileHost : 'motionbank-media.s3.amazonaws.com', // d35vpnmjdsiejq.cloudfront.net
		streamer : 's12vlv7g59gljg.cloudfront.net'
	},
	pieceMaker : {
		apiKey : 'a79c66c0bb4864c06bc44c0233ebd2d2b1100fbe',
		host : 'notimetofly.herokuapp.com',
		basePath : '/dh/piecemaker'
	},
	fauxmeo : {
		host : 'piecemaker.local',
		basePath : '/video/fauxmeo'
	}
};