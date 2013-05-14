var TextAnimator = (function(){
	var TA = function () {
		this.target = arguments[0];
		var interval = arguments[1] || 200;
		var frames = [
			'-','\\','|','/'
		];
		var frame = 0;
		var tid = -1;
		var self = this;
		var next = function () {
			self.target.html( '['+frames[frame]+']' );
			frame++;
			frame %= frames.length;
			if ( !self.stopped ) {
				tid = setTimeout(next,interval);
			} else {
				self.target.html('');
				self.target.hide();
			}
		}
		this.stopped = false;
		next();
	};
	TA.prototype = {
		start : function () {
			this.target.show();
		},
		stop : function () {
			this.stopped = true;
		}
	};
	return TA;
})();