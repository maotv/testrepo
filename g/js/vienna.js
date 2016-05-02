if (typeof Flyp == 'undefined') {
	Flyp = {};
}

if (typeof Rio == 'undefined') {
	
	Rio = {};
	Rio.UUID = "Ooops";
}


/**
 * Best Practices:
 * http://frugalcoder.us/post/2010/02/11/js-classes.aspx
 * http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
 * https://github.com/pusher/pusher-js/blob/master/src/pusher.js
 */
;(function() {

	$_ = jQuery;

	function flog() {
		if ( arguments.length == 1 ) {
			console.log(arguments[0]);
		} else {
			console.log(arguments);
		}
		
	}

	function random(digits) {

	    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

		var text = "";
	    for( var i=0; i < digits; i++ ) {
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }

	    return text;
		
	};


	function pad(value, len, padchar)
	{
		var sb = value ? value : '';
		var pc = padchar ? padchar : "0";
		var ln = len > 0 ? len : 0;

		for (var i = value.length; i < ln; i++)
		{
			sb = pc + sb;
		}

		return sb;
	}

	/**
	 * Options:
	 * url: root of rio-directory structure 
	 */	
	function Vienna(token, opts) {
		
		var vna = this;
		vna.token = token;
		flog("New Vienna: Client Token is " + token);

		if ( ! opts ) opts = { };

		vna.url = opts.url ? opts.url : "//aerobic-polygon-88015.appspot.com"

		// set revision to below zero
		vna.revision = -1;

		// no commit availabel yet, will be set from carrier
		vna.commit   = null;

		// base for all endpoints
		var urlbase = vna.url + "/" + API_VERSION + "/" + vna.token;

		// carrier url for first query
		vna.firstEndpoint = urlbase + "/first.json"

		// check for flypid in cookie
		vna.ackEndpoint = urlbase + "/ack.json"

		// carrier url for polling state
		vna.carrierEndpoint = urlbase + "/carrier.json"

		// carrier url for initial data
		vna.initialEndpoint = urlbase + "/initial.json"

		// carrier url for initial data
		vna.updateEndpoint = urlbase + "/u"

		// carrier url for initial data
		vna.streamsEndpoint = urlbase + "/s"

		// CORS stuff, see end of this file
		$.support.cors = true;

	} 
	
	// global
	this.Vienna = Vienna;

	// ========================================================
	// static
	// ========================================================

	var API_VERSION = "v1";


	// ========================================================
	// prototype
	// ========================================================
	
	// alias
	var proto = Vienna.prototype;

	// user id
	proto.uuid = "NYI";


	proto.getUUID = function() {
		return this.uuid;
	};

	/**
	 *	Public Connect function
	 */
	proto.connect = function(args) {
		
		var self = this;
		flog("connect");
		
		if ( this.connected ) return;

		if ( args ) {

			if ( typeof args.initial === 'function' ) {
				this.initialCallback = args.initial;
			}

			if ( typeof args.update === 'function' ) {
				this.updateCallback = args.update;
			}

			if ( typeof args.command === 'function' ) {
				this.commandCallback = args.command;
			}



		}




		this.requestWithoutCache (

			this.firstEndpoint, 
			random(8),

			function(fj) { 

				self.revision = fj.revision;
				self.commit   = fj.commit;

				if ( fj.ackuser ) {
					self._acknowledge(fj);
				} else {
					self._requestInitial(fj);
				}
			} 
		);
	}

	proto._acknowledge = function(fj) {

		var self = this;
		this.requestWithoutCache (
			this.ackEndpoint, 
			fj.user,
			function(ack) { 
				self._requestInitial(fj);
				flog(ack);
			} 
		);

	}

	proto._requestInitial = function() {

		flog("initial");
		var self = this;
		this.requestWithCommit (
			this.initialEndpoint, 
			function(data) { 
				if ( self.initialCallback ) self.initialCallback(data);
				self._startUpdates();
			} 
		);
	}

	proto._startUpdates = function() {
		var self = this;
		self.poll();
	}


	

	proto.poll = function() {

		var self = this;
		if ( ! self.interval ) self.interval = 12000;
		flog("poll...");

		if ( self.polling ) return;
		self.polling = true;
		
		var r = $_.ajax(self.carrierEndpoint + "?" + random(8) + ".r" + self.revision, {

			processData: true,
			dataType: 'json',
			type: 'GET',
			success: function(json) {
				flog("carrier rev = " + json.revision);
				if ( json.revision > self.revision ) {
					try {
						self._gotoRevision(json.revision, json.commit);
					} catch(e) {
						flog(e);
					} 
				}
			},
			complete: function(jqxhr, textStatus) {
				if ( self.interval < 7000 ) self.interval = 7000;
				flog("set poll timeout " + self.interval);
				setTimeout(function () {
					self.polling = false;
					self.poll();
				}, self.interval);
			}
		});


	}


	proto._gotoRevision = function(targetRevision) {

		var self = this;

		var nextRevision = self.revision + 1;
		if ( nextRevision > targetRevision ) return;

		var filename = pad((nextRevision & 0xff).toString(16), 4) + ".json";
		var endpoint = self.updateEndpoint + "/" + filename + "?" + self.commit;

		flog("get update " + endpoint);

		$_.ajax(endpoint, {
			success: function(json) {
				flog("got revision: " + nextRevision);
				if ( self.updateCallback ) self.updateCallback(json);
				self.revision = nextRevision;
				self._gotoRevision(targetRevision);
			}
		});

	}


	proto.requestInitial = function(stream) {
		flog("NYI: requestInitial for " + stream);
	};

	proto.requestMore = function(stream, type, cm, pos, nitems, cb) {

		flog("requestMore for " + stream +" from " + pos);
		this.requestEnvelopesDesc(stream, pos, nitems, cb);

	};

	proto.requestEnvelopesDesc = function(stream, firstIndex, nitems, callback) {

		// endpoint/<first>/<num>/desc.json
		var endpoint = this.streamsEndpoint + "/" + stream + "/e/" + firstIndex + "/" + nitems + "/desc.json";
		this.requestWithCommit(endpoint, callback);


	}



	proto.requestWithCommit = function(endpoint, callback, errorcb) {

		var self = this;
		var ep = endpoint + "?" + this.commit;

		var r = $_.ajax(ep, {

			processData: true,
			dataType: 'json',
			type: 'GET',

			success: function(json, textStatus, jqxhr) {
				if ( callback ) callback(json);
			},
			error: function(jqxhr, status, exception) {
				flog(exception);
				if ( errorcb ) errorcb(status, exception);
			}
		});
		
	}


	proto.requestWithoutCache = function(endpoint, arg, callback, errorcb) {

		var self = this;

		var ep = endpoint;
		if ( arg ) ep += "?" + arg;

		var r = $_.ajax(ep, {

			processData: true,
			dataType: 'json',
			type: 'GET',
			xhrFields: {
  				withCredentials: true
  			},

			success: function(json, textStatus, jqxhr) {
				if ( callback ) callback(json);
			},
			error: function(jqxhr, status, exception) {
				flog(exception);
				if ( errorcb ) errorcb(status, exception);
			}
		});
		
	}

}).call(Flyp);


/*!
 * jQuery-ajaxTransport-XDomainRequest - v1.0.2 - 2014-05-02
 * https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest
 * Copyright (c) 2014 Jason Moon (@JSONMOON)
 * Licensed MIT (/blob/master/LICENSE.txt)
 */
(function(a){if(typeof define==='function'&&define.amd){define(['jquery'],a)}else{a(jQuery)}}(function($){if($.support.cors||!$.ajaxTransport||!window.XDomainRequest){return}var n=/^https?:\/\//i;var o=/^get|post$/i;var p=new RegExp('^'+location.protocol,'i');$.ajaxTransport('* text html xml json',function(j,k,l){if(!j.crossDomain||!j.async||!o.test(j.type)||!n.test(j.url)||!p.test(j.url)){return}var m=null;return{send:function(f,g){var h='';var i=(k.dataType||'').toLowerCase();m=new XDomainRequest();if(/^\d+$/.test(k.timeout)){m.timeout=k.timeout}m.ontimeout=function(){g(500,'timeout')};m.onload=function(){var a='Content-Length: '+m.responseText.length+'\r\nContent-Type: '+m.contentType;var b={code:200,message:'success'};var c={text:m.responseText};try{if(i==='html'||/text\/html/i.test(m.contentType)){c.html=m.responseText}else if(i==='json'||(i!=='text'&&/\/json/i.test(m.contentType))){try{c.json=$.parseJSON(m.responseText)}catch(e){b.code=500;b.message='parseerror'}}else if(i==='xml'||(i!=='text'&&/\/xml/i.test(m.contentType))){var d=new ActiveXObject('Microsoft.XMLDOM');d.async=false;try{d.loadXML(m.responseText)}catch(e){d=undefined}if(!d||!d.documentElement||d.getElementsByTagName('parsererror').length){b.code=500;b.message='parseerror';throw'Invalid XML: '+m.responseText;}c.xml=d}}catch(parseMessage){throw parseMessage;}finally{g(b.code,b.message,c,a)}};m.onprogress=function(){};m.onerror=function(){g(500,'error',{text:m.responseText})};if(k.data){h=($.type(k.data)==='string')?k.data:$.param(k.data)}m.open(j.type,j.url);m.send(h)},abort:function(){if(m){m.abort()}}}})}));


