
/*
 +	Template for set data sets.
 +
 L + + + + + + + + + + + + + + + + + + + + + */

module.exports = {
	title : 'Context: The Score',
	description : '',
	author : '',
	link : '',
	thumbs : { medium : 'thumb_x100_april-recordings.jpg' },
	grid : {
		x: 2, y : 2
	},
	slider : 0.0,
	fullContentUrl : '',
	fullContentOptions : {
		/* anything that it needs to load / play */
	},
	cells : [
		{ type: 'title', title: 'The Score' },
		{ type: 'context', title: 'Interview', preview: 'missing.jpg', contentUrl: 'http://player.vimeo.com/video/64450594' },
		{ type: 'context', title: 'Interview', preview: 'missing.jpg', contentUrl: 'http://player.vimeo.com/video/64450534' },
	]
}
