var ThirdSocket = mkclass({
	
	// wsUri: "ws://localhost:55555/",
	// websocket: null,
	
	init: function() {
		this.wsUri = "ws://sovdev.com:55555/";
		// this.opensocket();
	},
	
	doSend: function(message) { 
		websocket.send(message); 
	},
	
	onOpen: function(evt) {
		websocket.send("{ \"method\": \"hello\" }"); 
		$('#debug_text').text("Socket open");
		// doSend("Hello"); 
	},

	onClose: function(evt) { 
		$('#debug_text').text("Socket close " + evt.reason);
	}, 

	onMessage: function(evt) {

		var json = jQuery.parseJSON(evt.data);

		var envelopes = json.updates;
		for ( var i = 0; i < envelopes.length; i++ ) {
			var e = envelopes[i];
			the3rdscreen.postEnvelope(e);
		}
		
	},
	
	onError: function(evt) { 
		// writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data); 
		$('#debug_text').text("Socket error " + evt.data);
	},

	
	start: function() {
		this.opensocket();
	},
	
	opensocket: function() {
		websocket = new WebSocket(this.wsUri);
		websocket.onopen = this.onOpen; 
		websocket.onclose = this.onClose; 
		websocket.onmessage = this.onMessage; 
		websocket.onerror = this.onError; 
	}
	
});



