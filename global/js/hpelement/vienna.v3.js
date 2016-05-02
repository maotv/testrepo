
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
	$_ = jQuery;
	/**
	 * Options:
	 * url: root of rio-directory structure 
	 */	
	function Vienna(opts) {
		
		var w = this;
		w.root = opts.root;
		w.keyurl = opts.key;
		w.viennaurl = "//radiant-math-859.appspot.com/viennatime/carrier.json";

		if ( opts.connect ) {
			w.test();
		}
		
		
		
		$_.support.cors = true;
		
	} 
	
	// global
	this.Vienna = Vienna;
	this.lastcommit = 0;

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

	proto.root = null;
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
		this.pollCarrierInternal(self.keyurl + "/s/" + stream + "/carrier.json" , function(carrier) {
			self.pollInitialInternal(self.root + "/s/" + stream + "/initial.json", carrier.commit, callback);
		})
		
	};
	
	proto.pollInitialInternal = function(url, commit, callback) {
		var self = this;
		if (commit == this.lastcommit) {
			if ( callback ) callback(null,null);
			return;
		}
		this.lastcommit = commit;
		var r = $_.ajax( url + "?" + commit, {
			processData: true,
			dataType: 'json',
			type: 'GET',
			success: function(json, textStatus, jqxhr) {
				if ( callback ) callback(json.updates,null);
			},
			error: function(jqxhr, status, exception) {
				Flyp.log(exception);
				//if ( errorcb ) errorcb(status, exception);
			}
		});

		
	};
	
	proto.pollCarrierInternal = function(url, callback, errorcb) {
		var self = this;
		
		var r = $_.ajax( this.viennaurl + "?" + this.random(), {
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
				Flyp.log(exception);
				if ( errorcb ) errorcb(status, exception);
			}
		});
		
	}
	
	
	
	
	
	
}).call(Flyp, jQuery);


/*!
 * jQuery-ajaxTransport-XDomainRequest - v1.0.2 - 2014-05-02
 * https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest
 * Copyright (c) 2014 Jason Moon (@JSONMOON)
 * Licensed MIT (/blob/master/LICENSE.txt)
 */
(function(a){if(typeof define==='function'&&define.amd){define(['jquery'],a)}else{a(jQuery)}}(function($){if($.support.cors||!$.ajaxTransport||!window.XDomainRequest){return}var n=/^https?:\/\//i;var o=/^get|post$/i;var p=new RegExp('^'+location.protocol,'i');$.ajaxTransport('* text html xml json',function(j,k,l){if(!j.crossDomain||!j.async||!o.test(j.type)||!n.test(j.url)||!p.test(j.url)){return}var m=null;return{send:function(f,g){var h='';var i=(k.dataType||'').toLowerCase();m=new XDomainRequest();if(/^\d+$/.test(k.timeout)){m.timeout=k.timeout}m.ontimeout=function(){g(500,'timeout')};m.onload=function(){var a='Content-Length: '+m.responseText.length+'\r\nContent-Type: '+m.contentType;var b={code:200,message:'success'};var c={text:m.responseText};try{if(i==='html'||/text\/html/i.test(m.contentType)){c.html=m.responseText}else if(i==='json'||(i!=='text'&&/\/json/i.test(m.contentType))){try{c.json=$.parseJSON(m.responseText)}catch(e){b.code=500;b.message='parseerror'}}else if(i==='xml'||(i!=='text'&&/\/xml/i.test(m.contentType))){var d=new ActiveXObject('Microsoft.XMLDOM');d.async=false;try{d.loadXML(m.responseText)}catch(e){d=undefined}if(!d||!d.documentElement||d.getElementsByTagName('parsererror').length){b.code=500;b.message='parseerror';throw'Invalid XML: '+m.responseText;}c.xml=d}}catch(parseMessage){throw parseMessage;}finally{g(b.code,b.message,c,a)}};m.onprogress=function(){};m.onerror=function(){g(500,'error',{text:m.responseText})};if(k.data){h=($.type(k.data)==='string')?k.data:$.param(k.data)}m.open(j.type,j.url);m.send(h)},abort:function(){if(m){m.abort()}}}})}));
