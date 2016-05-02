
if (typeof Flyp == 'undefined') {
	Flyp = {};
}


/**
 * Best Practices:
 * http://frugalcoder.us/post/2010/02/11/js-classes.aspx
 * http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
 * https://github.com/pusher/pusher-js/blob/master/src/pusher.js
 */
;(function() {
	
	/**
	 * Options:
	 * url: root of rio-directory structure 
	 */	
	function Vienna(opts) {
		
		var w = this;
		w.url = opts.url;
		w.viennaurl = "http://1-dot-radiant-math-859.appspot.com/viennatime/carrier.json";

		if ( opts.connect ) {
			w.test();
		}
		
	} 
	
	// global
	this.Vienna = Vienna;

	// ========================================================
	// static
	// ========================================================
	
	var FIRST_JSON = "first.json";
	var CARRIER_JSON = "carrier.json";
	

	// ========================================================
	// prototype
	// ========================================================
	
	// alias
	var proto = Vienna.prototype;

	proto.url = null;
	proto.substream = false;
	
	proto.random = function() {
		// return String(Math.random()).substring(2);
		
		var text = "";
	    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 12; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
		
		
	};
	
	proto.pollInitialData = function(callback) {
		
	};
	
	proto.pollStreamInitialData = function(stream, callback) {
		
		var self = this;
		var url = self.url + "/s/" + stream + "/initial.json";
		
		this.pollCarrierInternal(self.url + "/carrier.json" , function(carrier) {
			self.pollInitialInternal(url, carrier.commit, callback);
		})
		
	};
	
	proto.pollInitialInternal = function(url, commit, callback) {
	
		var self = this;
		
		var r = $.ajax( url + "?" + commit, {
			processData: true,
			dataType: 'json',
			type: 'GET',
			success: function(json, textStatus, jqxhr) {
				if ( callback ) callback(json.updates,null);
			},
			error: function(jqxhr, status, exception) {
				if ( errorcb ) errorcb(status, exception);
			}
		});

		
	};
	
	proto.pollCarrierInternal = function(url, callback, errorcb) {
		
		var self = this;
		
		var r = $.ajax( this.viennaurl + "?" + this.random(), {
			processData: true,
			dataType: 'json',
			type: 'POST',
			data: JSON.stringify({
				url: url,
				client: 0
			}),
			success: function(json, textStatus, jqxhr) {
				if ( callback ) callback(json);
			},
			error: function(jqxhr, status, exception) {
				if ( errorcb ) errorcb(status, exception);
			}
		});
		
	}
	
	
	
	
	
	
}).call(Flyp);