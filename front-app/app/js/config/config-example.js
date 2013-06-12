module.exports = {
	debug : false,
	islocal : false,
	host : 'scores.motionbank.org',
	apiHost : 'your.api.host.(back-app/app.js).here',
	adminHost : 'your.api.host.(back-app/editor.js).here',
	baseUrl : '/dh',
	cloudFront : {
		baseUrl : '/dh/app',
		fileHost : 'dXXXXXXXXXXXXXXX.cloudfront.net',
		streamer : 'sXXXXXXXXXXXXXXX.cloudfront.net'
	},
	pieceMaker : {
		apiKey : 'YourApiKeyXXXXXXXXXXXXXXXXXXXXXXX',
		host : 'your.piecemaker.instance.here',
		basePath : '/dh/piecemaker'
	},
	fauxmeo : {
		host : 'your.local.video.streamer.host.here',
		basePath : '/video/fauxmeo'
	}
};