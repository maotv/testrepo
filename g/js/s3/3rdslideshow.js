var SlideShow = mkclass({


	init: function()
	{
		var self = this;
		// config
		this.autoplay = false;
		this.loggingEnabled = true;
		this.effect = 'slide'; // slide | fade
		this.playInterval = 5000; // interval between slides in ms in autoplay
		this.maxStartDelay = 3000; // max delay for async start of autoplay in ms
		this.isLazyLoading = true;
		this.slidesBuilded = false;

		// fields to set
		this.slideContainer = null;
		this.eventid = null;
		this.mid = null;
		this.layouts = null;
		this.frame = "hans";
		this.ratio = 16 / 9;
		this.frameContainer = null;
		this.contW = null;
		this.contH = null;
		this.mainStyle = null;
		this.container = null;
		this.thirdscreen = null;
		this.ss = null;
		this.substreamKey = null;
		this.currentSlide = 1;
		//this.textContainer = null;
		this.envelopes = [];
		this.rio = null;
		this.hasText = false;
		this.slideshowApi = null;
		this.firstEnvelope = null;

		this.loaderIconSrc = "/global/assets/icons/ajax-loader-small2.gif";

		// context of instance
		this.isList = false;
		this.isTetris = false;
		this.ssid = "";
	},

	initShow: function(){

		// check if context is ready
		var body = this.container.closest('.ownerbody');
		if(body.length === 0){
			setTimeout(this.initShow, 100);
			return;
		}

		this.cleanup();
		this.setupSlideshow();
		if(this.isLazyLoading){
			this.container.find('a.slidesjs-next').on('click',{dir:"next"}, this.buildSlides);
			this.container.find('a.slidesjs-previous').on('click',{dir:"prev"}, this.buildSlides);
			this.loadSlides();
		}else{
			this.loadSlides();
		}
	},

	cleanup: function(){
		this.envelopes = [];
		this.slideContainer = null;
		this.currentSlide = 1;
	},


	setupSlideshow: function(){
		var self = this;

		$(this.container).data('slideshow', this);

		// setup slideshow
		this.container.addClass('slideshow');
		//this.container.attr('display', 'kachel');
		this.mid = this.container.attr('mid');
		this.frameContainer = $(this.container).closest('.frame');
		// decide context
		this.isTetris = (this.frameContainer.length === 0);
		this.isList = ($(this.container).closest('[type="list"]').length > 0 );//(this.frame.type == "list");
		this.isMobile = $('body').hasClass("mobile");
		this.ssid = 'slideshow_' + this.envelope.id + '_' + this.mid + '_' + this.frame.name + '_' + Math.floor(Math.random() * 10000);

		this.slideContainer = $('<div>',{
			'slideshow': this.ssid
		});

		// show text 
		if(this.envelope.message.text.length > 0){

			this.textContainer = $('<div>',{
				"class" : "connect"
			});
			var d = $('<div>',{
				"class": "flypicon flypiconConnect",
				text: "i"
			});
			this.textContainer.append(d);
			d = $('<p>', {
				"class": "text transparent",
				"style": "z-index: 2"
			}).append("<span>" + this.envelope.message.text + "</span>");
			this.textContainer.append(d);

			this.hasText = true;
		}
		
			
		this.contW = this.frameContainer.width();
		this.contH = this.frameContainer.height();

// fixme: böses hack!!!
if(this.mid == 4811895) this.contH = 180;


		if(this.isTetris || this.isMobile){
			this.contW = this.frame.raster.sizes[this.envelope.message.size].width;//this.container.width();
			this.contH = this.frame.raster.sizes[this.envelope.message.size].height;//this.container.height();
		}

		// adjust ratio
		if(this.isList) {
			this.ratio = 16/9;
			this.container.width(this.contW);//.height(this.contW / this.ratio + 16);
		}else{
			this.ratio = (this.contW > this.contH) ? this.contW / this.contH : this.contH / this.contW;
			this.slideContainer.width(this.contW).height(this.contH);
		}

		this.mainStyle = 'plain';
		// get style of trigger message
		if(this.container.hasClass('plain')){
			this.mainStyle = 'plain';
		}else{
			var classList = this.container.attr('class').split(/\s+/);
			$.each( classList, function(){
				if(this.match(/s[0-9]/)){
					self.mainStyle = this;
					return false;
				}
			});
		}

		// add handles
		var prevbtn = $('<a>', {
			"class": "slidesjs-previous slidesjs-navigation prev",
			href: "#",
			title: "Zurück"
		}).appendTo(this.slideContainer).hide();

		var nextbtn = $('<a>', {
			"class": "slidesjs-next slidesjs-navigation next",
			href: "#",
			title: "Weiter"
		}).appendTo(this.slideContainer).hide();
		
		
		// add and start the show
		
		//this.container.append(this.slideContainer);
		//this.container.append(this.textContainer);
		//if(this.textContainer) this.textContainer.insertAfter(this.slideContainer);
		/*
		if(this.isList){
			this.slideContainer.insertBefore(this.container.find('div.listCommentCount'));
			if(this.textContainer) this.textContainer.insertBefore(this.container.find('div.listCommentCount'));
			this.thirdscreen.registerSlideshow(this, this.frameContainer);
		}else{
			this.slideContainer.insertBefore(this.container.find('div.theComment'));
			//if(this.textContainer) this.textContainer.insertBefore(this.container.find('div.theComment'));	
		}
		*/
	
		if(this.isList){
			this.container.prepend(this.slideContainer);
			
		}else{
			this.slideContainer.insertBefore(this.container.find('div.theComment'));
		}
		// registrieren fuer updates und groessenaenderungen
		this.thirdscreen.registerSlideshow(this, this.frameContainer);
		
	},

	

	loadSlides: function()
	{
		this.showLoader();
		// remember the key
		this.substreamKey = this.envelope.message.substream.key;
		// load via rio
		this.rio = this.thirdscreen.datastore.protocol;
		this.rio.requestInitial(this.substreamKey, null, this.envelope.commit, this.storeEnvelopes, null, this.errorOnLoading);

	},

	errorOnLoading: function(error, text){
		this.updateInterface();
		this.hideLoader();
		return;
	},

	storeEnvelopes: function(json)
	{
		var self = this;
		this.eventid = json.eventid;
		// no substream entries - no slideshow
		
		$.each(json.updates, function() {
			if(self.firstEnvelope === null){
				self.firstEnvelope = this;
			}
			self.envelopes.push(this);
			self.thirdscreen.datastore.registerEnvelope(this);
		});

		if(this.isLazyLoading){
			this.buildPreviewSlide();
		}else{
			this.hideLoader();
			this.buildSlides();
		}

		//this.debugEnvelopes();
		
	},

	updateInterface: function(){
		

		// no envelopes - no slideshow
		if(this.envelopes.length === 0){
			this.slideContainer.find("a.slidesjs-navigation").hide();
			this.hideLoader();
			return;
		}else if(this.envelopes.length === 1){
			this.slideContainer.find("a.slidesjs-navigation").hide();
		}else{
			if(this.isList || this.isTetris){
				// navigation positionieren
				var firstSlide = this.slideContainer.find('.slide')[0];
				this.slideContainer.find("a.slidesjs-navigation").css('top', ($(firstSlide).height() / 2 - 20 )+'px');
			}
			this.slideContainer.find("a.slidesjs-navigation").show();
		}

		
	},

	buildPreviewSlide: function(){
		if(this.firstEnvelope != null){
			try{
				d = this.appendSlide(this.firstEnvelope, null);
			}catch(e){
				this.log(e);
				this.container.remove();
			}
			
		}
		this.updateInterface();
	},

	buildSlides: function(e)
	{
		var self = this;
		if(typeof e !== "undefined") {
			e.preventDefault();
			this.firstMove = e.data.dir;
		}
		this.showLoader();
		// remove load click handler
		this.container.find('a.slidesjs-next').off('click',this.buildSlides);
		this.container.find('a.slidesjs-previous').off('click',this.buildSlides);
		
		// create slides
		//for(var env = this.envelopes.length-1; env >= 0 ; env--){
		for(var env = 0; env < this.envelopes.length ; env++){
			if( (this.isLazyLoading && this.envelopes[env].id !== this.firstEnvelope.id) || !this.isLazyLoading ){
				try{
					this.appendSlide(this.envelopes[env], null);
				}catch(e){
					this.log(e);
				}
				
			}
		}
		

		this.updateInterface();

		if(this.autoplay && this.maxStartDelay > 0){
			setTimeout(this.start, Math.floor(Math.random() * this.maxStartDelay));
		}else{
			this.start();
		}
	},

	appendSlide: function(envelope, overwriteLayout){
		//this.log(envelope.message.media.url);

		//var self = this;

		if(envelope === null || envelope.message === undefined) return true;

		// layout funktion
		
		var s = (overwriteLayout === null) ? "layout_" + envelope.message.size + "_" + envelope.message.layout : "layout_" + envelope.message.size + "_" + overwriteLayout;
		// um nicht das original zu verändern duplizieren
		var f = jQuery.extend({}, this.frame);

		// in einer liste wollen wir trotzdem als kachel rendern und brauchen entsprechende HTML Struktur
		if(this.isList) {
			f.type = "single";
		}
		// generate html
		var d = this.layouts[s](f, envelope);
		// markieren
		d.addClass('slide');

		// styles umschreiben wenn nicht explizit gesetzt
		// greift momentan nicht, da standard style nicht mehr 'plain' sondern 's1' ist
		if(d.hasClass('plain') && typeof this.mainStyle !== "undefined" && this.mainStyle !== null){
			d.removeClass('plain').addClass(this.mainStyle.toString());
		}
		
		// adjust width & height
		if(this.isList){
			d.height(this.contW / this.ratio);
			d.width(this.contW);
		} else {
			d.height(this.contH);
		}
		
		// BENJAMIN hier auskommentieren. Dann huebsch.
		if(this.isList) this.scaleSlide(d);

		// hide comment marker in classic view
		if(!this.isList){
			d.find("div.theComment").hide();
		}
		
		// add to show
		this.slideContainer.append(d);

		this.hideLoader();
		return d;
	},

	isTextMessage: function(d){
		if( d.attr('layout') == "text" || d.attr('layout') == "text_big" || d.attr('layout') == "time" || d.attr('layout') == "message_big" || d.attr('layout') == "text_link" || d.attr('layout') == "message" ) return true;
	},

	scaleSlide: function(d){
		
		//return;
		var self = this;

		var t = d.find('.tilecontent');
		var i = d.find('p.info');
		var l = d.find('p.link');
		var tx = d.find('p.text');
		var iframe = d.find('iframe');

		var tw = d.find('.serviceicon_twitter');

		// FIXME  - scaling in liste auf layout = base gesetzt um prozentuale scalierung abzufangen
		var width, height, w, h;
		if(self.isList){
			width = 320;
			height = 180;
			w = width;
			h = height;
		} else {
			width = self.frame.raster.sizes[self.envelope.message.size].width;
			height = self.frame.raster.sizes[self.envelope.message.size].height;
			w = width;// margin abziehen? - parseInt(t.css('margin-left')) - parseInt(t.css('margin-right'));
			h = height;// - parseInt(t.css('margin-top')) - parseInt(t.css('margin-bottom'));
		}
		
		var scaling = self.contW /  width;

		if(isNaN(scaling)) scaling = 1;

		//t.css({transformOrigin: "left top 0px", width: w + "px", height: h + "px", transform: "scale(" + scaling + ", " + scaling + ")"});
		//i.css({transformOrigin: "left top 0px", width: w + "px", height: h + "px", transform: "scale(" + scaling + ", " + scaling + ")"});

		var scaler = d.find('.slideshow_scaler');
		if(scaler) scaler.remove();
		// add scaler div
		var s = $('<div>',{"class": "slideshow_scaler"});
		s.css({width: w + "px", height: h + "px", position: "absolute", top: "0px"});
		s = self.prefixedCSS(s, "transform-origin", "left top 0px");
		s = self.prefixedCSS(s, "transform","scale(" + scaling + ", " + scaling + ")");
		s.append(t.detach());
		if(i) s.append(i.detach());
		if(l) s.append(l.detach());
		// bei image liegt .text nicht in .tilecontent und muss extra behandelt werden
		if( d.attr('layout') == "image") {
			if(tx) s.append(tx.detach());
		}
		if( d.attr('layout') == "video" ) {
			if(iframe) s.append(iframe.detach());
		}
		d.append(s);

	},

	rebuildSlideshow: function(){
		// rebuild slideshow
		if(this.slideContainer.find('.slidesjs-container').length > 0){
			// already initialized
			//console.info("remove show");
			this.slideContainer.remove();
			this.initShow();
		}else{
			// lazy and not initialized
			//console.info("remove preview");
			this.slideContainer.find('.slide').remove();
			this.buildPreviewSlide();
		}
	},

	removeSlide: function(id){
		if(id.indexOf('e') === 0){
			id = id.substr(1);
		}
		
		// remove specific slide
		//console.info("removeSlide " + id);
		//this.debugEnvelopes();
		for (var i = this.envelopes.length-1; i >= 0; i--) {
			if (this.envelopes[i].id == id) {
				this.envelopes.splice(i, 1);
				break;
			}
		}
		if(this.firstEnvelope.id === id){
			this.firstEnvelope = null;
			if(this.envelopes.length > 0) this.firstEnvelope = this.envelopes[0];
		}
		//this.debugEnvelopes();
		this.rebuildSlideshow();
		
	},

	debugEnvelopes: function(){
	
		var ids = "";
		for(var e in this.envelopes){
	
			ids += this.envelopes[e].id + ",";
		}
		console.info(this.envelopes, this.envelopes.length, ids);
	},

	addSlide: function(env){
		//console.info("addSlide" + env.id);
		this.envelopes.unshift(env);
		this.firstEnvelope = env;
		//this.debugEnvelopes();
		this.rebuildSlideshow();
	},

	start: function(){

		var showContainer = $("div[slideshow='" + this.ssid + "']");
		// wait for container to exist - in classic this can take a while
		if(showContainer.length < 1){
			setTimeout(this.start, 100);
			return;
		}
		
		var self = this;
		// config object
		var c = {};
		c.pagination = {active: false};
		c.navigation = {active: false};
		c.play = {
			active: false,
			interval: this.playInterval,
			pauseOnHover: true,
			effect: this.effect
		};

		if(this.autoplay === true) c.play.auto = true;

		// callbacks
		c.callback = {
			loaded: function(number) {
				self.currentSlide = number;
				self.hideLoader();
			},
			complete: function(number) {
				self.currentSlide = number;
				if(!self.autoplay && typeof getPixel === 'function' && getPixel !== undefined)
				{
					getPixel('slide-' + number);
				}
			}
		};

		if(this.currentSlide != 1){
			c.start = this.currentSlide;
		}

		//console.info(this.currentSlide);

		//this.hideLoader();

		this.ss = showContainer.slidesjs(c);
		this.slideshowApi = this.ss.data('plugin_slidesjs');
		if(this.isLazyLoading && typeof this.firstMove != 'undefined'){
			switch(this.firstMove){
				case "prev":
					this.slideshowApi.previous();
					break;
				case "next":
					this.slideshowApi.next();
					break;
			}
		}
	},

	

	updateWidth: function(){

		if(!this.isList) return;

		var showContainer = $("div[slideshow='" + this.ssid + "']").closest(".slideshow");
		var self = this;

		this.contW = this.frameContainer.width();
		this.contH = this.frameContainer.height();

		if(this.isList){
			this.container.width(this.contW);
			//this.container.height(this.contW / this.ratio + 16);	

			$(this.container).find('.slide').each(function() {
				$(this).height(self.contW / self.ratio);
				$(this).width(self.contW);
				self.scaleSlide($(this));
				
			});
		}
		this.updateInterface();
	},

	showLoader: function(){
		//this.log("showLoader");

		var ldr = $('<img>',{
			"src": this.loaderIconSrc,
			"class": "loader",
			"style": "position:absolute;z-index:209"
		}).appendTo(this.container);
		
		this.container.find("img.loader").css('top', ( this.container.height() / 2 - 7 )+'px');
		this.container.find("img.loader").css('left', ( this.container.width() / 2 - 64 )+'px');

	},

	hideLoader: function(){
		//this.log("hideLoader");
		this.container.find("img.loader").remove();
	},

	prefixedCSS: function(elem, property, value)
	{
		elem.css(property, value);
		elem.css("-webkit-" + property, value);
		elem.css("-moz-" + property, value);
		elem.css("-ms-" + property, value);
		elem.css("-o-" + property, value);

		return elem;
	},


	log: function(e)
	{
		if(console && console.log && this.loggingEnabled){

			console.log(e);
		}
	}
});
