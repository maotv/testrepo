var Rio = function(args)
{
	var a = this.args = args;

	if (!a.postUpdate) a.postUpdate = function (){};
	if (!a.startRuntimePhase) a.startRuntimePhase = function() {};

	this.uuid = "";
	this.useWs = a.useWs;
	this.url = a.url;
	this.wsUrl = a.wsUrl;
	this.event = a.event;
	this.client = a.client;
	this.wsblock = $('#wsblock');
	this.usePusher = a.usePusher;
	this.pusherKey = a.pusherKey;
	this.pusher = null;
	this.clientid = a.client;
}

Rio.global = this;
Rio.global['logging'] = true;

if (!this['console'] || !this['console']['log'] || !logging) {
	this['console'] = {
		log: function(){},
		error: function(){}
	};
}


Rio.DUMMY_CALLBACK = function () {};
Rio.BUCKET_SIZE = 64;
Rio.MAX_WS_RECONN = 3;
Rio.PONGLOOP = true;
Rio.MAX_PING_PONG_DIFF = 5;
Rio.PING_LOOP_INTERVAL = 60*1000;

Rio.prototype.SOCKET_CONNECTION_TIMEOUT = 10000;

Rio.prototype.pollInterval = 7000; // time between regular update calls
Rio.prototype.rapidUpdateInterval = 2; // time between immediate updates
Rio.prototype.time = 0;
Rio.prototype.timeoffset = 0;
Rio.prototype.lifetimePower = 4;
Rio.prototype.initialRequest = true;
Rio.prototype.firstResponse = true;
Rio.prototype.running = true;
Rio.prototype.revision = -1;
Rio.prototype.requestRevision = 0;
Rio.prototype.intervalCallerActive = false;
Rio.PATH_FIRST = "rio/first.json";
Rio.PATH_POLL = "rio/carrier.json";
Rio.PATH_INITIAL = "rio/initial.json";
Rio.PATH_UPDATE = "rio/u";
Rio.PATH_STREAM	  = "rio/s";
Rio.PATH_COMMENTS = "rio/c";
Rio.PATH_POLLCOMMIT = "poll";
Rio.PATH_CHATCOMMIT = "chat";
Rio.prototype.REVISION_MASK = 255;
Rio.prototype.FILE_NAME_LENGTH = 4;
Rio.prototype.currentRequest = null;
Rio.prototype.transmissionRequest = "notyet";
Rio.prototype.wsblock = null; // = null ? $('#wsblock') : null;

Rio.prototype.getParameterByName = function(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


Rio.prototype.start = function()
{
	this.first();
};

Rio.prototype.first = function()
{
	var self = this;
	var r = $.ajax(this.url + "/" + Rio.PATH_FIRST + "?" + String(Math.random()).substring(2), {
		processData: true,
		dataType: 'json',
		type: 'POST',
		data: { 
		    client: self.clientid,
			user: self.getParameterByName("user"),
			rand: String(Math.random()).substring(2)
		},
		success: function(json, textStatus, jqxhr)
		{
			var t = self.time = json.time*1000;
			self.timeoffset = (new Date().getTime()) - t;
			self.revision = json.revision;
			self.user = json.user;
			Rio.UUID = json.user;
			self.eventid = json.eventid;
			
			
			
			
			self.evalCarrierJSON(json);
			//window.onunload = self.byebye;
			//$(window).on('beforeunload', self.byebye);
			if ( document.cookie.indexOf("FLYP-USER") < 0 ) {
	        	self.replaceSession();
	        } else {
				self.initial();
	        }
		},
		error: function(qXHR, status, exception) {
			var i = 1;
//			console.log(status);
		} 
	});
}

Rio.prototype.replaceSession = function()
{

	var self = this;
	var r = $.ajax(this.url + "/" + Rio.PATH_FIRST + "?" + String(Math.random()).substring(2), {

        dataType: "json",
        type: "POST",
        data: { uuid: Rio.UUID, client: self.clientid, fp: "goforit" },
        success: function(data) {
	        self.user = data.user;
		Rio.UUID = data.user;
	        self.initial();
		},
		error: function(a,msg,c) {
	        // console.log("long error: " + msg);
        },
        complete: function() {
	        // console.log("long complete");
        },
        cache: false
    });

}


Rio.prototype.byebye = function(){
	//console.log('bye');
	$.ajax({
		type: 'POST',
		data: { uuid: Rio.UUID, client: self.clientid },
		url: this.url + "/" + Rio.PATH_FIRST + "?bye&" + String(Math.random()).substring(2)
	});

}


Rio.prototype.sendPollCommit = function(data, cback, obj){
    var sendData = data;
    sendData.uuid = Rio.UUID;
    $.ajax({
        type: 'POST',
        url: this.url + '/' + Rio.PATH_POLLCOMMIT,
        data: sendData,
        success: function(){
            if(undefined != cback && cback instanceof Function){
                cback(data.did, data.oid);
            }
        },
        error: function(a, b, c){
           /*
           console.log('push poll error'); 
           console.log(a);
           console.log(b);
           console.log(c);
        	*/
        }
    })
    
}

Rio.prototype.sendChatCommit = function(data, cback, obj){
    var sendData = data;
    sendData.uuid = Rio.UUID;
    $.ajax({
        type: 'POST',
        url: this.url + '/' + Rio.PATH_CHATCOMMIT,
        data: sendData,
        success: function(a, b, c){
            if(undefined != cback && cback instanceof Function){

                cback(a, b, c, obj);
            }
        }
    })

}

Rio.prototype.getUUID = function(){

	return Rio.UUID;

}

Rio.prototype.evalCarrierJSON = function(json)
{
	this.commitcode = (json.commit)? json.commit: this.commitcode;
	this.pollInterval = (json.pollInterval)? json.pollInterval: this.pollInterval;
	this.lifetimePower = (json.lifetimePower)? json.lifetimePower: this.lifetimePower;
	
	if ( json.nopusher ) {
		this.usePusher = false;
	}
}

Rio.prototype.initial = function()
{
	var self = this;

	var r = $.ajax(this.url + "/" + Rio.PATH_INITIAL + "?" + this.commitcode, {
		processData: true,
		dataType: 'json',
		type: 'GET',
		success: function(json, textStatus, jqxhr)
		{
			if ( ! json.items ) json.items = json.updates;
			self.updateRevision = self.revision = json.revision;
			self.evalCarrierJSON(json);
			self.waitForUpdate();
			self.args.postUpdate(json);
		}
	});
}


Rio.prototype.sendSocketId = function() {

	var self = this;
	// return;
	
	var r = $.ajax(this.url + "/" + Rio.PATH_FIRST + "?pdc&" + String(Math.random()).substring(2), {

		dataType: "json",
		type: "POST",
		data: { uuid: Rio.UUID, client: self.clientid, socket: self.socketid },
		success: function(data) {
			// console.log("success");
		},
		error: function(a,msg,c) {
			// console.log("long error: " + msg);
		},
		complete: function() {
			// console.log("long complete");
		},
		cache: false
	});




}

// Funktionsname so nicht sinnvoll - Malte 20140916
Rio.prototype.waitForUpdate = function()
{
	var self = this;

	this.args.startRuntimePhase();

	var nua = navigator.userAgent;
	var isaw = this.is_android_webview = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));

	if ( typeof Pusher != "undefined" && this.usePusher ) 
	{
		this.pusher = new Pusher(self.pusherKey);
		
		this.pusher.connection.bind('connected', function() {
  			self.socketid = self.pusher.connection.socket_id;
  			self.sendSocketId();
		});
		
		this.pusher.connection.bind('state_change', function(states) {
  			// states = {previous: 'oldState', current: 'newState'}
  			// console.log("State Change  " + states.previous + " == " + states.current);
  			// $('div#status').text("Pusher's current state is " + states.current);
  			self.wsblock.attr("title", states.current);
		});
		
		this.pusher.connection.bind( 'error', function( err ) { 

    		if( err.error.data.code === 4004 ) {
				//console.log('>>> detected limit error');
				self.poll();
				return;
  			}
  			if( err.error.data.code === 4005 ) {
				// console.log('>>> detected conection error');
				self.poll();
				return;
  			}

		});
		
    	var channel = this.pusher.subscribe('event' + self.eventid);
    	// console.log("bind to " + 'event' + self.eventid);
    	
    	channel.bind('update', function(data) {
    		// console.log("New Message: ", data);
      		// alert(data.message);
      		self.revision = data.revision;
			self.updateRevision = self.revision;
			self.args.postUpdate(data);
    	});


    	return;
	} 
	else if (this.wsUrl && this.useWs && !isaw && Rio.global['WebSocket'])
	{
		var w;

		var conn_count = 0;
		var connect = function()
		{
			var ws_alive = true;
			conn_count += 1;

			// console.log(['Rio.websocket.connecting to ' + self.wsUrl]);

			w = new WebSocket(self.wsUrl);

			w.ping_count = 0;
			w.pong_count = 0;

			w.pingloop = function() {
				w.pingcaller = setInterval(function ()
				{
					if (!ws_alive)
					{
						clearInterval(w.pingcaller);
						return;
					}

					if (w.ping_count - w.pong_count > Rio.MAX_PING_PONG_DIFF)
					{
						// console.log(['ping diff', w.ping_count - w.pong_count]);

						clearInterval(w.pingcaller);
						conn_count = 0;
						w.close();
						return;
					}
					w.ping();
				},
				Rio.PING_LOOP_INTERVAL);
			};

			w.ping = function()
			{
				w.ping_count += 1;
				w.send('ping');
			};

			w.onopen = function () {
				// console.log("Rio.websocket.onopen");
				self.websocketConnected = true;
				w.send(JSON.stringify({method: "hello", user: self.user, revision: self.revision, eventid: self.eventid }));

				if (Rio.PONGLOOP) w.pingloop();

				if(self.wsblock)
				{
					self.wsblock.removeClass();
					self.wsblock.addClass('ws_darkgreen');
				}
			}; 

			w.onclose = function (evt)
			{
				if (self.wsblock)
				{
					self.wsblock.removeClass();
					self.wsblock.addClass('ws_gray');
				}
				
				// console.log("Rio.websocket.onclose");
				self.websocketConnected = false;

				if (!ws_alive) return;

				setTimeout(function () {
					if (conn_count < Rio.MAX_WS_RECONN)
					{
						connect();
					}
					else
					{
						ws_alive = false; // pingloop wird gestoppt
						self.poll();
					}
				}, 10000);
			}; 

			w.onmessage = function (evt) {
				try {
					//console.log('ws message: ' + evt.data);
					if (evt.data == 'pong')
					{
						w.pong_count += 1;
						return;
					}
					else if (evt.data == 'bye')
					{
						ws_alive = false;
						w.close();
						self.poll();
						return;
					}
					var json = JSON.parse(evt.data);
					self.revision = json.revision;
					self.updateRevision = self.revision;
					self.args.postUpdate(json);
				} catch (e) {
					console.error('Rio.websocket.onmessage: error:');
					console.error(e);
				};
			}; 

			w.onerror = function (evt) {
				console.error(['Rio.websocket.onerror:', evt]);
				if(self.wsblock)
				{
					self.wsblock.removeClass();
					self.wsblock.addClass('ws_red');
				}
				
			};

			setTimeout(function () {
				if (self.websocketConnected) return;
				self.useWs = false;
				// self.wsUrl = '';
				self.poll();
			}, self.SOCKET_CONNECTION_TIMEOUT);
		};

		connect();
		return;
	}

	this.poll();
};

Rio.prototype.poll = function()
{
	if (this.pollInCall) return;

	var self = this;

	var r = $.ajax(this.url + "/" + Rio.PATH_POLL + "?" + Rio.pcode((new Date().getTime()) - this.timeoffset, this.lifetimePower), {
		processData: true,
		dataType: 'json',
		type: 'GET',
		complete: function(jqxhr, textStatus)
		{
			setTimeout(function () {
				self.pollInCall = false;
				self.poll();
			}, self.pollInterval);

			if (textStatus != 'success') return;

			if(self.wsblock)
			{
				if(self.wsblock.hasClass("ws_lightblue"))
				{
				self.wsblock.removeClass();
					self.wsblock.addClass('ws_transparent');
				} else {
				self.wsblock.removeClass();
					self.wsblock.addClass('ws_lightblue');				
				}
			}
			
			var json = eval('(' + jqxhr.responseText + ')');
			if ( ! json.items ) json.items = json.updates;
			self.revision = json.revision;
			self.evalCarrierJSON(json);
			self.update();
		}
	});
};

Rio.prototype.update = function()
{
	if (this.updateInCall || this.updateRevision >= this.revision) return;

	this.updateInCall = true;
	var self = this;

	var f = function()
	{
		if (self.updateRevision >= self.revision)
		{
			self.updateInCall = false;
			return;
		}

		if ( self.revision - self.updateRevision > 200 ) {
			return; // zu viele updates. macht keinen sinn
		}

		var urev = self.updateRevision + 1;
		var surev = Rio.spadd((urev & self.REVISION_MASK).toString(16), self.FILE_NAME_LENGTH, '0');

		var r = $.ajax(self.url + "/" + Rio.PATH_UPDATE + "/" + surev + ".json?" + urev, {
			processData: true,
			dataType: 'json',
			type: 'GET',
			complete: function(jqxhr, textStatus)
			{
				self.updateRevision = urev;
				if (textStatus == 'success')
				{
					var json = eval('(' + jqxhr.responseText + ')');
					if ( ! json.items ) json.items = json.updates;
					self.evalCarrierJSON(json);
					self.args.postUpdate(json);
					self.updateRevision = json.revision;
				}

				f();
			}
		});
	};

	f();
};


Rio.prototype.getBucket = function(stream, type, commitcode, bucknum, cback)
{

	if (!bucknum) bucknum = 0;
	if (!cback) cback = Rio.DUMMY_CALLBACK;
	if (!stream) cback([]);
	if (!commitcode) commitcode = this.commitcode;

	var buckfold = Math.floor(bucknum/256);
	var sbuckpath = Rio.spadd(buckfold.toString(16), 4, '0') + '00/' + Rio.spadd(bucknum.toString(16), 6, '0') + '.json?commit=' + commitcode;
	
	//console.log("Rio.getBucket: #" + bucknum + " from " + sbuckpath);

	
	var requesturl = "";
	if ( type == Rio.PATH_STREAM ) {
		requesturl = this.url + '/' + Rio.PATH_STREAM + '/' + stream + '/' + sbuckpath
	} else {
		requesturl = this.url + '/' + type + '/' + stream.substr(0, 2) + '/' + stream + '/' + sbuckpath
	}
	
	var r = $.ajax(requesturl, {
		processData: true,
		dataType: 'json',
		type: 'GET',
		complete: function(jqxhr, textStatus)
		{
			var msgs = [];
			if (textStatus == 'success')
			{
				try {
					var json = eval('(' + jqxhr.responseText + ')');
					var m, itms = json.items;
					if (!itms) itms = [];
					for (var i = 0, ii = itms.length; i < ii; i++)
					{
						m = itms[i];
						if (!m) continue;

						if (m.deleted && m.index > 0) continue;
						if (m.deleted)
						{
							//console.log(["a deleted message: ", m]);
						}
						msgs.push(m);
					}
				} catch (e) {
					console.error('Rio.getBucketMessagesInternal.onComplete: {');
					console.error(e);
					console.error('}');
				}
			}
			cback(msgs);
		}
	});
}


Rio.prototype.requestMore = function(stream, type, commitcode, pos, length, cback, dataForCallback)

{
	if (!pos || pos <= 0) return cback([]);

	//console.log("Rio.requestMore: from: " + pos + " len: " + length);
	var self = this;

	var bucknum = Math.floor(pos/Rio.BUCKET_SIZE);
	var messages = [];
	var response = { stream: stream, items: messages };
	
	
	if (!length) length = 10;
	if (!cback) cback = Rio.DUMMY_CALLBACK;
	if (!commitcode) commitcode = this.commitcode;

	var mpusher = function (bmessages)
	{
		var m, ix;
		for (var i = bmessages.length - 1; i > -1; i--)
		{
			ix = i;
			m = bmessages[i];
			if (messages.length >= length) break;
			if (m.index <= pos) messages.push(m);
		}

		if (messages.length >= length || bucknum == 0)
		{
			response.more = (bucknum == 0 && ix <= 0) ? false : true

			cback(response, dataForCallback);

			return;
		}

		bucknum -= 1;
		self.getBucket(stream, type, commitcode, bucknum, mpusher);
	}; 

	this.getBucket(stream, type, commitcode, bucknum, mpusher);
}


Rio.prototype.requestInitial = function(stream, type, commitcode, cback, dataForCallback, errorCallback)
{
	//console.log("Rio.prototype.requestInitial", stream, type, commitcode);

	if (!commitcode) commitcode = this.commitcode;
	if (!cback) cback = Rio.DUMMY_CALLBACK;

	if ( ! type ) type = Rio.PATH_STREAM;

	// everything that is not a plain stream is grouped in subdirs
	var sub = (type == Rio.PATH_STREAM) ? "" : stream.substr(0, 2) + '/';
	
	
	var requesturl = this.url + '/' + type + '/' + sub + stream + '/initial.json?' + commitcode;

	var r = $.ajax(requesturl, {
		processData: true,
		dataType: 'json',
		type: 'GET',
		success: function(json, textStatus, jqxhr)
		{
			if ( ! json.items ) json.items = json.updates;
			json.stream = stream;
			//console.log(json);
			cback(json,dataForCallback);
		},
		error: function(jqxhr, response, textStatus)
		{
			if(typeof errorCallback != 'undefined'){
				errorCallback(response, textStatus);
			}
		}
	});
}


Rio.pcode = function(t, p)
{
	var tm = parseInt(t / 1000, 10);
	var mask = 0xfffffff ^ ((1 << p) - 1);
	var val = tm & mask;

	if (val < 0)
	{
		val = 0xFFFFFFFF + val + 1;
	}

	return val.toString(16).toUpperCase();
}

Rio.spadd = function(s, l, p)
{
	if (!s) s = '';
	if (!p) p = ' ';
	if (!l) l = 0;
	for (var i = s.length; i < l; i++)
	{
		s = p + s;
	}
	return s;
}

