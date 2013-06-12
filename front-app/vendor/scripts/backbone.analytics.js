(function() {
  var _loadUrl = Backbone.History.prototype.loadUrl;

  Backbone.History.prototype.loadUrl = function(fragmentOverride) {
    var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });

    if (!/^\//.test(fragment)) {
      fragment = '/' + fragment;
    }

    fragment = window.location.pathname.replace(/\/$/,'') + fragment;

    if (window._gaq !== undefined) {
      window._gaq.push(['_trackPageview', fragment]);
    } else if ( 'ga' in window && window.ga !== undefined && typeof window.ga === 'function' ) {
      window.ga( 'send', 'pageview', {
        'page' : fragment,
        'hitCallback' : function() {
          //console.log( "Tracked: ", fragment );
        }
      });
    }

    return matched;
  };

}).call(this);
