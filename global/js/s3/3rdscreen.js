/*
**************************************  JQUERY PLUGINS *************************************************
*/



/**
 * Lazyload Plugin for jQuery
 * plugin supports dynamic loaded images as well as static images
 * inspired by and based on:
 * 
 * jQuery Unveil
 * http://luis-almeida.github.com/unveil
 *
 * and 
 *
 * jQuery Lazy
 * https://github.com/eisbehr-/jquery.lazy
 *
 * --------------
 *
 * use with static images:
 * HTML : <img src="trans.gif" data-src="realimage.jpg" class="lazyloading">
 * JS: $(".lazyloading").lazyload();
 *
 *
 * use with dynamic images:
 * var elem = $('<img>').attr('src','trans.gif').attr('data-src','realimage.jpg');
 * var loader = $(".lazyloading").lazyload();
 * loader.registerElement(elem[0]);
 *
 */

(function($) {

	$.fn.lazyload = function(settings) {

		// some setup
		var $w = $(window);
		var elementStack = this;
		var loaded;
		var elapsed = 0;
		var lastrun = 0;

		// defaults
		var config =
        {
			// TODO eventSource setzen
			offset				: 200,			// how many px to look for images in advance
            attribute       	: "data-src",	// in which attribute to look for real source 
            removeAttribute 	: true,			// remove attribute after use
            enableEventBlocking	: true,			// allow events like scoll and resize to be blocked for config.eventBlocking ms
			eventBlocking		: 250,			// time in ms where only one event is processed
			onLoad				: null,			// callback to be called on load of image
			onError				: null,			// callback to be called on error
			cssBefore			: null,			// css to apply before loading
			cssAfter			: null			// css to apply after loading

        };

		// user settings overwrite defaults
		if( settings ) $.extend(config, settings);

		// apply listener to all yet known images
		$(this).each(function(index, el) {
			addListener(this);
		});

		// ------- internal functions ------------
		
		// add onetime listener for loadimage event
		function addListener(elem){
			//console.info(elem);
			var $e = $(elem);
			var tag = elem.tagName.toLowerCase();

			//console.info(tag, $e, $e.attr(config.attribute));

			// if configured attribute exists and target value is not already correct
			if($e.attr(config.attribute) &&
				(
					( tag == 'img' && $e.attr('src') != $e.attr(config.attribute) ) ||
					( tag != 'img' && $e.css('background-image') != $e.attr(config.attribute))
				)
			){
				// add before css
				if(config.cssBefore) $e.css(config.cssBefore);
				// add listener
				$(elem).one("loadimage", function(){

					var $e = $(this);
					var src = $e.attr(config.attribute);
					if (src) {

						var $img = $(new Image());
						
						// setup event handler
						$img.one('error.lazyload', function(event) {
							event.preventDefault();
							if(config.onError && typeof config.onError === "function") config.onError.apply($e[0]);
							// remove event handlers and object
							$img.off(".lazyload");
                            $img.remove();
						});
						

						$img.one('load.lazyload', function(event) {

							event.preventDefault();
							if(tag == "img"){
								$e.attr("src", src);
							}else{
								$e.css('background-image', "url(" + src + ")");

							}
							//$e.removeClass('lazyloading');
							// apply css
							if(config.cssAfter){
								$e.css(config.cssAfter);
							}
							// apply handler
							if(config.onLoad && typeof config.onLoad === "function") config.onLoad.apply($e[0]);
							// remove event handlers and object
							if(tag == "img"){
								$e.trigger('imageLoaded.list', $img);
							}else{				
								$e.trigger('imageLoaded.nolist', $img);
							}
							$img.off(".lazyload");
							$img.remove();

						});
						// go
						$img.attr('src', src);
						// call load on cached images
						if( $img[0].complete ) $img.load();

						// remove attribute from element
						if(config.removeAttribute) $e.removeAttr(config.attribute);
					}

				});
				// everything fine - carry on
				return true;
			} else {
				// something wrong - hold on
				return false;
			}
		}

		// check for all images in stack if they are in viewport
		// if yes - trigger loadimage event
		function loadImages() {
			if(config.enableEventBlocking){
				// block processing for config.eventBlocking ms
				elapsed = new Date().getTime() - lastrun;
				if( elapsed < config.eventBlocking ){
					return;
				}else{
					lastrun = new Date().getTime();
				}
			}
			
			// get all elements new in viewport
			var inviewport = elementStack.filter(function() {
				return checkPosition(this);
			});

			loaded = inviewport.trigger("loadimage");
			elementStack = elementStack.not(loaded);
		}

		// check if element is visible with little timeout if browsers are too fast
		// chrome and safari seemed to check position before position was final
		// so we slow down a bit
		function checkElement(elem){
			/*
			// not for IE
			var fnc = function(e){
				if(checkPosition(e)){
					$e = $(e);
					elementStack.not($e.trigger("loadimage"));
				}
			};

			setTimeout(	fnc,  500, elem);
			*/
			// so we use anonymous functions
			setTimeout(function(){if(checkPosition(elem)){ $e = $(elem); elementStack.not($e.trigger("loadimage"));	}}, 500)
		}

		// check position of element on page
		function checkPosition(elem){
			var $e = $(elem);
			if ($e.is(":hidden")) return;

			
			var wt = $w.scrollTop();
			var wb = wt + $w.height();
			var et = $e.offset().top;
			var eb = et + $e.height();

			if( eb >= wt - config.offset && et <= wb + config.offset ) {
				return true;
			}
			return false;
		}

		// bind to scroll, resize
		$w.on("scroll.lazyload resize.lazyload open.lazyload", loadImages);

		// initial check on first call for images already in page
		loadImages();



		// ------- interface --------------

		// return interface to add dynamic images
		return {
			registerElement: function(elem){

				if(addListener(elem)){
					elementStack = elementStack.add($(elem));
					checkElement(elem);
				}
			}
		};

	};

})(window.jQuery);



/*
**************************************  3rdscreen **************************************
*/





$.cssHooks.backgroundColor = {
	get: function(elem) {
		if (elem.currentStyle)
			var bg = elem.currentStyle["backgroundColor"];
		else if (window.getComputedStyle)
			var bg = document.defaultView.getComputedStyle(elem,
				null).getPropertyValue("background-color");
				
		if (bg.search("rgb") == -1)
			return bg;
		else {
			bgp = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			if(!bgp) // alpha?
				bgp = bg.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
			function hex(x) {
				return ("0" + parseInt(x).toString(16)).slice(-2);
			}
			return "#" + hex(bgp[1]) + hex(bgp[2]) + hex(bgp[3]);
		}
	}
}

 var Cookies = {
	init: function() {
			var allCookies = document.cookie.split("; ");
			for (var i = 0; i < allCookies.length; i++) {
					var cookiePair = allCookies[i].split("=");
					this[cookiePair[0]] = cookiePair[1];
			}
	},
	create: function(name, value, days) {
			if (days) {
					var date = new Date;
					date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
					var expires = "; expires=" + date.toGMTString();
			} else var expires = "";
			document.cookie = name + "=" + value + expires + "; path=/";
			this[name] = value;
	},
	erase: function(name) {
			this.create(name, "", -1);
			this[name] = undefined;
	}
};

var modifyLayout = function(frame, envelope) {
	// unimplemented Function can be 
	// replaced by client-specific code.
};

var ThirdScreen = mkclass({

    init: function()
    {
		var self = this;
		this.screen = { };
		this.frames  = { };
		this.streams_frames = { };
		this.layouts = ThirdLayout;
		this.config = ThirdScreenConfig;
		this.container;
		this.notInTetris = [];
		this.data = { };
		this.update = null;
		this.pageScrollTop = 0;
		this.videoIsPlaying = false;
		this.processScroll = true;

		this.overlayImage = new Image();

		this.the3rdeditor;
		//this.datastore = new ThirdScreenDatastore(); // initializes Rio
		//this.datastore.thirdscreen = this;

		this.appendix = "";
		this.tempCount = 0;
		this.styleCount = 1;
		this.initComments();
		this.comKeys = [];
		var openComment = null;
		this.commentStreams = [];
		this.numberOfComments = 5;
		this.shadePercentLighter = 7;
		this.shadePercentDarker = -5;
		this.slideshows = [];
		this.moreForIDevice = [];		
		this.lists = [];

		Cookies.init();

		// lazyloader
		this.dolazyloading = true;
		// some configuration
		var config = {};
		config['cssBefore'] = {"opacity": 0,"transition": "opacity .3s ease-in"};
		config['cssAfter']	= {"opacity": 1};
		config['onLoad'] = function(){
			// do something on load of image
			$(this).removeClass('lazyloading');

		};

		config['onError'] = function(){
			// do something on error of image
			if(this.tagName.toLowerCase() === 'img'){
				this.style.display = 'none';
			}
		};

		
		this.imageLoader = $(".lazyloading").lazyload(config);
		
		if('ontouchstart' in document.documentElement) $('body').addClass('isTouch');
		else $('body').addClass('noTouch');

    },
    
    initComments: function() {
    	var self = this;
    	// self.initLogin(); MAO nach unten geschoben 
    	self.initCookies();
    	self.initMessageCommentField();
    	
      	
      	var f = function() 
      	{
			setTimeout( function ()
  	        {
  					self.initLogin();
  			      	self.initChat();
  			      	self.initMessageCommentField();
  	        },2000, self);        
    	};
      
	    f();
      
    },
    
    requestStartData: function ()
    {

      	var self = this;
		
		if(self.config.IS_EDITOR)
		{
			// handled in v3_dragdrop
		}
		else
		{

			// Using the core $.ajax method
			$.ajax({
		
			  url : this.config.CONFIG_URL + "?" + String(Math.random()).substring(2),
			  type : "GET",
			  dataType : "json",
			  success : function( json ) {					
					self.onRequestStartData(json);
			  },
		
			  error : function( xhr, status ) {
					self.log("Sorry, there was a problem! requestStartData: " +  self.config.CONFIG_URL + ", " + status);
			  },
		
			  complete : function( xhr, status ) {
				// alert("The request is complete!");
			  }
		
			}); 
      	}
    }, 
   
   
   	onRequestStartData: function(json){
   		   		
   		var j = (json.result == undefined) ? json : json.result;
   	
		this.start(j);
      	this.data = j.data;
   	},
   
   
    start: function(json){
				
		var self = this;
		self.buildRaster(json.screen);
		self.buildFrames(json.frames);
		  
	    // masonry or rows
	    self.container = $('#tetris');
	    if( ThirdScreenConfig.MAIN_CONTAINER )
	    {
	      self.container = $('#' + ThirdScreenConfig.MAIN_CONTAINER);
	    }
	    
	    if( ThirdScreenConfig.TETRIS_ANIMATION == "masonry" ) 
	    {
	      	self.container.masonry({
  	    		itemSelector: '.tile',
  	    		columnWidth: 80,
  	    		gutterWidth: 0, 
  	    		//isAnimated: !Modernizr.csstransitions  
  	    	});
	    } 
	    else if( ThirdScreenConfig.TETRIS_ANIMATION == "rows" )
	    {
	      var d, numOfRows; 
	      if( ThirdScreenConfig.TETRIS_ROWS > 0 )
	      {
	        numOfRows = ThirdScreenConfig.TETRIS_ROWS;
	      }
	      else
	      {
	        numOfRows = 3; // default
	      }
	      for(var i = 1; i < numOfRows + 1; i++)
	      {
	        d = $(document.createElement("div"));
  	      	d.attr("id", "tetris_row" + i);
  	      	d.addClass("tetris_row")
  	      	self.container.append(d);	        
	      }
	    }
	    else
	    {
	      alert("Tetris Animation must be set");
	    }

		var initCBack = function(){};
			
		if(typeof InitializeCBack != 'undefined' &&  typeof InitializeCBack == 'function'){
			var initCBack = InitializeCBack;
		}
		
		self.datastore = new ThirdScreenDatastore(initCBack); // initializes Rio
		self.datastore.thirdscreen = this;
		
		// HACK:
		window.ds = self.datastore;
		
		if(ThirdScreenConfig.SOCIAL_STREAM_DELAY){
			self.datastore.renderingDelayFrames = ThirdScreenConfig.SOCIAL_STREAM_DELAY;
		}
		

		self.init_listeners(); // window resize, keydown et al...
    },
    
    initTiles: function() {
    		
    },

    sendPollCommit: function(data, cback, obj) {
    	this.datastore.commitPoll(data, cback, obj);
    },

    sendChatCommit: function(data, cback, obj){
    	this.datastore.commitChat(data, cback, obj);
    },

    getUUID: function(){
    	return Rio.UUID;
    },

    deleteTile: function(envelope) {

      	var tile = this.getTile(envelope);
      	if ( tile == null ){
      		// durch lazy loading kann es sein das eine id nicht auf der buehne liegt
      		this.checkIdInSlideshow(envelope.id);	
      		return;
      	} 
		
      	var tetris = tile.parents('#tetris');
      	var main = tile.parents('#main');

      	//console.info("deleteTile: " + envelope.id);

      	if( tetris.size() > 0 || tile.parent().attr("type") == "list" ) {
        	tile.remove()
        }else if( tile.parent().hasClass('slidesjs-control') || tile.hasClass('slide') ){
        	// remove in slideshow
        	this.removeTileFromSlideshow(tile);
      	} else if( main.size() > 0 ) {
        	//tile.replaceWith('<div id="#e' + envelope.id + '"><p> <!-- DELTED --> </p></div>');
      	}
    },

    checkIdInSlideshow: function(id){
    	$(this.slideshows).each(function() {
    		this.removeSlide(id); 
    	});
    },

    removeTileFromSlideshow: function(tile)
    {
    	//console.info("removeTileFromSlideshow");
    	// get slideshow and remove tile from it
    	var showmid = $(tile).closest('.slideshow').attr('mid');
    	$(this.slideshows).each(function() {
    		if(this.mid == showmid)	{
    			this.removeSlide(tile.attr('id')); 
    		}
    	});
    },

    getTile: function(envelope)
    {	
    	//console.log("getTile", envelope);
    	id = envelope.id;
      	if ($('#e' + id).length > 0 ) {
        	return $('#e' + id);
      	} else {
      		if ($('#e' + envelope.stream + "_frame").length > 0 && envelope.messageupdate) {
      			//console.log("is frame", $('#e' + envelope.stream + "_frame").attr("mid"));
        		
        		return $('#e' + envelope.stream + "_frame");
        		/*
        		if($('#e' + envelope.stream + "_frame").attr("mid") == envelope.message.id) {
        			return $('#e' + envelope.stream + "_frame");
        		}
        		*/
      		}
        	return null;
      	}
    },

    updateTile: function(envelope) {
		var tile = this.getTile(envelope);
      	if ( tile == null ) {
      		return;
		}
		//
		var d = this.generateHTMLBox(envelope, false);
      	tile.replaceWith(d);
      	this.shortenTextNew(d,null);
      	

    },

    updateCommentCount: function(envelope)
    {

        //console.log("updateCommentCount",envelope);
        var tile = this.getTile(envelope);
        //console.log("tile",tile);

      	if(tile == null && envelope.comments.count > 0) // list?
      	{
      		tile = $(document).find('[comkey="' +  envelope.comments.key + '"]'); //.children('.tilecontent');
      	}
      	
      	if ( tile == null ) 
      	{
        	return;
      	}
      	      	
      	      	
		tile.attr('comkey', envelope.comments.key);
		tile.attr('commit', envelope.comments.commit);
		console.log("updateCommentCount 2");
      	if(tile.parent().attr("type") == "list")
      	{	
      		var eLCount = tile.find(".eLCommentCount");
      		if(eLCount.length == 0)
      		{	
      			eLCount = tile.find(".listCommentCount");
      			eLCount.find("div:first-child").text(envelope.comments.count);
      			eLCount.find("div:first-child").removeClass("flypicon");
      			eLCount.find("div:first-child").addClass("eLCommentCount");
      		} else {
      			eLCount.text(envelope.comments.count);
      			eLCount.removeClass("flypicon");
      			eLCount.addClass("eLCommentCount");
      		}
      		
      	}
      	else
      	{
			if( envelope.comments.count == 0 ) {
				tile.children('.theComment').attr("style",null).attr("title", "Ihr Kommentar").text("");
				tile.children('.theComment').addClass('nocomment').removeClass('commentcount');		
			} else {
				console.log("no list, has Comment 1",tile.children('.theComment').attr("class"), $(tile.children('.theComment')));
				tile.children('.theComment').addClass('commentcount').removeClass("nocomment");
				tile.children('.theComment').css('display', 'inline-block');
				tile.children('.theComment').text(envelope.comments.count);
				tile.children('.theComment').attr("title", envelope.comments.count + " Kommentare");
				console.log("2", tile.children('.theComment').attr("class"), $(tile.children('.theComment')));
		    }
		}
    },
    
    buildRaster: function(screen) 
    { 
      
      var self = this;
      $.each(screen, function(index, element){ 
        
        var key = element.name;
          
        var d = $(document.createElement("div")); 
        d.attr("id", key);
        var fucktor = 1;
    		if( self.config.IS_EDITOR )
        { 
          var fucktor = 1/3.5;
        }
        d.css("width",  element.width * fucktor);
        d.css("height", element.height * fucktor);          
        d.addClass("raster " + key);   
        $("#screen").append(d);
        element['div'] = d;
        
        self.screen[key] = element;
         
      });
      	var cb = $(document.createElement("div"));
    	cb.addClass("cb");
      	$("#screen").append( cb ); 
    },

    
    buildColumnFrames: function () {
    	var self = this;
    	    	
    },

    buildFrames: function(framecfg) {
    	
    	var self = this;
    	if( self.config.IS_EDITOR ) {
    		this.buildFramesOld(framecfg);
    	} else {
    		this.buildLiveFrames(framecfg);
    	}
    	
    },

    buildEditorFrames: function(framecfg) {
    	// TODO: Minimal-Frame-Builder fuer den Editor,
    	// am besten in das backend-js auslagern.
    },


    
    buildLiveFrames: function(framecfg) {
		
    	var self = this;
    	
    	// FIXME: HACK. SORTIERUNG MUSS ANDERS...
    	var framesSorted = [];
    	$.each(framecfg, function(key, cfg) {
    		framesSorted.push( { "key":key, "cfg":cfg } );
    	});
    	
    	
    	framesSorted.sort(function(x,y){
    		var a = String(x.cfg.position);
    		var b = String(y.cfg.position);
    		if (a.toString() < b.toString()) return -1;
    		if (a.toString() > b.toString()) return 1;
	    	return 0;
    	});
    	
    	$.each(framesSorted, function(idx,obj) {
    		
    		var key = obj.key;
    		var cfg = obj.cfg;
    		
    		var raster = self.screen[cfg.raster];
    		var position = raster.positions[cfg.position];
    		var size = raster.sizes[cfg.size];
    		
    		var d = $(document.createElement("div")); 
    		d.attr("id", "frame_" + key);
    		d.attr("type", cfg.type); 
			d.css("height", size.height);  
			d.css("width", size.width);  
	
			if(cfg.type == "list" && !self.config.IS_EDITOR )
			{
				d.css("width",  raster.width);
				//d.css("height", "auto");    
				d.css("height", raster.height ); 
			}
			
			// position als strings
			d.css("left", position.x * 1);  
			d.css("top", position.y * 1);  
			
			
			d.css("background-color", cfg.color);
			d.addClass("frame " + key);   
			
			// deaktiviert wegen möglichkeit chat ja, comment nein
			//if(self.config.NO_COMMENT) d.addClass("nocomment");
			//if(self.config.NO_CHAT) d.addClass("nocomment"); < so???
			
			if(cfg.type == "float")
			{
			  d.css("float", "left");
			  d.css("position",'static');
			}
		
			var frm = {
				name: key,
				raster: raster,
				position: position,
				size: size,
				size_name: cfg.size,
				style: cfg.style,
				type: cfg.type,
				stream: cfg.stream,
				animationIn: cfg.animationIn,
				animationOut: cfg.animationOut,
				div: d
			};
			self.frames[key] = frm;
			d.on('messageAppended', function(ev, msg){
				if($(msg).attr('layout') == 'chat'){
				  	self.initLogin();
					self.initChat();
				}
			});
			raster.div.append(d);

			// set up streams_frames
			// zuerst mal auf den frame setzen:
			var fkey = key;
			if( cfg.stream ) // wenn wir einen stream aus der config haben, den nutzen:
			{
				fkey = cfg.stream;
			} 
			
			if( !self.streams_frames[fkey] )
			{
				self.streams_frames[fkey] = [];
			}
			self.streams_frames[fkey].push(frm);

			if(cfg.type == "list" && !self.config.IS_EDITOR )
			{
				var theScrollFunc = function(e){
					// if (self.processScroll  && $(window).scrollTop() > $(document).height() - $(window).height() - 130) {
					
					// if( d.attr("more") != "false" && $(window).scrollTop() + $(window).height() > $('.' + key).height() - 100)
					if( d.attr("more") != "false" && $(window).scrollTop() + $(window).height() > $('.' + key).height() - 100)
					{ 
						if(d.attr("loadingmore") == "true") return;
						if(self.datastore.minIndex[cfg.stream] <= 0) return;
						self.datastore.requestMoreMessages( cfg.stream, Math.random() + "", self.datastore.minIndex[cfg.stream] - 1, 48, self.processMoreMessagesForList, frm );
						d.attr("loadingmore", true);
					}
				};
				
				$(window).scroll(theScrollFunc);
				$(window).bind('load-more-list', theScrollFunc);
				
				var data = {'cfg':cfg,'d':d,'frm':frm};
				self.moreForIDevice.push(data);

			}

    	});
    	
       if( this.config.SHOW_VIDEO_ON_START == true )
        {
          setTimeout(
              function()
              {
                $('#videoBtn').click();
              }, 1000);      
        }
        
        if($('#moreForIDevice').length > 0) { 
			$('#moreForIDevice').on('click', function(){
				$.each(self.moreForIDevice, function(k,obj){					
					if(obj.d.attr("loadingmore") == "true") return;
					if(self.datastore.minIndex[obj.cfg.stream] <= 0) return;	
					//$('#moreForIDevice').hide();
					if($('#loadingMoreForIDevice').length > 0) { 
                    	$('#loadingMoreForIDevice').show();
					}
					if($('#loadingMoreForIDeviceText').length > 0) { 
						$('#loadingMoreForIDeviceText').hide();
					}
					self.datastore.requestMoreMessages( obj.cfg.stream, Math.random() + "", self.datastore.minIndex[obj.cfg.stream] - 1, 16, self.processMoreMessagesForList, obj.frm );
					obj.d.attr("loadingmore", true);
				});
			})
		}
    	
    	
    	$(window).trigger('framesBuild');
    	
    },
    
    buildFramesOld: function(framecfg) {

    	var self = this;
    	$.each(framecfg, function(key, cfg) {
    		var raster = self.screen[cfg.raster];
    		var position = raster.positions[cfg.position];
    		var size = raster.sizes[cfg.size];
    		
    		if(!size)
    		{
    			//
    		}
    		
    		var d = $(document.createElement("div")); 
    		d.attr("id", "frame_" + key);
    		d.attr("type", cfg.type); 
    		
    		var fucktor = 1;
    		if( self.config.IS_EDITOR )
        	{ 
          		var fucktor = 1/3.5;
        	}
			
			switch (typeof size.height){
				case "string":
					d.css("height", size.height * fucktor);  
					break;
				default:
					d.css("height", size.height * fucktor);  
					break
			}
			switch (typeof size.width){
				case "string":
					d.css("width", size.width * fucktor);  
					break;
				default:
					d.css("width", size.width * fucktor);  
					break
			}
			
			if(cfg.type == "list" && !self.config.IS_EDITOR )
			{
				d.css("width",  raster.width);
				d.css("height", "auto");         
			}
			
			
			switch (typeof position.x){
				case "string":
					d.css("left", position.x * fucktor);  
					break;
				default:
					d.css("left", position.x * fucktor);  
					break
			}
			switch (typeof position.y){
				case "string":
					d.css("top", position.y * fucktor);  
					break;
				default:
					d.css("top", position.y * fucktor);  
					break
			}
			
			if( !self.config.IS_EDITOR ) d.css("background-color", cfg.color);
			d.addClass("frame " + key);   
			if(self.config.NO_COMMENT) d.addClass("nocomment");
			
			if(cfg.type == "float")
			{
			  d.css("float", "left");
			  d.css("position",'static');
			}
		
			var frm = {
				name: key,
				raster: raster,
				position: position,
				size: size,
				size_name: cfg.size,
				style: cfg.style,
				type: cfg.type,
				stream: cfg.stream,
				animationIn: cfg.animationIn,
				animationOut: cfg.animationOut,
				div: d
			};
			self.frames[key] = frm;
			raster.div.append(d);

			// set up streams_frames
			// zuerst mal auf den frame setzen:
			var fkey = key;
			if( cfg.stream ) // wenn wir einen stream aus der config haben, den nutzen:
			{
				fkey = cfg.stream;
			} 
			
			if( !self.streams_frames[fkey] )
			{
				self.streams_frames[fkey] = [];
			}
			self.streams_frames[fkey].push(frm);
			
    	});
    	
    	if( this.config.IS_EDITOR ) {
				//this.the3rdeditor = new ThirdEditor();
				//this.the3rdeditor.frames = this.frames;
		}
						
       if( this.config.SHOW_VIDEO_ON_START == true )
        {
          setTimeout(
              function()
              {
                $('#videoBtn').click();
              }, 1000);      
        }
    	
    	$(window).trigger('framesBuild');
    	
    },
    
    
  fillSetupData: function(data) 
  {
    
    if(data == undefined) return;
    
    var self = this;
    $.each(data, function(idx, envelope) {
       self.postEnvelope(envelope);
    });
    
  },
  

  modifyLayout: function(frame, envelope) {
  	// unimplemented Function can be 
  	// replaced by client-specific code.
  },
	
  generateHTMLBox: function(envelope, lazy) 
  {    
	//console.log("generateHTMLBox", envelope);
  	var self = this;
    var frame = this.streams_frames[envelope.stream][0];
        
    if ( frame.size_name == "message" ||  frame.size_name == "tetris" || frame.type == "list") {

    	// MAO if(this.screen[envelope.stream]) 
    	if(this.screen[frame.raster.name]) 
    	{
      		if(envelope.message) {
	      		envelope['framesize'] = this.screen[frame.raster.name].sizes[envelope.message.size];
    		}
    	}
    } else {
    	envelope['framesize'] = null;
    }
    if( frame == undefined ) {
    	return;
    } 

    if( envelope.message == undefined ) {
      return;
    } 

    this.modifyLayout(frame, envelope);

  	var fname = "layout_" + envelope.message.size + "_" + envelope.message.layout;
  	var loFunc  = this.layouts[ fname ];
    if( loFunc == undefined ) {
      this.log("Layout undefined: " + fname);
      return;
    }
   
    var d;
    if ( loFunc ) {

		// this is a hack
		// ich muss das lazy-flag irgendwie nach unten durchreichen
		envelope.lazy = lazy;
		
		d = loFunc(frame, envelope, this);    
		// no d - no fun
		if(typeof d === "undefined") return d;

    	
    	if(frame.type == "list" && envelope.message.layout != "chat")
    	{    		
    	
    		var sc = null;
			sc = $(document.createElement("div"));
			sc.addClass("cptr listCommentCount");
			
			// als id IMMER den envelope-id nutzen!
			
			if(ThirdScreenConfig.NO_COMMENT) {
				sc.removeClass("cptr");
			}
			
			$(sc).bind('click', function(){
				if(ThirdScreenConfig.NO_COMMENT) {
					return;
				}
				
				if(typeof getPixel === 'function' && getPixel != undefined)
				{
					getPixel('comments');
				}
								
				if( self.openComment && $(this) != self.openComment) {
					self.openComment.children('.flypicon').text("o");
				}
				
				if($(sc).attr("clicked") == "true") {
				
					$('.listCommentCount').attr("clicked", "false");
					$('#eLCommentsContainer').parent().slideUp(function(){
						console.log("klaus",$(this));
						$(sc).children('.flypicon').text("o");
						$(sc).attr("clicked","false");
						//$(this).detach();
					});
					return;
				
				}
								
				self.openComment = $(this);
				
				$('.listCommentCount').attr("clicked", "false");
				$(sc).attr("clicked","true");

				$(sc).children('.flypicon').text("c");

				$('.eLCommentsContainerClose').remove();
				
				if( d.attr('comkey') ) {
					self.datastore.requestInitialComments( d.attr('comkey'), d.attr('commit'),  self.displayCommentsInList, d.attr('id') );
				} else {
					//console.log(envelope);
					
					var c = $("#listCommentsContainer_" + envelope.stream);
					
					if(c.length == 0) {
						c = $(document.createElement('div'));
						c.attr("id", "listCommentsContainer_" + envelope.stream);
						c.addClass("cptr listCommentsContainer listCommentsContainer_" + envelope.stream);
					} else {
						c.show();
					}					
					
		  			$('#eLCommentsContainer #messages').html( ThirdScreenConfig.NO_COMMENTS_MESSAGE);
		  			// mid auf dem form setzen:
					$("#messageCommentForm").attr("mid", d.attr("mid"));
					$('#eLCommentsContainer #messages').css("border-top", "1px solid " + d.css("background-color"));
					
					var shadedColor = self.getShadeColor(d);
					
					$("#eLCommentsFormContainer").css("background-color", shadedColor);
					$("#eLCommentsFormContainer").css("border-bottom", "1px solid black"); // + d.css("background-color"));
					
					var cc = $("#eLCommentsContainer").detach();
					
					cc.css("background-color", shadedColor);
					cc.css("color", d.css("color"));
					
					cc.hide();
					
					var close = $(document.createElement('div'));
					close.css("background-color", d.css("background-color"));
					close.addClass("eLCommentsContainerClose");
					
					var s3 = $(document.createElement('span'));
					s3.addClass("flypicon cptr");
					s3.text("c");
					s3.css("color", d.css("color"));
					s3.bind('click', function() {
						//console.log("c");
						if(typeof getPixel === 'function' && getPixel != undefined)
						{
							getPixel('comments');
						}
						$('.listCommentCount').attr("clicked", "false");
						
						$(cc).slideUp(function(){
							$('.listCommentCount').children('.flypicon').text("o");
							close.remove();
						});
			
					});
					close.append(s3);
					cc.append(close);					
					
					c.append(cc);
					d.after(c); //nach der kachel
					cc.slideDown();
				}
				
			});
			
			var plus = $(document.createElement("div"));
			
			if(envelope.message.comments)
			{
				plus.text(envelope.message.comments.count);
				plus.addClass("eLCommentCount");
			}
			else
			{
				plus.text("o");
				plus.addClass("flypicon");
			}
			sc.append(plus);
			d.append(sc);
    	}
    	
    	
		if(envelope.stream == "socialstream" || envelope.stream == "social")
		{
		
			if( frame.type != "list") 
			{
				d.addClass("cptr");
				d.bind('click', function(){
			  		self.openOverlaySocialstream(envelope.commit, envelope.stream);
				});
			}
		}
			
		
		//if(envelope.stream != "chat" && envelope.stream != "banner" && envelope.stream != "socialstream" && envelope.message.layout != "iframe") {
		if(envelope.stream != "chat" && envelope.stream != "banner" && envelope.message.layout != "iframe") {
			
			if( !ThirdScreenConfig.NO_COMMENT ) d.children('.theComment').attr("title", ThirdScreenConfig.DEFAULT_CHAT_TEXT);
			if (envelope.stream == "social") {
				d.children('.theComment').attr("title", "Die 300 letzten Einträge anzeigen");
				//d.children('.theComment').bind('click', function() {
			  	//	self.openOverlaySocialstream(d);
				//});
			} else {
				d.children('.theComment').bind('click', function() {
				  self.openOverlay(d);
				});
			}		
		
			if( envelope.message.comments !== undefined && !ThirdScreenConfig.NO_COMMENT ) 
			{
			  var cc =  envelope.message.comments.count; // Math.floor((Math.random()*200)+1);
			  if( cc > 0 ) {
				var commentCounter = $(d).children().first();
				commentCounter.removeClass("nocomment");
				commentCounter.addClass("commentcount");
				commentCounter.css("display", "inline-block");
				commentCounter.text(cc);
				var descr = (cc > 1) ? " Kommentare": " Kommentar";
				commentCounter.attr("title", cc + descr);
				if(cc > 99){
				  commentCounter.addClass('comment-small');
				}
				if(cc < 10){
				  commentCounter.addClass('comment-big');
				}
			  }  
			} 
		}
		
		
		
    } else {      
    }
	d.attr("eid","e"+envelope.id);
    return d;
  },

	displayCommentsInList: function(envelopes, elemid)
	{
		var self = this;		
		var par = $( "#" + elemid );
		
		if( envelopes && envelopes.updates )
		{
			var commStrm = this.commentStreams[envelopes.updates[0].stream]; // der aktuelle stream
		}
		
		if( !commStrm && envelopes && envelopes.updates && envelopes.updates[0].stream )
		{
			this.commentStreams[envelopes.updates[0].stream] = {};
			this.commentStreams[envelopes.updates[0].stream].idx = -1;
			commStrm = this.commentStreams[envelopes.updates[0].stream];
		}		
		
		// farbe der hintergrundbox dynamisch setzen
		var shadedColor = this.getShadeColor(par);
				
		if(envelopes) this.comKeys.push(envelopes.updates[0].stream); // ist der comkey
		
		var d;
		var loFunc  = this.layouts[ 'layout_elcomment' ];
			
		
		// mid auf dem form setzen:
		$("#messageCommentForm").attr("mid", par.attr("mid"));	
		$("#messageCommentForm #input").val(ThirdScreenConfig.DEFAULT_CHAT_TEXT);		
				
		var cc = $("#eLCommentsContainer").detach();
		cc.css("background-color", shadedColor);		
		cc.show();
		
		$('.eLCommentsFormContainer').css("border-bottom", "1px solid black"); // + par.css("background-color"));
		$('.eLCommentsFormContainer').show(); 
		
		var messages = cc.find('#messages');
		messages.empty();
		
		var c = $('#' + envelopes.updates[0].stream);
		if( c.length == 0) {
			var c = $(document.createElement('div'));
			c.addClass("cptr listCommentsContainer listCommentsContainer_" + envelopes.updates[0].stream);
			c.attr("commit",  envelopes.updates[0].stream);
			c.attr("id",  envelopes.updates[0].stream);
		}
			
		for ( var i in envelopes.updates ) {
			if(commStrm.idx == -1 || commStrm.idx > envelopes.updates[i].index) {
				commStrm.idx = envelopes.updates[i].index;
			}
			d = loFunc(null, envelopes.updates[i], self);
			d.css("border-bottom","1px solid " + par.css("background-color"));
			d.css("color", par.css("color"));
			c.append(d);
			
			messages.append(d);
		}		
		
		c.append( cc );
			
		close = self.addCommentsNavigation(envelopes.updates[0].stream,commStrm, par, c);
		
		c.append(close);
		c.css("background-color", shadedColor);
		c.css("margin-bottom", "4px");
		if(!envelopes.more){
			$('.moreCommentsToggle', c).hide();
		}
		c.hide();
		par.after(c);
		c.slideDown();
					
	},

  postEnvelope: function(envelope) 
  {
	
  	var self = this;
	
    // kein envelope - kein html
    if( envelope == undefined ) return;

    // geloeschte daten - kein html
    if( envelope.action && envelope.action == "delete" ) return;

 	// FIXME: Sollte initial chat sein, und nicht chatframe...
 	if(envelope.stream == "chatframe") envelope.stream = "chat";
 	
 	if(this.streams_frames[envelope.stream])
 	{
		$.each(this.streams_frames[envelope.stream], function(key, frame) {
			if( frame == undefined ) {
			  return;
			} 
			var d = self.generateHTMLBox(envelope, false);
			self.prepareFrame(frame, d, this.fillFrame);
			//console.log("postEnvelope: Frame: " + envelope.stream); // war .frame
		});
 	} else {
 		// check for slideshows
 		var show = this.getSlideshowByStream(envelope.stream);
 		if( show != null ){
 			show.addSlide(envelope);
 		}
 	}    
  },


  prepareFrame: function(frame, elem, cback)
  {
    var self = this;    

    var f = function()
    {
      self.fillFrame(frame, elem);

    }
    if(frame.type == "single") {
      if( frame.div.children().length > 0 )
      {
        var tile 	= frame.div.children().first(); 
        tile.animate( { top: '+=' + frame.div.children().first().height() }, 
  				1000, 
  				function()
  				{
  				  frame.div.empty();
  				  f();
  			  });
		  } 
		  else
		  {		    
		    f();
		  }
    }
    
    else if(frame.type == "float") {
      var fr = $("#frame_" + frame.name);
      var pare = fr.parent();
      
      var h = fr.height();
      fr.animate({"height": 0 },
        400,
        function() {
          fr.detach();
          pare.prepend(fr);
          frame.div.empty();
          f();
          fr.animate({"height": h},600);
        })
            
    }
    
    else if(frame.type == "tetris")
    {      
      self.notInTetris.push(elem);
      self.fillTetris();
    }
    
    else if(frame.type == "list")
    {
    	
    	if(!elem) return;
    	
      	self.autocolor(elem);
      	
      	var tct = elem.find(".tilecontent");
      	if(!tct.text()) {
      		tct.css("display", "none");
      	}
      
      	elem.css("display", "none");
      	var elem_width = $("#frame_" + frame.name).width();
      
      	var xHeight = elem.attr("xheight") ? elem.attr("xheight") + "px" : "auto";
      	
      	if(elem.attr("layout").indexOf("video") != -1)
      	{
      		
      		var h = elem_width / (16/9);
      		if( elem.find('iframe.16x19').length > 0){
      			h = elem_width / (16/19);
      		} else if( elem.find('iframe.1x1').length > 0){
      			h = elem_width;
      		}
      		elem.find('img').css('min-height', h+'px');
			elem.css("display", "none");

			$("#frame_" + frame.name).prepend(elem);
			$("#frame_" + frame.name).trigger('messageAppended', elem);

			elem.find('iframe').attr({'width': elem_width, 'height':h});
			elem.css("height",0);
			elem.css("display", "block");
			elem.animate( { "height": h }, 400, function(){
				$(this).css("height", "auto");
				var playBtn = $(this).find('.playVideoKachelContainer.startVideo');
				var playHeight = $(this).find('.guillotine-window').length > 0 ? $(this).find('.guillotine-window').outerHeight() : $(this).find('img.startVideo.img').height();
				playBtn.css('top', playHeight / 2);
			}); 
			
      	}

      	else if(elem.attr("layout").indexOf("image") != -1)
      	{			
      		
			// schonmal einhängen, damit die reihenfolge stimmt
			elem.css("display", "none");
			$("#frame_" + frame.name).prepend(elem); 
			$("#frame_" + frame.name).trigger('messageAppended', elem);
			theImage = new Image();
      		theImage.src = elem.attr("mediaurl");
      		theImage.onload = function() {

				var fucktor = (this.width / this.height);
				
            	xHeight = Math.floor(this.height * elem_width / this.width);
            	
				elem.css("height", xHeight);
			
				var h = elem.height();
				elem.css("height",0);
				elem.css("display", "block");
				elem.animate( { "height": h }, 400, function(){					
					$(this).css("height", "auto");
				} );				
			}
			
			
      } else {
      		elem.css("height", "auto");
			// animation
			elem.css("display", "none");
			$("#frame_" + frame.name).prepend(elem); 
			$("#frame_" + frame.name).trigger('messageAppended', elem);
				
			var h = elem.height();
			elem.css("height",0);
			elem.css("display", "block");
			elem.animate( { "height": h }, 400, function(){
				$(this).css("height", "auto");
			}); 
	
      	}
      	
      	/*
      	var h = elem.height();
		elem.css("height",0);
		elem.css("display", "inline-block");
		elem.animate( { "height": h }, 400, function(){
			$(this).css("height", "auto");
		}); 
      	*/
    }
  },


  fillFrame: function(frame, d)
  {
    if(d && d != undefined)
    {
      	var self = this;
      	// ohne berechnung und shorten:
      	//d.hide().appendTo(frame.div).delay(100).fadeIn(800); // .delay(1000)
      
      	// mit berechnung und shorten:
	    d.css("visibility", "hidden");
      
      	d.appendTo(frame.div);
      	$(frame.div).trigger('messageAppended', d);
      

		self.shortenTextNew(d, self.fadeInShortendedText); 
	  
    }
  },

	calculateTextBoxHeight: function( d ) {
		var tx = d.find(".text");
		var txTop = 0;
		if(tx.position()) txTop = tx.position().top;
		
		var inf = d.find(".info").length > 0 ? d.find(".info") : d.find(".link");
		var infOuter = 0;
		var outerHeight = 0;
		if( inf.outerHeight(true) != null ) infOuter = inf.outerHeight(true);
      	
		if( d.attr("layout") == "postcard_text") {
      		dHeight = d.height();
      		outerHeight = infOuter; 
      	} else if (d.attr("layout") == "image") {
      		dHeight = d.height();
      		outerHeight = d.find(".text").height();    		
      	} else {
      		dHeight = d.height() - txTop - infOuter;
      		outerHeight = tx.outerHeight();
      	}
		return {outerHeight: outerHeight, dHeight:dHeight};
	},
	
	
  shortenText: function(d, cback) // braucht nen callback
  {

  	//deprecated, use shortenTextNew!
  	console.log("you must use shortenTextNew!");
  	return;
  	
    var tx = d.find(".text");
    if(tx)
    {      
        
      var inf = d.find(".info");
      var infOuter = 0;
      var txTop = 0;
      if( inf.outerHeight(true) != null ) 
      {
        infOuter = inf.outerHeight(true);
      }
      if(tx.position())
      {
        txTop = tx.position().top
      }
      var dHeight = d.height() - txTop - infOuter;
      
      if(d.attr("id") == "esocial_frame")
      {
    
      }
      
      if( tx.outerHeight() > dHeight)
      {
      	
        this.appendix = "...";
        
        var tArr = tx.html().split(" ");  
        var tmphtml = tx.html();
        var tmptx;
        //var tmpstrip = tmphtml.length;  
        while(tx.outerHeight() > dHeight)
        {
        	
          tmptx = tArr.pop();
          if(tmptx == "" ) continue;
          if(!tmptx) {
          	break;
          }
          tx.html( tArr.join(' ') + "...");
          //tmpstrip -= tmptx.length - 1; 
        }

      }
        if(cback)
        {
          cback(d);        
        }
        else
        {
          //this.slideDownShortendedText(d);
        }
        /*
        d.hide();
        d.css("visibility", "visible");
        d.fadeIn(800);
        */
        this.appendix = "";
        
      
    }
    
  },


  	shortenTextNew: function(d, cback) // braucht nen callback
  	{
  		var tx = d.find(".text");
    	if(tx)
    	{    
    		var siz = this.calculateTextBoxHeight(d);
      		if(siz['outerHeight'] > siz['dHeight'])
      		{
      			this.appendix = "...";
				var tmphtml = String(tx.html());
				
				if (tmphtml == "null") tmphtml = ""; 
				tmphtml = tmphtml.substring(0,500).substring(0, tmphtml.lastIndexOf(" ")); // auf 500 Zeichen beschränken
				var tArr = tmphtml.split(" ");  
				
				tx.html("");
				var tmptx;
				var nArr = [];

				while( this.calculateTextBoxHeight(d)['outerHeight'] < this.calculateTextBoxHeight(d)['dHeight'] )
				{
					// vorher: rueckwärts: tmptx = tArr.pop();
			  		// jetzt: vorwärts, schneller...
			  		tmptx = tArr.shift();
			  		if(tmptx == "" ) continue;
			  		if(!tmptx) {
						break;
			  		}
			  		nArr.push(tmptx);
			  		tx.html( nArr.join(' ') + "...");
				}
      		} else {
      			//console.log("nada");
      		}
        	if(cback) cback(d);      
        	this.appendix = "";
    	}
    
	},


  fadeInShortendedText: function(d) 
  {
    d.hide();
    d.css("visibility", "visible");
    d.fadeIn(800);
  },

  slideDownShortendedText: function(d) 
  {
    d.hide();
    //d.css("visibility", "visible");
    d.fadeIn(800);
    
  },

  	shortenText2: function(tx, dHeight, tArr)
  	{
    tArr.pop();
    tx.text(tArr.join(" ") + this.appendix);
    while(tx.outerHeight() > dHeight)
    {
      this.shortenText2(tx, dHeight, tArr);              
    }
  },

  	fillTetrisInitial: function(envelope)
  	{

		var self = this;
		if(this.streams_frames[envelope.stream] == undefined) return

		$.each(this.streams_frames[envelope.stream], function(key, frame) {
			if( frame == undefined ) {
			  return;
			} 
			var d = self.generateHTMLBox(envelope, true);			
			self.prepareFrame(frame,d);
		});
	},

  	fillTetrisMore: function(envelope)
  	{
		var self = this;
		$.each(this.streams_frames[envelope.stream], function(key, frame) {
			if( frame == undefined ) {
			  return;
			} 
						
			var d = self.generateHTMLBox(envelope, true);
			//self.prepareFrame(frame,d); // jo works, aber findet "shortest" nicht mehr

			self.notInTetris.push(d);
			var reverse = true;
    		self.fillTetris(true);

		});	
  },

	fillMain: function(frame, elem) 
	{
	  if(elem) {
					
	    elem.hide().appendTo(frame.div).delay(1000).fadeIn(800);
	  }
	},
    
	fillTetris: function(reverse) 
	{
		
	  	if(reverse == null) reverse = false;
	  	var self = this;
	  
		for( var i = self.notInTetris.length; i > 0; i--) {

			var tile = this.notInTetris.pop();

      		if( tile == undefined) {
        		return;
      		}
			
			// FIXME: wenn video in einer double kachel steckt, geht beim einlaufen ins tetris
			// height 100% nicht. daher als fix auf base-größe gesetzt.
			if(tile.attr('layout') == 'video' && tile.attr("size_name") == 'double')
			{
				tile.css('height', 180);
			}
			
			// automatische rotation der farben, nach dem event, damit tetris gut aussieht...
			self.autocolor(tile);
			
			if(ThirdScreenConfig.TETRIS_ANIMATION == "masonry")
			{
  				self.container.append(tile).masonry( 'appended', tile );			  
			} 
			
			else 
			{
				//var shortest = s3_shortest_list(ThirdScreenConfig.TETRIS_ROWS);
				var shortest = self.nextRow();
				var h = tile.height();  	
					
				tile.css("top", "0");
				if(reverse) {
				  tile.css({opacity: 0.0, visibility: "visible"});
				  
				  shortest.append(tile);
				  self.shortenTextNew(tile);
				  tile.fadeTo('slow', 1);
				  self.recutImage(tile);
				 
				} else {

					tile.hide();
					shortest.prepend(tile);
					
					//console.log("fillTetris 1");
					
					if($('.image', tile).length > 0 ){
						
						$('div.image', tile).on('imageLoaded.nolist', function(){
							tile.slideDown(800, function(){
								self.shortenTextNew(tile, null);
							});
						});

						$('div.image', tile).trigger('loadimage');
					} else {
						tile.slideDown(800, function(){
						  	self.shortenTextNew(tile, null);
						  });
					}

				}
  			
				var f = function()
				{
					if(self.tempCount == 0)
					{
						self.shortenTextNew(tile);
						self.tempCount = 1;
					}
				}
			}
		}
	},
	
	nextRow: function(){
		if(!this.currentRow) this.currentRow = 0;
  		if(this.currentRow >= ThirdScreenConfig.TETRIS_ROWS) {
  			this.currentRow = 1;
  		} else {
  			this.currentRow++;
  		}  		
  		return  $("#tetris_row" + this.currentRow);

	},
	
	recutImage: function(tile) {
		var imgValues = tile.data('cuttingValues');
		if(imgValues){
			imgValues['container_width'] = tile.width();
			imgValues['container_height'] = tile.height();
			var cssCalc = calcImageProperties(imgValues);
			$('div.image', tile).animate(cssCalc, 300);
		}
	},

	autocolor: function(tile) {
		var self = this;
		
		if(ThirdScreenConfig.AUTOCOLOR && tile)
		{
		
			var cls = tile.attr("class");
			
			// s1..s8 + plain rauswerfen
			var sclasses = cls.match(/\b(s[0-9])\b|\bplain\b/g);
			for(var sc in sclasses){
				tile.removeClass(sclasses[sc])
			}
			// autocolor style einsetzen wenn vorher was runtergenommen wurde
			if(sclasses && sclasses.length > 0){
				tile.addClass("s" + self.styleCount);
				self.styleCount += 1;
				if(self.styleCount > 8) self.styleCount = 1;	
			}
		}
	},
	
	addCommentsToMessage: function(envelopes) {
		var self = this;
		msgDiv = $('[comkey="' + envelopes.stream + '"]');
		commentsDiv = $('.listCommentsContainer_' + envelopes.stream + " #eLCommentsContainer #messages"); 
		
		var commStrm = this.commentStreams[envelopes.stream];
		if(!commStrm) // sollte hier nicht passieren...
		{
			this.commentStreams[envelopes.stream] = {};
			this.commentStreams[envelopes.stream].idx = -1;
			commStrm = this.commentStreams[envelopes.stream];
		}		
	
		var loFunc  = this.layouts[ 'layout_elcomment' ];
		
		var c = $(document.createElement('div'));
		c.css("padding","0");
		c.css("border", "0");
		c.hide();
		for ( var i in envelopes.items ) {
			if(commStrm.idx == -1 || commStrm.idx > envelopes.items[i].index) {
				commStrm.idx = envelopes.items[i].index;
			}
			d = loFunc(null, envelopes.items[i], self);
			
			d.css("border-bottom","1px solid " + msgDiv.css("background-color"));
			d.css("color", msgDiv.css("color"));
			c.append(d);
		}
		
		commentsDiv.append(c);
		c.slideDown();
	},



	addCommentsNavigation: function(msgStream,commStrm,par, c){
		var self = this;		
		var color, bgcolor;
		bgcolor = par.css("background-color");
		color = par.css("color");
		if(!bgcolor) color = "#777777";
		if(!color) color = "#777777";
	
		var close = $(document.createElement('div'));
		close.css("background-color", bgcolor);
		close.addClass("eLCommentsContainerClose");
	
		var s1 = $(document.createElement('span'));
		s1.addClass("flypicon");
		s1.text("o");
		s1.addClass('moreCommentsToggle');
		s1.css("color", color);	
		s1.bind('click', function() {
			if(commStrm.idx > 0)
			{
				self.datastore.requestMoreComments(msgStream, par.attr('comkey'), commStrm.idx - 1, self.numberOfComments, self.addCommentsToMessage); // stream, commitcode, pos, length, cback
			}
		});	
		close.append(s1);	
		
		var s2 = $(document.createElement('span'));
		s2.text("weitere Kommentare");
		s2.css("color", color);
		s2.addClass('moreCommentsToggle');
		s2.bind('click', function() {
			if(commStrm.idx > 0)
			{
				self.datastore.requestMoreComments(msgStream, par.attr('comkey'), commStrm.idx - 1, self.numberOfComments, self.addCommentsToMessage); // stream, commitcode, pos, length, cback
			}
		});
		close.append(s2);
		
		var s3 = $(document.createElement('span'));
		s3.addClass("flypicon");
		s3.text("c");
		s3.css("color", color);
		s3.bind('click', function() {
			$('.listCommentCount').attr("clicked", "false");
			/*
			$('html, body').animate({
        		scrollTop: par.offset().top
    		}, 250, function(){
    			$(c).slideUp(function(){
    			//$(this).parent().slideUp(function(){
					var idx = self.comKeys.indexOf(msgStream);
					commStrm.idx = -1;
					self.comKeys.splice(idx,1);
				});
    		});
			*/
			$(c).slideUp(function(){
				var idx = self.comKeys.indexOf(msgStream);
				commStrm.idx = -1;
				self.comKeys.splice(idx,1);
			});
		});
		close.append(s3);	
		
		return close;
		
	},

	displayMoreComments: function(json) {
	},

	shadeColor: function(color, percent) {   
    	var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    	return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
	},
	
	
	getLightness: function(hex) {
		// returns brightness value from 0 to 255
		// strip off any leading #
		var cHex = hex.replace(/#/, '');
		var R = parseInt(cHex.substring(0,2),16) ;
		var G = parseInt(cHex.substring(2,4),16) ;
		var B = parseInt(cHex.substring(4,6),16) ;
		return parseInt((R * 299 + G * 587 + B * 114) / 1000);
		
	},
	
	getShadeColor: function(elem) {
		var bgcol;
		
		if(elem == undefined) 
		{
			bgcol = "#777777";
		} else {
			bgcol = elem.css("background-color");
		}
		
		var lightness = this.getLightness(bgcol);
		var shadePercent = this.shadePercentLighter;
		if(lightness > 180)
		{
			shadePercent = this.shadePercentDarker;
		}
		return this.shadeColor(bgcol, shadePercent);
	},
	

	displayComments: function(envelopes) 
	{
	  	var self = this;
  		var loFunc  = this.layouts[ 'layout_comment' ];
		var d;
		
		$('#overlayCommentsContainer #messages').empty();
		for ( var i in envelopes.updates ) {	
			d = loFunc(null, envelopes.updates[i], self);
			$('#overlayCommentsContainer #messages').append(d);
		}
	},
	
	openOverlay: function ( elem ) 
	{

		var self = this;			
		// eingabe ggf. abschalten
		if( ThirdScreenConfig.NO_COMMENT ) {
			$('#overlayCommentsContainer').hide();
			$('#overlayCommentsContainer').css("margin",0);
		} else {
			$('#overlayCommentsContainer').css( {"minHeight":0});
			$('#overlayCommentsContainer').show();
			$('.overlayCommentsFormContainer').show(); 	
			$('#messageCommentForm').attr("mid",elem.attr("mid"));
		}		
		
		var data = elem.data("envelope");

		
		if( elem.attr('comkey') ) {
  			this.datastore.requestInitialComments( elem.attr('comkey'), elem.attr('commit'),  this.displayComments );	  
		} else {
		  	$('#overlayCommentsContainer #messages').empty().html( ThirdScreenConfig.DEFAULT_OVERLAY_TEXT);
		}

		var lay = data.message.layout;
		var msgLayout = data.message.layout;
		
		function isPoll(){
			return $.inArray(data.message.layout, ['poll', 'pollresult']);
		}
		
		/* FIXME: Warum hier 2 vars? (lay und msgLayout) */
		if(lay === 'teaser') 
		{
			lay = (data.message.media && data.message.media.url != "") ? 'postcard_text' : 'text';
		}
				
		if(msgLayout === 'teaser') 
		{
			msgLayout = (data.message.media && data.message.media.url != "") ? 'postcard_text' : 'text';
		}
		
		var newFrame = {};
		newFrame.size = {};
		newFrame.size.height = 'auto';
		newFrame.size.width = '320px';
		
		newFrame.type = 'list';

		
	  	var fname = "layout_" + data.message.size + "_" + lay;
	  	var loFunc = this.layouts[ fname ];
	  	var newTile;
	  	if(loFunc) {
	  		if(data.message.layout !== 'slideshow') newTile = loFunc(newFrame, data, self);
	  	} else {
	  		return;
	  	}
	  		  	
	  	// ------------------------------------------------------ //
	  	
	  	// im overlay wird immer als liste gerendert
		$('#light').attr("type","list");
		$('#overlayMessage').removeClass();
		$('#overlayMessage').addClass(elem.attr('class'));
		if(lay) {
			$('#overlayMessage').addClass(lay);
			$('#overlayMessage').attr("layout", lay);
		}
		$('#overlayMessage').css('height', 'auto');
		
		
		//video
		if(data.message.media && data.message.media.url != '' && data.message.layout == "video"){
		
			var newVideoFrame = {};
			newVideoFrame.size = {};
			newVideoFrame.size.height = $('#lightBorder').width() / (16/9);
			newVideoFrame.size.width = $('#lightBorder').width();
			newVideoFrame.type = 'overlay';

			var videoData = data;
			delete videoData.framesize;

			var fname2 = "layout_" + data.message.size + "_video";
			var loFunc2  = this.layouts[ fname2 ];
			if(loFunc2) {
			
				newTile = loFunc2(newVideoFrame, data, self);
				newTile.find('.videoframe').attr("width", newTile.css("width"));
	            newTile.find('.videoframe').attr("height", newTile.css("height"));
				newTile.find('.startVideo.img').css("width", newTile.css("width"));
	            newTile.find('.startVideo.img').css("height", newTile.css("height"));
	            newTile.find('.playVideoKachelContainer').css("top", parseInt(newTile.css("height")) / 2);
	            newTile.css("height","auto");
				
			}

		} 
		
		// slideshow
		if( data.message.layout == "slideshow"){
			
			var max = $('#lightBorder').width();
			

			var show = elem.data('slideshow');
			var frame = show.frame;
			var envelope = show.envelope;
			// FIXME 
			// sollte eigentlich:
			// var w =  frame.size.width;
			// var h =  frame.size.height;
			// aber momentan besser so, da sonst wg scaling in liste #+*grmpf!$%.
			var w = frame.raster.sizes['base'].width;
			var h = frame.raster.sizes['base'].height; //frame.size.height;
		
			var scale = {width:max, height: max}; 
			var paddingX = 40;
			var paddingY = 30;

			var factor;
			if(w > h){
				// querkant
				factor = w / h;
				scale = {width: max, height: max / factor};
			} else {
				// hochkant
				factor = h / w;
				scale = {width: max , height: max * factor };
			}
			
			//$("#lightBorder").width(scale.width);
			
			for(var i in frame.raster.sizes){
				frame.raster.sizes[i] = scale;
			}

			if(loFunc) {
		  		newTile = loFunc(frame, envelope, self);
		  	}

			newTile.width(scale.width);
			newTile.height(scale.height);
 		
		}


		
		this.removeOverlayChildren();
		
		// zum nachher wieder wegnehmen
		newTile.addClass("remove");
		// soll die selben klassen wie im tetris haben
		newTile.removeClass("plain s1 s2 s3 s4 s5 s6 s7 s8");
		newTile.addClass(elem.attr("class"));

		$('#lightBorder').prepend(newTile);
		
		var xxx = ce("div");
		xxx.addClass("listCommentCount");
		newTile.append(xxx);
		
		$('#overlayImageContainer').hide();
		$('#overlaySlideshowContainer').hide();
		$('#overlaySocialstreamContainer').remove();
		

		// Containermessage
		if(typeof data.message.substream != 'undefined' && data.message.layout != "slideshow"){
			// containermessage found
			// load substream via rio - building of messages is triggered in this.storeSubstreamEnvelopes()
			this.datastore.protocol.requestInitial(data.message.substream.key, null, null, this.storeSubstreamEnvelopes, null, this.errorOnLoadingSubstream);
		}
	  	
		
		// ab hier egal ob NO_COMMENT oder nicht...
		// Korrektur für skalierung
		var cscale = document.querySelector('body').getBoundingClientRect().height / document.querySelector('body').offsetHeight;
		if (!cscale) cscale = 1;
		
		$('#light').css("height", "auto");
		$('#light').css("position", "absolute");
		$('#light').css('left', ($(window).outerWidth() - $('#light').width()) / (cscale * 2));	
		
		$('#wiki').css("height", "auto");
		$('#light').fadeIn(); // <-- der sorgt beim fadeout für den sprung!
		$('#fade').css("display","block");
		$('#fade').fadeIn();
				
		// FIXME:
		$('body').attr("old-background-attachment", $('.ownerbody').css("background-attachment"));
		
		// position as fixed.
		
		if (window == parent || !document.frametop) { // das macht nur Sinn, wenn wir nicht im iFrame laufen
			this.pageScrollTop = $(window.self).scrollTop()	
			var o = $('#screen').offset()
			$('#screen').css('left', o.left + "px");
			$('#screen').css('top', this.pageScrollTop *-1 + "px");
			$('#screen').css('position', 'fixed');
			$(window).scrollTop(0);
			$('body').css("background-attachment", "fixed");
			$('body').css("background-position", "0px " + this.pageScrollTop *-1 + "px");
		} else {
			// document.frametop s.u. "postmessage" (jo)
			if (document.frametop) $('#light').css("top", Math.max(30, document.frametop * -1 /cscale + 30));
		}
		if(typeof getPixel === 'function' && getPixel != undefined)
		{
		  getPixel('overlay');
		}
			
		//$('#fade').fadeIn();	
		
	},

	errorOnLoadingSubstream: function(){
		// nothing....
	},

	storeSubstreamEnvelopes: function(json)
	{
		var self = this;
		
		// register new loaded messages in datastore
		$.each(json.updates, function() {
			self.datastore.registerEnvelope(this);
		});

		this.showOverlaySubstream(json.updates);

	},

	showOverlaySubstream: function(envArray)
	{
		var self = this;
		var newFrame = {};
		newFrame.size = {};
		newFrame.size.height = 'auto';
		newFrame.size.width = '320px';
		newFrame.type = 'list';
		var newTile, loFunc, fname, containerTile;
		containerTile = $('<div/>', {
			id: 'overlaySubstreamMessages',
			'class': 'remove'
		}).insertBefore('#overlayCommentsContainer');
		// render each loaded envelope
		$.each(envArray, function() {
			fname = "layout_" + this.message.size + "_" + this.message.layout;
		  	loFunc = self.layouts[ fname ];
		  	if(loFunc) {
		  		newTile = loFunc(newFrame, this, self);
		  		// zum nachher wieder wegnehmen
				newTile.addClass("remove");
				var xxx = ce("div");
				xxx.addClass("listCommentCount");
				newTile.append(xxx);
		  		newTile.prependTo(containerTile);
		  	} else {
		  		return;
		  	}

		});
	},
  	
  	computeFrameOffset: function(win, dims) {
		// initialize our result variable
		if (typeof dims === 'undefined') {
			var dims = { top: 0, left: 0 };
		}

		// find our <iframe> tag within our parent window
		var frames = win.parent.document.getElementsByTagName('iframe');
		var frame;
		var found = false;

		for (var i=0, len=frames.length; i<len; i++) {
			frame = frames[i];
			if (frame.contentWindow == win) {
				found = true;
				break;
			}
		}

		// add the offset & recur up the frame chain
		if (found) {
			var rect = frame.getBoundingClientRect();
			dims.left += rect.left;
			dims.top += rect.top;
			if (win !== top) {
				this.computeFrameOffset(win.parent, dims);
			}
		}
		return dims;
	},
  	
	openOverlaySocialstream: function(commitcode, stream) 
	{	
  		var self = this;

		self.removeOverlayChildren();

		this.datastore.requestInitialStream( stream, commitcode, this.displaySocialstream );	 
		$('#overlaySocialstreamLoader').show();
		$("#overlayImageContainer").css("display", "none");
		$("#overlaySlideshowContainer").hide();
		
		$('#overlayCommentsContainer').hide();
		$('#overlayCommentsContainer').css("margin",0);

		var cscale = document.querySelector('body').getBoundingClientRect().height / document.querySelector('body').offsetHeight;
		if (!cscale) cscale = 1;
		
		$('#light').css("height", "auto");
		$('#light').css("position", "absolute");
		$('#light').css('left', ($(window).outerWidth() / 2 - $('#light').width() / 2)/cscale );	

		$('#wiki').css("height", "auto");
		$('#light').fadeIn(); // <-- der sorgt beim fadeout für den sprung!
		$('#fade').fadeIn();



		// position as fixed.
		if (window == parent || !document.frametop) { // das macht nur Sinn, wenn wir nicht im iFrame laufen
			this.pageScrollTop = $(window).scrollTop()	
			var o = $('#screen').offset()
			$('#screen').css('left', o.left + "px");
			$('#screen').css('top', this.pageScrollTop *-1 + "px");
			$('#screen').css('position', 'fixed');
			$(window).scrollTop(0)
			$('body').css("background-attachment", "fixed");
			$('body').css("background-position", "0px " + this.pageScrollTop *-1 + "px");
		} else {
			// document.frametop s.u. "postmessage" (jo)
			if (document.frametop) $('#light').css("top", Math.max(30, document.frametop * -1 /cscale + 30));
		}

		if(typeof getPixel === 'function' && getPixel != undefined)
		{
		  getPixel(stream);
		}		
		
	},


	removeOverlayChildren: function() 
	{
		$('#light').find(".remove").each(function(){
			$(this).remove();
		});	
	},
  
  displaySocialstream: function(envelopes) {
  	var self = this;
    //$('#overlayContainer').hide();
    
  	var loFunc  = this.layouts[ 'layout_socialmessage' ];
  	var newSocFrame = {};
	newSocFrame.type = 'list';
	var d;
	$('#overlaySocialstreamContainer').empty();
	$('#overlaySocialstreamLoader').hide();
	for ( var i in envelopes.updates ) {	
		
		var loFunc = ( this.layouts[ "layout_base_" + envelopes.updates[i].message.layout ] );
		d = loFunc(newSocFrame, envelopes.updates[i], self);
		this.autocolor(d);
		d.addClass("remove");
		
		var sc = null;
		var sc = $(document.createElement("div"));
		sc.addClass("cptr listCommentCount");
		d.append(sc);
		$('#lightBorder').append(d);
	}
   
  },

	openOverlayWiki: function ( elem ) {
		$('#wiki').fadeIn();
		$('#fade').fadeIn();
		this.pageScrollTop = $(document).scrollTop()
		var o = $('#screen').offset()
		$('#screen').css('left', o.left + "px");
		$('#screen').css('position', 'fixed');
		$(document).scrollTop(0);
	},

	openLinkOverlay: function ( url ) {
	  $('#iOverlay').attr("src", url);
		$('#wiki').fadeIn();
		$('#fade').fadeIn();
		// position bg as fixed.
		this.pageScrollTop = $(document).scrollTop()
		var o = $('#screen').offset()
		$('#screen').css('left', o.left + "px");
		$('#screen').css('top', this.pageScrollTop *-1 + "px");
		$('#screen').css('position', 'fixed');
		$(document).scrollTop(0);
	},

	closeOverlay: function ( elem ) {		
		$('#overlaySocialstreamContainer').empty();
		$('#lightBorder').removeClass("slideshow");
		$('#lightBorder').css("height", "");
		$('#lightBorder').find('div[layout="video"]').remove();
		$('#lightBorder').find('.remove').remove();
		
		$('#screen').css('left','auto');
		$('#screen').css('margin','auto');
      	$('#screen').css('top', 0);
      	$('#screen').css('position', 'relative');
		$(window).scrollTop( this.pageScrollTop );
		
		$('#light').fadeOut();
		$('#wiki').fadeOut();
		$('#fade').fadeOut();
		
		$('body').css("background-position", "0px 0px");
		
		if($('.ownerbody').attr('old-background-attachment') != 'fixed') {
			$('body').css("background-attachment", "scroll");
		};
		$('.ownerbody').attr('old-background-attachment', null); 
			
	},

  launchFullScreen: function(element) {
    if(element.requestFullScreen) {
      element.requestFullScreen();
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if(element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    }
  },
  
	init_listeners: function() 
	{
		var self = this;
	
		$(document).keydown(function(evt) {
		var kc = evt.keyCode || evt.which;
      		switch(kc)
			{
				case 27: // esc
					self.closeOverlay();
					break;
				case 34:
				case 35:
					if(self.datastore.minIndex['content'] > 0) {
						self.processScroll = false;
						// function(stream, commitcode, pos, length, cback) 
						self.datastore.requestMoreMessages( "content", Math.random() + "", self.datastore.minIndex['content'] - 1, 48, self.processMoreMessages );
					}
					break;
			}
		});
	
		$('#fade').on('click', function() {
			self.closeOverlay()
		});
	
		$("#videoBtn").click( function(e) {
			e.stopImmediatePropagation();
			$("#module").slideToggle();
			$("#video").slideToggle();
			if ( !this.videoIsPlaying ) {

				if( $("#videoBtn").attr( "vidsrc" ) ) { 
					$('#frame_mainvideo #videoFrame').attr("src", $("#videoBtn").attr( "vidsrc") );
				}
				this.videoIsPlaying = true;
				$("#videoBtn").attr("state", "open");

				$('#module .startVideo.img').trigger('imageLoaded.sizeSet');
				$('#video .startVideo.img').trigger('imageLoaded.sizeSet');
			} else {
				$("#videoBtn").attr( "vidsrc", $('#videoFrame').attr("src") );
				$('#videoFrame').attr("src", null)
				this.videoIsPlaying = false;
				$("#videoBtn").attr("state", "closed");
			}
			return false;
		});

		
		$("#scrollToTopBtn").click( function(){
			 $('html, body').animate({
				scrollTop: 0
			 }, 1000);
		});
		
		
		$("#moreTetrisMessages").click( function() {
      		self.datastore.requestMoreMessages( "content", Math.random() + "", self.datastore.minIndex['content'], 48, self.processMoreMessages );
		});
			
		$('#overlayCloseButton').on('click', function() {
			self.closeOverlay(this);
		});	

		$(window).scroll(function(){	
		  
		  if( ThirdScreenConfig.IS_EDITOR ) return;
		  			  
			var offTop = $("#tetris").offset() ? $("#tetris").offset().top : 100;
			if( $(window).scrollTop() > offTop && $(window).scrollTop() < 200000 ) {
				if($('body').hasClass("list")) {
					if ($("#screen").offset().left >= $("#scrollToTopBtn").width() + 20) {
						var rig = $("#screen").offset().left - $("#scrollToTopBtn").width()- 20;
						$("#scrollToTopBtn").css({'position':'fixed', 'bottom':'0px', 'left': rig });
					} else {
						var rig = $("#screen").offset().left + $("#screen").width()  - $("#scrollToTopBtn").width()- 20;
						$("#scrollToTopBtn").css({'position':'fixed', 'bottom':'20px', 'left': rig });
					}
				} else {
					var lef = $("#screen").offset().left - $("#scrollToTopBtn").width() - 10;
			  		if (lef < 0 ) lef = 0;
					$("#scrollToTopBtn").css({'position':'fixed', 'bottom':'0px', 'left': lef });
				}
				
				$("#scrollToTopBtn").fadeIn();
			} else {
				$("#scrollToTopBtn").fadeOut();
			}		
			
			if (self.processScroll  && $(window).scrollTop() > $(document).height() - $(window).height() - 130) {
				if(self.datastore.minIndex['content'] > 0) {
					self.processScroll = false;
					self.datastore.requestMoreMessages( "content", Math.random() + "", self.datastore.minIndex['content'] - 1, 48, self.processMoreMessages );
				}
			}
		});

 		$(window).resize(function() {
			if( ThirdScreenConfig.IS_EDITOR ) return;
			if(!$("#tetris").offset()) return;
			$("#scrollToTopBtn").css({'position':'fixed', 'bottom':'10px', 'left': $("#tetris").offset().left - $("#scrollToTopBtn").width() - 10 });
		});
	},


  processMoreMessages: function(envelopes) {
  	
  	if(typeof getPixel === 'function' && getPixel != undefined)
	{
		if(envelopes.items) {
			getPixel('more-messages');
		}
	}
  	
    for(var i in envelopes.items) {    
      	var env = envelopes.items[i];
      	this.datastore.registerEnvelope(env);
      	this.fillTetrisMore(env);
      
    }
    this.processScroll = true;
  },

  processMoreMessagesForList: function(envelopes, frame) {
  	
	if(typeof getPixel === 'function' && getPixel != undefined)
	{
		if(envelopes.items) {
			getPixel('more-messages');
		}
	}


  	if(envelopes.more == false) {
  		frame.div.attr("more", "false");
  		if($('#moreForIDevice').length > 0) { 
  			//$('#moreForIDevice').hide();
  		}
  	}
    for(var i in envelopes.items) {    
    	
      	var env = envelopes.items[i];

      	this.datastore.allEnvelopes[env.id] = env;
      	this.datastore.updateMinMaxIndex(env);

      	var d = this.generateHTMLBox(env, true);
      	this.autocolor(d);

      	if(d == undefined) {
      	}
      	else {
	      	d.appendTo(frame.div);
    	}  
      
    }
    if($('#loadingMoreForIDevice').length > 0) { 
		$('#loadingMoreForIDevice').hide(); //css('display', 'none');
	}
	if($('#loadingMoreForIDeviceText').length > 0) { 
		$('#loadingMoreForIDeviceText').show();

	}
	if(frame) {
	    frame.div.attr("loadingmore", false);
  	}
  },

	initCookies: function()
    {
        this.cookies = {};
        var carr = document.cookie.split(';');
        var kv,kvarr;
        for (var i = 0; i < carr.length; i++)
        {
            kv = $.trim(carr[i].split('='));
            kvarr = kv.split(",");
            this.cookies[$.trim(kvarr[0])] = $.trim(kvarr[1]);   
        }
    },

	// kommentare
	initMessageCommentField: function() 
	{
		if(this.messageCommentFieldInitialized == true) return;
		this.messageCommentFieldInitialized = true;
			
		var self = this;			
		commentForm = $('#messageCommentForm');
		
		commentForm.on(
			'submit',
			function(evt)
			{
				evt.preventDefault();
				//if (nosubmit) return;
				var msg = commentField.val();
				var id = $(this).attr('mid');
				if (!msg
					|| msg.length <= ThirdScreenConfig.MIN_MESSAGE_LENGTH
					|| msg == ThirdScreenConfig.DEFAULT_CHAT_TEXT) return;

				if (!self.sovietNick)
				{
					self.login(function(nn) { commentForm.submit(); });
					return;
				}

				var data = {
					type: 'chat',
					method: 'TC',
					post: id,
					msg: msg
				};

				self.sendChatCommit(data, self.commentCBack, self);
			}
		);

      commentField = commentForm.find('input[type="text"]');
      commentField.val(ThirdScreenConfig.DEFAULT_CHAT_TEXT);
      commentField.on(
          'focus',
          function (evt)
          {
              if (!commentField.hasClass('active')) commentField.addClass('active');

              if (commentField.val() != ThirdScreenConfig.DEFAULT_CHAT_TEXT) return;
              commentField.val('');
          }
      );
      commentField.on(
          'blur',
          function (evt)
          {
              commentField.removeClass('active');
              if (commentField.val() != "") return;
              commentField.val(ThirdScreenConfig.DEFAULT_CHAT_TEXT);
          }
      );

      commentBtn = commentForm.find('input[type="submit"]');
      commentBtn.on(
          'click',
          function (evt)
          {
              if (commentField.val() == ThirdScreenConfig.DEFAULT_CHAT_TEXT)
              {
                  evt.preventDefault();
              }
          }
      );

	},

	commentCBack: function(data, textStatus, jqXHR, obj)
		{
			commentField.val(ThirdScreenConfig.MESSAGE_SENT_COMPLETE);
			nosubmit = true;
			setTimeout(
				function()
				{
					commentField.val(ThirdScreenConfig.DEFAULT_CHAT_TEXT);
					commentField.blur();
					nosubmit = false;
				},
				ThirdScreenConfig.INTERVAL_INLINE_MESSAGE
			);
		},

	initLogin: function()
    {
        var self = this;

        this.loginRootElm = $(document.createElement('div'));
        this.loginRootElm.attr('id', 'loginPopup');
        this.loginRootElm.css('position', 'absolute');
        this.loginRootElm.css('top', '0px');
        this.loginRootElm.css('left', '0px');
        this.loginRootElm.css('zIndex', '999999');
        this.loginRootElm.hide();
        $('body').append(this.loginRootElm);

        this.loginBg = $(document.createElement('div'));
        this.loginBg.addClass('bg');
        this.loginBg.css('position', 'absolute');
        this.loginBg.css('top', '0px');
        this.loginBg.css('left', '0px');
        this.loginBg.css('zIndex', '1');
        this.loginBg.css('background', '#000000');
        this.loginBg.css('opacity', '0.4');
        this.loginBg.css('filter', 'alpha(opacity=40)');
        this.loginBg.on(
            'click',
            function(evt)
            {
                if (self.loginForm.has(evt.target).length != 0) return;
                self.loginRootElm.hide();
                cback.call(null, nn);
            }
        );
        this.loginRootElm.append(this.loginBg);
        
        this.loginContainer = $(document.createElement('div')); 
        this.loginContainer.css('position', 'absolute');
        this.loginContainer.css('display', 'block');
        this.loginContainer.css('top', '0px');
        this.loginContainer.css('left', '0px');
        this.loginContainer.css('width', '250px');
        /*this.loginContainer.css('max-width', '80%');*/
        this.loginContainer.css('height', '90px');
        this.loginContainer.css('zIndex', '2');  
        this.loginContainer.css('padding', '30px');
        //this.loginContainer.css('border', '1px solid #333');
        this.loginContainer.css('background', '#e5eef5');  
        //this.loginContainer.css('background-image', 'url(/assets/loginscreen.png)');  
        this.loginContainer.css('-webkit-border-radius','18px');
        this.loginContainer.css('-khtml-border-radius','18px');
        this.loginContainer.css('-moz-border-radius','18px');
        this.loginContainer.css('border-radius','18px');
        this.loginRootElm.append(this.loginContainer);
                 
        
        this.loginClose = $(document.createElement('div'));
        this.loginClose.css('position', 'absolute');
        this.loginClose.css('top', '10px');
        this.loginClose.css('right', '10px');
        this.loginClose.css('zIndex', '1');
        this.loginClose.css('background', 'transparent');
        this.loginClose.css('width', '20px');
        this.loginClose.css('cursor', 'pointer'); 
        this.loginClose.css("font-weight", "bold");  
        this.loginClose.css("text-align", "center");  
                                                            
        this.loginClose.append("x");
        
        this.loginClose.on(
            'click',
            function(evt)
            {
                if (self.loginForm.has(evt.target).length != 0) return;
                self.loginRootElm.hide();
                cback.call(null, nn);
            }
        );
        this.loginContainer.append(this.loginClose);
        
        this.loginMessage = $(document.createElement('p'));
        this.loginMessage.css('margin-bottom', '10px');  
        this.loginMessage.append(ThirdScreenConfig.CHAT_USERNAME_TEXT?ThirdScreenConfig.CHAT_USERNAME_TEXT:'Bitte geben Sie Ihren Chatnamen an:');
        this.loginContainer.append(this.loginMessage);
                
        this.loginForm = $(document.createElement('form'));
        this.loginContainer.append(this.loginForm);
        this.loginForm.on(
            'submit',
            function(evt)
            {
                evt.preventDefault();

                var nn = self.loginField.val().trim();
                self.nn = nn;
                if (!nn || nn.length < 1 || nn.length < ThirdScreenConfig.MIN_LOGIN_LENGTH) return;

                var data = {};

				data.type = 'chat';
				data.method = 'NN';
				data.nick =  nn;

                self.sendChatCommit(data, self.loginCBack, self);

                /*$.ajax(
                    ThirdScreenConfig.URL_LOGIN + encodeURIComponent(nn),
                    {
                        success: function(json, textStatus, jqXHR)
                        {
                            //var props = json; //xLib.objectFromNodeProperties(data);
                            if (json.message == nn)
                            {
                                self.sovietNick = nn;
                                self.loginRootElm.hide();
                                self.onLoginSuccess(nn);
                            }
                        }
                    }
                );*/
            }
        );

        this.loginField = $(document.createElement('input'));
        this.loginField.attr('type', 'text');   
        this.loginField.css('max-width', '90%'); 
        this.loginField.css('width', '300px');  
        this.loginForm.append(this.loginField);

        this.loginBtn = $(document.createElement('input'));
        this.loginBtn.attr('type', 'submit');
        this.loginBtn.attr('value', 'OK');
        //this.loginBtn.css('margin-top', '10px');  
        this.loginForm.append(this.loginBtn);
    },

    loginCBack: function(json, textStatus, jqXHR, obj)
		{
		    //var props = json; //xLib.objectFromNodeProperties(data);
		    if (json.message == obj.nn)
		    {
		        obj.sovietNick = obj.nn;
		        obj.loginRootElm.hide();
		        obj.onLoginSuccess(obj.nn);
		    }
		},

    login: function(cback)
    {
        if (this.sovietNick != null)
        {
            return;
        }

        this.onLoginSuccess = (cback == undefined || cback.constructor != Function)? function(nn) {}: cback;

        this.loginField.val('');

        this.loginRootElm.show();

        var dw = $(document).outerWidth();
        var dh = $(document).outerHeight();

        this.loginBg.css('height', dh + 'px');
        this.loginBg.css('width', dw + 'px');

        var ww = $(window).outerWidth();
        var wh = $(window).outerHeight();

        var fw = this.loginContainer.outerWidth();
        var fh = this.loginContainer.outerHeight();
		var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
		
		if (iOS) {
			this.loginContainer.css({'position': 'fixed', 'top': '30px', 'left': '0'});
		} else {
        	this.loginContainer.css('top',  ((wh - fh)/2 + $(window).scrollTop()) + 'px');
        	this.loginContainer.css('left', (ww - fw)/2 + 'px');
        }
        

        this.loginField.focus();
    },

    initChat: function()
    {
    	if(this.chatInitialized) return;
    	
    	if( ThirdScreenConfig.CHAT == 0 ) return;
    	
        this.chatInitialized = true;

        var self = this;

        //this.sovietUser = (this.cookies['FLYP-USER'])? this.cookies['FLYP-USER']: null;
        this.sovietUser = this.getUUID();
        this.sovietNick = (this.cookies['FLYP-NICK'])? this.cookies['FLYP-NICK']: null;

        this.chatRootParent = $('#chatboxdummy');
        
        this.chatRootElm = $(document.createElement('div'));
      	this.chatRootElm.addClass('tilecontent');
      	this.chatRootParent.append(this.chatRootElm);
      	this.chatMsg = $(document.createElement('p'));
      	this.chatMsg.addClass("formDescription");
      	if($(this.chatRootParent).data("envelope")) this.chatMsg.text($(this.chatRootParent).data("envelope").message.text);
      	this.chatRootElm.append(this.chatMsg);

  		this.chatForm = $(document.createElement('form'));
        this.chatRootElm.append(this.chatForm);
        this.chatNoSubmit = false;
        this.chatForm.on(
            'submit',
            function(evt)
            {
                evt.preventDefault();

                var msg = self.chatField.val();
                if (!msg
                    || self.chatNoSubmit
                    || msg.length <= ThirdScreenConfig.MIN_MESSAGE_LENGTH
                    || msg == ThirdScreenConfig.DEFAULT_CHAT_TEXT) return;

                if (!self.sovietNick)
                {
                    self.login(function(nn) {self.chatForm.submit();});
                    return;
                }
                var data = {};
				data.type = 'chat';
				data.method = 'TX';
				//data.id = id;
				data.msg =  msg;
                self.sendChatCommit(data, self.sendChatCBack, self);
               
            }
        );


		 


      	if(ThirdScreenConfig.CHAT == 1){
      		// ben: in tabelle wegen dyn. Breite
			this.chatTable = $(document.createElement('table'));
			this.chatTable.css("width", "100%");
			
			this.chatForm.append(this.chatTable);
			
			this.trow = $(document.createElement('tr'));
			this.chatTable.append(this.trow);
			this.td1 = $(document.createElement('td'));
			
			this.trow.append(this.td1); 
			this.td2 = $(document.createElement('td'));
			this.trow.append(this.td2);

	        this.chatField = $(document.createElement('input'));
	        this.chatField.attr('placeholder', ThirdScreenConfig.DEFAULT_CHAT_TEXT);
	        this.chatField.attr('type', 'text');
	        this.chatField.css('width', '100%');
	        this.chatField.css('padding-left', '0');
	        
	        this.td1.append(this.chatField);

	        this.chatBtn = $(document.createElement('input'));
	        this.chatBtn.attr('type', 'submit');
	        this.chatBtn.attr('value', 'senden');
	        
	        this.td2.append(this.chatBtn);
      	} else if(ThirdScreenConfig.CHAT == 2){

	        this.chatField = $(document.createElement('textarea'));
	        this.chatField.attr('placeholder',ThirdScreenConfig.DEFAULT_CHAT_TEXT);

	        //this.chatField.css({'font-family':'Strait','width':'100%','min-width':'100%','max-width':'100%','height':'90px', 'padding-left':'0','float':'right','font-size':'17px'/*,'font-family':'straight'*/});
	        
	        this.chatForm.append(this.chatField);

	        this.chatBtn = $(document.createElement('input'));
	        this.chatBtn.attr('type', 'submit');
	        this.chatBtn.attr('value', 'senden');
	        this.chatBtn.css({'float':'right','margin': '5px 0px 18px 0px'});
	        
	        this.chatForm.append(this.chatBtn);
      	}
        
        
    },

    sendChatCBack: function(data, textStatus, jqXHR, self)
    {
        self.chatNoSubmit = true;
        self.chatField.val('');
        self.chatField.focus();

        self.chatField.attr('placeholder', ThirdScreenConfig.MESSAGE_SENT_COMPLETE);
        setTimeout(
            function ()
            {
                self.chatNoSubmit = false;
                self.chatField.attr('placeholder', ThirdScreenConfig.DEFAULT_CHAT_TEXT);
                self.chatField.blur();
            },
            ThirdScreenConfig.INTERVAL_INLINE_MESSAGE
        );
    },
  

	log: function(s)
	{
		if (typeof console === "undefined"){
		    console={};
    		console.log = function(){
        		return;
    		}
		}
		console.log(s);
	},

	// update slideshows on resize
	// mutate.js supports only one listener so we need to centralize the listening
	registerSlideshow: function(s, frm){
		for(var show in this.slideshows){
			if(this.slideshows[show].substreamKey == s.substreamKey) {
				return;
			}
		}
		this.slideshows.push(s);
		frm.mutate('width',this.updateSlideshowWidth);
		//console.info("register: " + this.slideshows.length);
	},

	unregisterSlideshow: function(s){

		for (var i = this.slideshows.length-1; i >= 0; i--) {
		    if (this.slideshows[i].substreamKey == s.substreamKey) {
		        this.slideshows.splice(i, 1);
		        break;
		    }
		}

		//console.info("unregister: " + this.slideshows.length);
	},

	updateSlideshowWidth: function(){
		for(var s in this.slideshows){
			this.slideshows[s].updateWidth();
		}
	},

	// get slideshows by stream name - needed for updates
	getSlideshowByStream: function(stream){
		for(var s in this.slideshows){
			if(this.slideshows[s].substreamKey == stream) {
				return this.slideshows[s];
			}
		}
		return null;
	}
      
});


 
var s3_nposts = 0;
var timeout_debug = null;

function s3_debug_add() {
	timeout_debug && clearTimeout(timeout_debug);
	
	s3_nposts++;
	var xl = Math.floor(Math.random() * s3_quotes.length);
	var quote = update[s3_nposts - 1];
		
	var envelope = {
		revision: quote.revision,
		id: quote.id,
		message: {
			frame: 	quote.message.frame,
			layout: quote.message.layout,
			text: 	quote.message.text, // + " (#" +s3_nposts + ") " + quote.message.layout,
			color: 	quote.message.color,
			video: 	quote.message.video,
			style: 	quote.message.style,
			link:		quote.message.link,
			info:		quote.message.info,
			headline: quote.message.headline,
			slideshow: quote.message.slideshow
		}
	}
	
	the3rdscreen.postEnvelope(envelope);
	timeout_debug = setTimeout('s3_debug_add()', ThirdScreenConfig.DEBUG_ADD_INTERVAL);
	
}

function s3_debug_stop() {
  if(timeout_debug != null) { clearTimeout(timeout_debug); }
}

function s3_overlay_wiki() {
  the3rdscreen.openOverlayWiki();
}

function s3_shortest_list(num) {
	var shortest = 1;
	for(var i=1;i<=num;i++){
  		var shortest = sortRow(shortest,i)
  	}
  	return  $("#tetris_row" + shortest);
}

function sortRow(a,b){
	return $("#tetris_row" + a).height() < $("#tetris_row" + b).height() ? a : b;
}

var the3rdscreen = {};

function initialize3rdScreen(){

	the3rdscreen = new ThirdScreen();
	the3rdscreen.requestStartData();
	//the3rdscreen.updates = update;
} 

$( initialize3rdScreen );


// Eventhandler für postmessage()-Nachrichten, die von der Hostseite geschickt werden können
// vgl Einbindung mit http://elbjazz15.fkpscorpio.flyp.cc/g/js/iframe/growing.js
// schadet nix in anderen Kontexten

window.addEventListener('message', function(e) {
	var message = String(e.data);
	if (message == 'load-more') {
	  // instance name of main flyp object is the3rdscreen
	  	the3rdscreen.datastore.requestMoreMessages( "content", Math.random() + "", the3rdscreen.datastore.minIndex['content'], 48, the3rdscreen.processMoreMessages );
	  	
	  	$(window).trigger('load-more-list', false);
	  
	} else if (message.indexOf('frame') > -1) {
	  document.frametop = 1 * message.split('frame-top:').pop();
	}
});



var latestSize = 0;

function resizeiFrame() {

  var height = $(document).height();
  if (height - latestSize <= 0) return;
  latestSize = height;
  var width = 960;
  var domId = 'flypsiteFrame';
  var s = document.location.search.substr(1).split('&')[0];
  if (s) domId = s;
  parent.postMessage(width + ':' + height+":"+domId, '*');
}

document.frametop = 1;

if (String(document.location.search.substr(1).split('&')[1]).indexOf('allowmessaging') > -1 && parent != window) setInterval(resizeiFrame, 1000);

