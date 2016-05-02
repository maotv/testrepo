var ThirdScreenDatastore = mkclass({

	init: function(initCBack)
	{
		if(initCBack &&  typeof initCBack == 'function'){
			this.initCBack = initCBack;
		}
		//console.log(abc);
			var self = this;
			//this.protocol = new DummyRio();
		var port = (window.location.port != "") ? ":" + window.location.port : '';
		var tld = window.location.hostname.split(".");

		// FIXME Saubere konfiguration des environment
		if(tld[tld.length-1] == "in")
		{
			this.wsDomain = "ws.flyp.in";
			this.pusherKey = "0708e5675118ddb0be11";
		}
		else if(tld[tld.length-1] == "st")
		{
			this.wsDomain = "ws.flyp.st";
			this.pusherKey = "afbd01527f2ec4bc4c5a";
		}
		else
		{
			this.wsDomain = "ws.flypsite.net"; 
			this.pusherKey = "3bd9f270de4a9ca0cc78";
		}

		// disable for local development - ThirdScreenConfig.USE_PUSHER = false;
		var usePusherCom = (typeof ThirdScreenConfig.USE_PUSHER !== 'undefined') ? ThirdScreenConfig.USE_PUSHER : true;
/*
		this.protocol = new Rio({
			useWs : ThirdScreenConfig.USE_WS, 
			wsUrl: 'ws://' + this.wsDomain + ':55555/websocket',
			pusherKey: this.pusherKey,
			url: 'http://' + window.location.hostname + port,
			startRuntimePhase: this.startRuntimePhase,
			postUpdate: this.postUpdates,
			client: ThirdScreenConfig.CLIENT_ID,
			usePusher: usePusherCom
			});
		this.protocol.start();
*/
			
		this.protocol = new Flyp.Vienna(ThirdScreenConfig.CLIENT_TOKEN, {
		  pusher: this.pusherKey
		});

		this.protocol.connect({
			initial: function(json) { 
				/* initialcb */ 
				console.log("initial callback");
				self.postUpdates(json);
			},
			update: function(json) { 
				/* updatecb */   
				console.log("update callback");
				self.postUpdates(json);
			},
			command: function(json) { /* updatecb */  console.log("command callback"); }
		});
    	
    	this.isInitialPhase = false;
		this.protocolInitialFinished = false;
		this.initialProcessed = false;
		this.thirdscreen = null;
		this.minIndex = []; //-1;
		this.maxIndex = []; //-1;
		this.renderingDelay = 3000; // delay in ms
		this.renderingDelayFrames = (ThirdScreenConfig.SOCIAL_STREAM_DELAY == null) ? 1500 : ThirdScreenConfig.SOCIAL_STREAM_DELAY; // delay in ms, dieser buffer greift momentan nur im socialframe, ist aber vorbereitet für die anderen frames!
		// this.renderingDelayFrames = 3000; // delay in ms, dieser buffer greift momentan nur im socialframe, ist aber vorbereitet für die anderen frames!

		this.socialstreamMaxLength = (ThirdScreenConfig.SOCIAL_STREAM_SIZE == null) ? 10 : ThirdScreenConfig.SOCIAL_STREAM_SIZE; // Maximale Länge des Social Stream Buffers

		this.streamRenderingDelay = this.renderingDelay; // das delay zwischen den streams in einem updatezyklus...
		this.renderingInterval = null;

		this.displayBuffer = {};
		this.displayBufferKeys = [];
		this.displayBufferSize = 0;
		this.displayBufferFrames = {};
		this.allEnvelopes = {};

		this.startInitialPhase();

	},

  commitPoll: function(data, cback, obj)
  {
    this.protocol.sendPollCommit(data, cback, obj);
  },

  commitChat: function(msgUrl, cback, obj)
  {
    this.protocol.sendChatCommit(msgUrl, cback, obj);
  },

  getUUID: function(){
    return this.protocol.getUUID();
  },

  startInitialPhase: function()
  {
    
  	this.isInitialPhase = true;
    this.startDisplayBufferRendering();
    this.startFrameBufferRendering();
    
  },

  startRuntimePhase: function()
  {
    this.initCBack();
    this.protocolInitialFinished = true;
    if( this.initialProcessed ) {
      this.isInitialPhase = false;
  	}

  },

  shortenSocialStreamBuffer: function(){
    // SOCIAL BUFFER
    // array.splice(0, array.length - this.socialstreamMaxLength)
    // entfernt die ältesten einträge im buffer bis nur noch this.socialstreamMaxLength {anzahl} elemente im buffer sind

    if(this.displayBufferFrames.socialstream.length > this.socialstreamMaxLength){
      this.displayBufferFrames.socialstream.splice(0,this.displayBufferFrames.socialstream.length-this.socialstreamMaxLength);
    }
  },

  // daten entgegennehmen
  // speichern
  // in displayBuffer oder Body einsortieren
  
  postUpdates: function(p)
  {
	// initial befuellung direkt anzeigen
    if(p.frames != undefined ) {

      for(var i in p.frames) {
        var f = p.frames[i];
        
        if( f == undefined || f.message == undefined ) continue;
        if( f.stream == "social" ){
          f.message.frame = "socialstream";
        }
        f.deleted = false;
        
        this.allEnvelopes[f.id] = f;
        // debug : raus:
        if(f.message.frame == "socialstream")
        {
          if(this.displayBufferFrames.socialstream == undefined) {
            this.displayBufferFrames.socialstream = new Array();
          } 
          if( !this.isInitialPhase )
          {
            this.displayBufferFrames.socialstream.push(f);            
          }
          else 
          {
            this.thirdscreen.postEnvelope(f);
          }

          // SOCIAL BUFFER
          this.shortenSocialStreamBuffer();

        }
        else
        {          
          this.thirdscreen.postEnvelope(f);
        }
        this.checkMinMaxIndex(f);
        this.updateMinMaxIndex(f);
      }

    }
	
    // rest abarbeiten
    this.saveAndShow(p);
    
  },

  checkDeleted: function(id) 
  {
   return this.allEnvelopes[id].deleted;
    
  },


  saveAndShow: function(toProcess)
  {
  
    // - aenderungen an dargestellten anstoßen
    // - geloeschte dargestellte ausblenden
    // - aenderungen, loeschen an nicht in App vorhandenen verwerfen (index < minIndex)
    

    // spaeter
    // - evt. aenderungen aus neuen Daten in vorhandenen im displayBuffer beruecksichtigen
    // - kommentare verwerfen (im Moment)
    
    var u;
    var counterTop = 0;

    // anzeige in tetris bei initial : letzte oben
    if( this.isInitialPhase ){
      toProcess.updates.reverse();
    }

    for(var i in toProcess.updates){

      u = toProcess.updates[i];

      if( u.stream && u.stream == "social"){
        
        // debug
        //continue;
        
        u.message.frame = "socialstream";
        u.message.layout = "message";
        u.message.style = "s1";
        u.message.type = "message";
        if(this.displayBufferFrames.socialstream == undefined) {
          this.displayBufferFrames.socialstream = new Array();
        }
        this.displayBufferFrames.socialstream.push(u);  

        // SOCIAL BUFFER
        this.shortenSocialStreamBuffer();

        // neu: gebuffert
        continue;
      }

      ////console.log("saveAndShow: ")
      ////console.log(u);

      // no comments please! - FIXME Doch, nur Kachelkommentare sollen hier nicht durch! 
      // (Hack: Prüfung auf name ist UUID)
      if ( u.message && u.message.type == "comment" && u.stream && u.stream.charAt(8) == "-" && u.stream.charAt(13) == "-" && u.stream.charAt(18) == "-" && u.stream.charAt(23) == "-" ) {
        continue;
      } 
      
      
      // FIXME: richtig im Client? aeltere Nachrichten sind aus DB sicht updates auch wenn sie in der initial ausgespeilt werden
      // wird hier umgebogen
      if( this.isInitialPhase ){                
        u.action = "new";
        // keinen social in tetris!
        if(u.message.frame == "socialstream") continue;
        
      }

      // add deleted field for later
      u.deleted = false;
      
      
      this.checkMinMaxIndex(u);
      
      switch( u.action ){
        case "new": 
          if( this.hasEnvelope(u) ) {
            // env exists - proceed with next
            //console.log("env exists - proceed with next");
            break;
          }
          this.allEnvelopes[u.id] = u;          

          if ( this.isInitialPhase ) {
            // initial ohne animation
            this.thirdscreen.fillTetrisInitial(u);
          } else {
            // runtime
            ////console.log("push!" + u.message.text + ", " + this.displayBuffer.length );
            
            this.fillDisplayBuffer(u);  
            ////console.log("push2!" + this.displayBuffer.length );
          }
          
          break;

        case "update":
          this.allEnvelopes[u.id] = u;
          var f = u.id;
          if( f.indexOf("_frame") != -1 ){
          	if(u.messageupdate) {
          		this.thirdscreen.updateTile(u);     
          	} else {
            	this.fillDisplayBuffer(u);        
            }    
          } else {
          	this.thirdscreen.updateTile(u);            
          }
         
          break;

        case "delete":    
          if( u.index < this.minIndex[u.stream] || u.index > this.maxIndex[u.stream] ) {
            //////console.log("break index");
            // ausserhalb des dargestellten bereichs - verwerfen
            break;
          }
          this.allEnvelopes[u.id].deleted = true;;
          this.thirdscreen.deleteTile(u);
          break;

        case "statusupdate":
          //console.error("statusupdate");
          //console.error(u);
          this.thirdscreen.updateCommentCount(u);
          break;

        default:
          //////console.log("unknown action:" + u.action);
      }

      

      // min / max index anpassen
      this.updateMinMaxIndex(u);
      
    }
  
    if ( !this.initialProcessed ) {
      this.isInitialPhase = false;
      this.initialProcessed = true;
    }

  },
  
  registerEnvelope: function(env) {
      this.checkMinMaxIndex(env);
      this.allEnvelopes[env.id] = env;
      this.updateMinMaxIndex(env);
  },

  updateMinMaxIndex: function(u) {
    //console.log("updateMinMaxIndex for: " + u.stream + ": " + this.minIndex[u.stream] + ", " + this.maxIndex[u.stream] + ": " + u.index);
    this.minIndex[u.stream] = (this.minIndex[u.stream] == -1) ? u.index : ( (u.index < this.minIndex[u.stream]) ? u.index : this.minIndex[u.stream] );
    this.maxIndex[u.stream] = (this.maxIndex[u.stream] == -1) ? u.index : ( (u.index > this.maxIndex[u.stream]) ? u.index : this.maxIndex[u.stream] );    
  },
  
	requestInitialComments: function(stream, commitId , callback, dataForCallback) {
	  //console.log("datastore requestInitialComments", comKey, commitId);
		this.protocol.requestInitial(stream, Rio.PATH_COMMENTS, commitId, callback, dataForCallback);
	},

	requestMoreComments: function(stream, commitcode, pos, length, cback) {
		//console.log("datastore requestMoreComments", stream, commitcode, pos, length, cback);
		this.protocol.requestMore(stream, Rio.PATH_COMMENTS, commitcode, pos, length, cback);
	},

	requestInitialStream: function(stream, commit, callback) {
	  //console.log("datastore requestInitialStream", comKey, streamname);
		this.protocol.requestInitial(stream, Rio.PATH_STREAM, commit, callback);
	},

	requestMoreMessages: function(stream, commitcode, pos, length, cback, dataForCallback) {
		//console.info("requestMoreMessages");
		this.protocol.requestMore(stream, Rio.PATH_STREAM, commitcode, pos, length, cback, dataForCallback);
	},


  checkMinMaxIndex: function(u)
  {
    //check if min/max exist
    if( this.minIndex[u.stream] == undefined) {
      this.minIndex[u.stream] = -1;
    }

    if( this.maxIndex[u.stream] == undefined) {
      this.maxIndex[u.stream] = -1;
    }
  },



  hasEnvelope: function(envelope)
  {
    if( this.allEnvelopes[envelope.id] != undefined ) {
      return true;
    }
    return false;
  },


	fillDisplayBuffer: function(u) {
    	if(this.displayBuffer[u.stream] == undefined) {
        	this.displayBuffer[u.stream] = new Array();
        	this.displayBufferKeys.push(u.stream);
        }     
        this.displayBuffer[u.stream].push(u);   
	},
  
  	getObjectSize: function(obj)
  	{
  		var count = 0;
		var i;
		for (i in obj) {
			if (obj.hasOwnProperty(i)) {
				count++;
			}
		}
		return count;
  	},

   startDisplayBufferRendering: function()
   {	
    var self = this;
    var dly = this.renderingDelay;
    self.streamRenderingDelay = (this.getObjectSize(this.displayBuffer) == 0 ) ? this.renderingDelay : this.renderingDelay / this.getObjectSize(this.displayBuffer);
    
    this.streamRenderingPosition = 0;
    
    this.startRenderingInterval = function() 
    {
      return setInterval( 
        function (puff)
          {
          	// passt das streamRenderingDelay an und startet das renderingInterval neu
			if(self.displayBufferSize != self.getObjectSize(self.displayBuffer) ) {
				clearInterval(self.renderingInterval);
				self.displayBufferSize = self.getObjectSize(self.displayBuffer);
				self.streamRenderingDelay = ( self.displayBufferSize == 0 ) ? self.renderingDelay : self.renderingDelay / self.displayBufferSize;
				self.renderingInterval = self.startRenderingInterval();
				// müssen wir hier raus? (return ? )
			}
            
            // checken ob der stream einträge hat, sonst in den anderen streams suchen...
            if( self.displayBuffer[self.displayBufferKeys[self.streamRenderingPosition]] && self.displayBuffer[self.displayBufferKeys[self.streamRenderingPosition]].length == 0 ) {
            	var match = false;
            	for(var i = self.streamRenderingPosition + 1; i < self.displayBufferKeys.length; i++ ) {
            		if( self.displayBuffer[self.displayBufferKeys[i]].length > 0 ) {
            			self.streamRenderingPosition = i;
            			match = true;
            			break;
            		}
            	}
            	if(match == false) {
					for(var i = 0; i < self.streamRenderingPosition; i++ ) {
						if( self.displayBuffer[self.displayBufferKeys[i]].length > 0 ) {
							self.streamRenderingPosition = i;
							match = true;
							break;
						}
					}
            	}
            }
            
            // console.log('datastore display buffer', self.displayBuffer);
	
            if(self.displayBuffer[self.displayBufferKeys[self.streamRenderingPosition]]){
	            self.thirdscreen.postEnvelope( self.displayBuffer[self.displayBufferKeys[self.streamRenderingPosition]].shift() );
    	        self.streamRenderingPosition++;
        	    if(self.streamRenderingPosition >= self.displayBufferKeys.length){
        	    	self.streamRenderingPosition = 0;
            	}
	        
	        }
	        //console.log("pos:"  + self.streamRenderingPosition);
            
          },self.streamRenderingDelay, this);	
    };
    self.renderingInterval = self.startRenderingInterval();

   },

   startFrameBufferRendering: function()
   {

	//console.log("startFrameBufferRendering" + this.displayBufferFrames.length);

    var self = this;
    var dly = this.renderingDelayFrames;
    var f = function() 
    {
      setInterval( 
        function (puff)
          {
          
          	//console.log("FrameBufferRendering",self.displayBufferFrames, Date.now()/1000);
          
            $.each(self.displayBufferFrames, function(k,v) {
              self.thirdscreen.postEnvelope( self.displayBufferFrames[k].shift() );
            });         
          
          },dly, this);
    };
    f();

   },

	getAllEnvelopesAsArray: function() {
		var ak = new Array();
		for(var i in this.allEnvelopes)
		{
			ak.push(this.allEnvelopes[i]);
		}
		return ak;
	},

	getAllEnvelopesForStream: function(stream) {
		var ak = new Array();
		for(var i in this.allEnvelopes)
		{
			if(this.allEnvelopes[i].stream == stream) ak.push(this.allEnvelopes[i]);
		}
		return ak;
	},
});
