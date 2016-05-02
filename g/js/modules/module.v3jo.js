var Flyp = (function(fl, $_){

	// class constructor

	function Module(env) {
		this.env    = env;
		this.container = $_("#" + env.container);
		this.flypparent = 0;	
		this.failed = false;
		this.data   = [];
		this.force169 = false;
		this.resizetriggered = false;
		this.mobileswitch = env.mobileswitch;
		this.playingVideo = false;
		this.w      = this.container.width();

		if( !this.checkContainer()) return;
		if (this.w == 0) {
			// do nothing, try again in 1 second
			document.env = env;
			window.setTimeout(function() {
				new Flyp.Module(document.env);
			}, 1000);
			this.failed = true;
		}
		
		this.poll = (env.poll === true);
		if(env.owner && env.event) {
			this.v = new Flyp.Vienna({
				key: "http://" + env.event + "." + env.owner + ".flyp.tv/rio",
				root: "//d3kcx7oxb4qpd2.cloudfront.net/events/" + env.owner + "/" + env.event + "/rio"	
			});
		} else {
			// no owner or event: no poll!
			this.poll = false;
		}
		
		this.stream    = env.stream;
		this.interval  = (env.interval?env.interval:3000);
		this.w = this.flypparent.width();
		var h = this.flypparent.height();
		if (h == 0) {
			this.h = Math.ceil(this.w * 9 / 16);
			this.force169 = true;
			this.flypparent.css({'height': this.h});
		} else this.h = h;
		
		//this.container.css({height: this.h + "px"});
		this.parts     = (env.parts)?env.parts:{header: 0.21, content: 0.79, footer:0};
		var smaller = Math.min (this.h, this.w * 0.666);
		var thepart = Math.max(this.parts.header, this.parts.footer);
		this.fonts     = (this.env.headerfontsizes)?this.env.headerfontsizes: {'icon': Math.round(smaller * thepart * 0.4) + "px", 'text': Math.round(smaller * thepart * 0.5) + "px", 'smalltext':  Math.round(smaller * thepart * 0.34) + "px"};
		this.imagevariant = (env.imagevariant)?env.imagevariant:'small';
		this.autocolor = !(env.autocolor === "false");
		this.animate   = !(env.animate === "false");
		this.autoresize= !(env.autoresize === "false");
		this.animfunc  = (env.animfunc == "fade")? this.fader: (env.animfunc == "slide")? this.slider:this.floater;
		this.overlayarea  = (env.overlayarea)?env.overlayarea * 1: 0.25;
		this.pollinterval = (parseInt(env.pollinterval, 10) > 0)?parseInt(env.pollinterval, 10):120000;
		this.ratio1       = (env.ratio1 === true);
		this.defaultlink  = (env.defaultlink)?env.defaultlink:false;
		this.forceclear   = (env.forceclear === true);
		this.displayitems = (parseInt(env.displayitems, 10) > 0)?parseInt(env.displayitems, 10):20;
		this.target 	  = (env.target)?env.target:false;
		this.userClicked  = false;
		
		if (env.template) this.template  = env.template;
		else {
			this.template = '\
<li class="STYLE CSERVICE">LINK\
	<header>\
		<p>SERVICEICON USERICON USERNAME MTIME USERHANDLE MSERVICE</p>\
	</header>\
	<content>\
		MIMG\
		<p>MTEXT</p>\
	</content>\
	<footer>\
	</footer>ENDLINK\
</li>';

		} 
		this.fonts.lineheight = Math.round(smaller * Math.max(this.parts.header, this.parts.footer) * 0.5) + "px";
		
		if (this.forceclear) this.container.empty();
		
		// store myself in the container diff for calls from somebody out there...
		this.container.data("FlypModule",this);
		
		// store the last clicked element here:
		this.satelite = null;
		
		this.start();

		var self = this;

		if (this.autoresize) {
			$_(window).resize( function() {  // resize-Events sammeln (500ms)
				if (self.resizetriggered) return;
				self.resizetriggered = true;
				window.setTimeout(
					(function(self1) {			//Self-executing func which takes 'this' as self
						return function() {		//Return a function in the context of 'self'
							self1.resize(); 		//Thing you wanted to run as non-window 'this'
							//self1.resizetriggered = false;
						}
					})(self), 
				500);
				
			});
		}
				
	}
	
	fl.Module = Module;  // use as Flyp.Module
	
	// instance methods
	var proto = Module.prototype;

	proto.animator = function(){
		if (!this.playingVideo && this.animate && !this.failed) {
			clearInterval(this.intervalId);
			this.intervalId = window.setInterval(
				(function(self) {			//Self-executing func which takes 'this' as self
					return function() {		//Return a function in the context of 'self'
						self.animfunc(); 	//Thing you wanted to run as non-window 'this'
					}
				})(this), this.interval);
			
		}
	
	}

	proto.poller = function(){
		var self = this;
		if (self.poll) {
			clearInterval(this.pollerId);
			this.pollerId = window.setTimeout(
				(function(self1) {			//Self-executing func which takes 'this' as self
					return function() {		//Return a function in the context of 'self'
						self1.startEmpty(); //Thing you wanted to run as non-window 'this'
					}
				})(self), self.pollinterval);
		}
	}

	proto.start = function() {	
		if(this.v) this.startEmpty();
	}
	
	proto.startEmpty = function() {	
		var self = this;
		
		clearInterval(self.intervalId);

		this.v.pollStreamInitialData(this.stream, function(envelopeArray, metaData) { 
			if (envelopeArray != null) {
				if(self.data.length == 0) initialLoad = true;
				self.data = envelopeArray;
				self.container.find(".flypContainer").empty();
				self.buildAll();
			}

			// send the first message if user has not selected sth else ,-)
			if(self.data.length > 0) {
				if(!self.userClicked) self.sendMessage(self.data[0]);
			}
			
			// if 0 or only 1 message and has a satelite, but is no satelite: hide yourself! right?
			if(self.data.length < 2 && self.target && self.container) {
				self.container.hide();
				$_("#" + self.target).css({"float":"none", "margin":'0 auto'});
			} else { 
				self.container.show();
				$_("#" + self.target).css("float","left"); 
			}

			if (self.data.length > 1 && self.displayitems > 1) {
				self.animfunc();
			} else {
				self.container.find("li").css({visibility: "visible"});
			}

			self.poller();
			self.animator();

		});

	}

	proto.sendMessage = function(json) {
		// der brieftraeger
		var elem = this.container.find('li[eid="' + json.id + '"]');
		if(this.satelite && this.satelite.attr('eid') == elem.attr('eid')) return; // nothing here
		if(this.satelite) {
			this.container.find('li[eid="' + this.satelite.attr('eid') + '"]').removeAttr("satelite");
		}
		this.satelite = elem;
		elem.attr("satelite",true);
		// finally:
		var satelite = $_("#" + this.target).data("FlypModule");
		if($_("#" + this.target).length > 0) satelite.postMessage(json);
	}
	
	proto.postMessage = function(json) {
		// der briefkasten
		if(this.data 
			&& this.data.length > 0 
			&& this.data[0].message.media
			&& json.message.media
			&& json.message.media.id == this.data[0].message.media.id) return;
		this.container.find('.flypContainer').empty();
		this.data=[];
		this.data.push(json);
		this.buildAll();
		this.container.find("li").hide(function(){
			$_(this).css({visibility: "visible"});
			$_(this).fadeIn();
		});
	}
	
	proto.checkContainer = function() {
		if(this.container.length == 0) {
			//fl.log("no container found! please insert &gt;div id=\"" + this.env.container + "\"/> at desired position inside your html!");	
			this.container = $_('<div id="' +this.env.container+ '"></div>').appendTo($_('body'));
			this.container.css({position: 'absolute', height: '100%', width: '100%'});
		}

		if (this.w < this.mobileswitch) this.container.addClass ("mobile");
		else this.container.removeClass ("mobile");
		
		if( this.container.find("div.flypParent").length == 0 ) {
			var d = $_("<div></div>").addClass("flypParent");
			this.container.append(d);
		}
		
		this.flypparent = this.container.find("div.flypParent")
		if( this.container.find("ul.flypContainer").length == 0 ) {
			var ul = $_('<ul></ul>').addClass('flypContainer');
			this.flypparent.append(ul);
		}
		this.flypparent.find(".flypContainer").empty();
		return true;
	}
	
	proto.buildAll = function() {
		var j = 0;
		for(var i in this.data) {
			if (j > this.displayitems) break;
			j++;
			// video or not?
			if(!this.v && this.data[i].message.layout == "video") { // && this.data[i].message.media && this.data[i].message.media.type == "video") {
				// we are a satelite, we do build video
				var li = this.buildVideo(this.data[i]);
			} else {
				var li = this.buildElement(this.data[i]);
			}
			if (i == 0) {
				var img = li.find("content span.mimage");
				if (img.length > 0 && img.attr('lazy')) {
					img.css({'background-image': "url(" + img.attr('lazy') + ")"});
					img.removeAttr('lazy');
				}
			}
		}		

	}
	
	proto.buildVideo = function(envlp) {
		var self = this;
		
		var c = this.container.find(".flypContainer");
		var aspect = 16/9;
		var w = c.height() * aspect;
		var offs = (c.width() - w) /2;		
		var vid = fl.mkvideoframe(envlp, w, c.height());
		var li = $_('<li>');
		li.data('message', envlp.message);
		
		//kein vienna, modul ist satelit, video anzeigen & starten
		if(!this.v) {
			vid.css({'display':'block', 'margin-left':'auto','margin-right':'auto'});
			var vv = vid.find(".videoframe")
			vv.attr('src', vv.attr('llsrc'));
			vv.show();
		} else {
			if(envlp.message.media && envlp.message.media.image) {				
				var overlay = fl.getImageElem(envlp.message.media.image, c.width(), c.height());
				overlay.css("backgroundImage", 'url(' + envlp.message.media.image.url + ')').removeAttr("lazy");
				overlay.on('click',function(){
					/* for playing at current position:
					overlay.hide();
					vid.attr('src', vid.attr('llsrc'));
					vid.show();
					*/
					
					// sending to target:
					self.sendMessage(envlp);
					// store user clicked to avoid auto overwrite					
					self.userClicked = true;
					self.animfunc();

				});
				li.append( overlay );
			}
		}
		li.append(vid);
		li.attr("eid", envlp.id);
		if(this.satelite && this.satelite.attr('eid') == envlp.id) li.attr('satelite', true);
		// do not show initially
		li.css("visibility", "hidden");
		c.append(li);
		return li;
	}

	proto.buildElement = function(envelope) {
		var self = this;
		if (!envelope.message) return;
		var m = envelope.message;
		var hasImage = m.media && m.media.image && m.media.image.url;
		if (!m.link && this.defaultlink) m.link = this.defaultlink;
		var alink = m.link;
		if (this.target) alink = false;  // if we have a target, we don't want the normal link behaviour
		
		m.text = m.text.replace(/\|/g, '<br />');
		
		var showconditionalheadline = hasImage && m.service && (m.service == 'flyphq' || m.service == 'opengraph' || m.service == 'mail');
		
		elem = this.template
			.replace(/USERSERVICELINEORHEADLINE/, showconditionalheadline?'MHEADLINE MTIME' : 'USERSERVICELINE')
			.replace(/USERSERVICELINE/, 'SERVICEICON USERICON USERNAME MTIME USERHANDLE MSERVICE')
			
			.replace(/CSERVICE/, m.service)
			.replace(/STYLE/, m.style)
			.replace(/MHEADLINE/, m.headline)
			.replace(/MTEXT/, m.headline? m.headline + ": " + m.text : m.text)
			.replace(/MINFO/, m.info)
			.replace(/MIMG/, hasImage? '<span class="mimage"></span>':'')
			.replace(/USERICON/, m.user && m.user.icon?'<img onerror="this.style.display=\'none\'" class="icon" src="' + m.user.icon.replace('http:', '') + '"></img>':'')
			.replace(/USERNAME/, m.user && m.user.name?'<span class="name">' + m.user.name + '</span>':'')
			.replace(/USERHANDLE/, m.user && m.user.handle && m.service != 'mail' && m.user.name != m.user.handle ?'<span class="handle">' + m.user.handle + '</span>':'')
			.replace(/MTIME/, m.time?'<span class="time">' + fl.formatTime(m.time) + '</span>':'')
			.replace(/MSERVICE/g, m.service && m.service != 'flyphq'?'<span class="service">'+ m.service +'</span>':'')
			.replace(/SERVICEICON/, m.service?'<span class="flypiconBig serviceicon_'+m.service+'"></span>':'')
			.replace(/LINK/, alink?'<a target="_blank" href="'+alink+'">':'')
			.replace(/ENDLINK/, alink?'</a>':'')
		var li = $_(elem);
		
		li.attr('eid', envelope.id);
		// store the message for later resizing
		li.data('message', m);
		
		// new loaded, but satelite:
		if(this.satelite && this.satelite.attr('eid') == envelope.id) li.attr('satelite', true);
				
		this.container.find(".flypContainer").append(li);
		
		if (hasImage) {
			m.media.image.url = m.media.image.url.replace(/:large/, ':' + this.imagevariant);
			//m.media.image.url = m.media.image.url.replace('http://tv.ypics.de', 'https://d3kcx7oxb4qpd2.cloudfront.net/ypics');
			m.media.image.url = m.media.image.url.replace('http://tv.ypics.de', 'https://d32odw1frluegp.cloudfront.net');
			m.media.image.url = m.media.image.url.replace('http:', 'https:');
		}
		
		if (this.autocolor) fl.autoColor(li);
		
		// tmp code?
		if(self.target) {
			li.on('click', function(){
				self.sendMessage(envelope);
				// store user clicked to avoid auto overwrite					
				self.userClicked = true;
				self.animfunc();

			});
		}
		
		this.setupli(li);
		
		if(m.media && m.media.type=="video" && self.target) {
			var videoPlayButton = ($_('<div title="Video starten" class="playVideoButtonContainer startVideo"><div class="cptr flypicon playVideoButton">P</div></div>'));
			li.append(videoPlayButton);
		}
		// do not show initially
		li.css("visibility", "hidden");
		return li;
	}
	
	proto.setupli = function(elem) {
		m = elem.data('message');
		// skip if message is video:
		if(!this.v && m.media && m.media.type=="video") return;		
		
		li = $_(elem);
		li.css({'width': this.w});
		li.find("header").css({'height': this.h * this.parts.header + "px", 'font-size': this.fonts.text, 'line-height': this.fonts.lineheight});
		li.find(".time").css({'font-size': this.fonts.smalltext, 'line-height': this.fonts.lineheight });
		li.find(".service").css({'font-size': this.fonts.smalltext, 'line-height': this.fonts.lineheight});
		li.find(".name").css({'line-height': this.fonts.lineheight });
		li.find(".handle").css({'line-height': this.fonts.lineheight});
		li.find("footer").css({'height': this.h * this.parts.footer + "px", 'font-size': this.fonts.text, 'line-height': this.fonts.lineheight});
		li.find("header p span.flypiconBig").css({'font-size': this.fonts.icon});
		li.find("footer p span.flypiconBig").css({'font-size': this.fonts.icon});
		var cont = li.find("content");

		cont.css({'height': this.h * this.parts.content + "px"});
		
		var da_div = cont.find("div.rest");
		

		if (cont.find('span.mimage').length > 0) {
			var hasLazy = cont.find('span.mimage').attr("lazy") != undefined;
			//console.log("???",cont.find('span.mimage').attr("lazy"));
			var w = this.w;
			if (this.ratio1) w = this.h * this.parts.content;
			var imgElem = fl.getImageElem(m.media.image, w, this.h * this.parts.content);
			cont.find('span.mimage').replaceWith(imgElem);
			if(!hasLazy) {
				cont.find('span.mimage').css("background-image", 'url(' + cont.find('span.mimage').attr("lazy") + ')').removeAttr('lazy');
			}
			da_div.css({'width': '44%'});
		} else {
			da_div.css({'width': '100%'});
		}

		// set message text size
		// skip if elem has no text!
		var da_p = cont.find("p");
		if(da_p.length == 0 || da_p.text=="") {
			return;
		}
		cont.css('font-size','160px')		
		while (da_p.height() > cont.height() * (1-this.overlayarea)) {
			cont.css({'font-size': parseInt(cont.css('font-size'), 10) * 0.95 + "px"});
			if (parseInt(cont.css('font-size'),10) < 12) break;
		}
		
		var test = 0;
		while (da_p.height() < cont.height()*0.5) {
			cont.css({'font-size': parseInt(cont.css('font-size'), 10) * 1.03 + "px"});
			if (test++ > 3) {
				break;
			}
		}

	}

	proto.floater = function(){
		this.container.find(".flypContainer li").css('visibility', 'visible');
		
		if (this.data.length > 1 && this.displayitems > 1) {		
			//var li = this.container.find(".flypContainer li:last-child").detach();

			var img = li.find("content span.mimage");
			if (img.length > 0 && img.attr('lazy')) {
				img.css({'background-image': "url(" + img.attr('lazy') + ")"});
				img.removeAttr('lazy');
			}
			//this.container.find(".flypContainer").prepend(li);
			// load next image
			var li2 = this.container.find(".flypContainer li:last-child")
			var img2 = li2.find("content span.mimage");
			if (img2.length > 0 && img2.attr('lazy')) {
				img2.css({'background-image': "url(" + img2.attr('lazy') + ")"});
				img2.removeAttr('lazy');
			}
		}
	}
	
	proto.slider = function(){
		if (this.data.length > 1 && this.displayitems > 1) {
			var li = this.container.find(".flypContainer li:last-child").detach();

			var img = li.find("content span.mimage");
			if (img.length > 0 && img.attr('lazy')) {
				img.css({'background-image': "url(" + img.attr('lazy') + ")"});
				img.removeAttr('lazy');
			}
			li.css({display: "none", visibility: "visible"});
			this.container.find(".flypContainer").prepend(li);
			li.slideDown();
			// load next image
			var li2 = this.container.find(".flypContainer li:last-child")
			var img2 = li2.find("content span.mimage");
			if (img2.length > 0 && img2.attr('lazy')) {
				img2.css({'background-image': "url(" + img2.attr('lazy') + ")"});
				img2.removeAttr('lazy');
			}
		}
	}

	proto.fader = function(){
		if (this.data.length > 1 && this.displayitems > 1) {
			var flypContainer = this.container.find(".flypContainer");
			var li = flypContainer.find("li:first-child"); //.detach();
			var lilast = flypContainer.find("li:last-child");
			
			// do not animate when only 1 to display
			if( (li.attr("satelite") || lilast.attr("satelite")) && flypContainer.children().length == 2) {
				if(li.attr("satelite")) {
					lilast.css('visibility','visible');
					li.css('visibility','hidden');
				}
				if(lilast.attr("satelite")) {
					lilast.css('visibility','hidden');
					li.css('visibility','visible');
					flypContainer.append(li.detach());
				}

				return; 
			}
			// do not display if entry is satelite!
			if(li.attr("satelite")) {
				li.detach();
				flypContainer.append(li);
				// use next child
				li = flypContainer.find("li:first-child").detach();
			}

			var img = li.find("content span.mimage");
			if (img.length > 0 && img.attr('lazy')) {
				img.css({'background-image': "url(" + img.attr('lazy') + ")"});
				img.removeAttr('lazy');
			}
			
			li.css({display: "none"});
			flypContainer.append(li);
			li.css({'display':'none','visibility':'visible'}).fadeIn(1000);
			lilast.fadeOut(500,function(){
				$_(this).css({'visibility':'hidden','display':'block'});
			});
			// load next image
			var li2 = flypContainer.find("li:first-child");
			var img2 = li2.find("content span.mimage");
			if (img2.length > 0 && img2.attr('lazy')) {
				img2.css({'background-image': "url(" + img2.attr('lazy') + ")"});
				img2.removeAttr('lazy');
			}
		}
	}

	proto.resize = function() {
		var self = this;
		var fc = this.container.find(".flypContainer");
		if ($_("body").width() < this.mobileswitch) this.container.addClass ("mobile");
		else this.container.removeClass ("mobile");
		
		this.w = this.container.width();
		var h = this.container.height();
		
		if (h == 0 ) this.h = Math.ceil(this.w * 9 / 16);
		else this.h = h;
		
		this.flypparent.css({'height': this.h + "px"});
		
		var smaller = Math.min (this.h, this.w * 0.666);
		var thepart = Math.max(this.parts.header, this.parts.footer);
		this.fonts     = (this.env.headerfontsizes)?this.env.headerfontsizes: {'icon': Math.round(smaller * thepart * 0.4) + "px", 'text': Math.round(smaller * thepart * 0.5) + "px", 'smalltext':  Math.round(smaller * thepart * 0.34) + "px"};
		this.fonts.lineheight = Math.round(smaller * thepart * 0.5) + "px";
		
		$_.each(fc.children(),function(idx,li){
			self.setupli($_(li));
		});
		
		self.resizetriggered = false;
		
	}
	
	// static
	fl.log = function(s) {
		if (typeof console === "undefined"){
		    console={};
    		console.log = function(){
        		return;
    		}
		}
		console.log(s);
	}
	
	fl.getImageElem = function(image, w, h) {
		var imgValues = {
			'center_x': image.center?image.center.x:image.width/2,
			'center_y': image.center?image.center.y:image.height/2,
			'detail_x' : image.detail?image.detail.x:0,
			'detail_y' : image.detail?image.detail.y:0,
			'detail_width' : image.detail?image.detail.width:image.width,
			'detail_height' : image.detail?image.detail.height:image.height, 
			'zoom_mode' : image.zoom,
			'container_width': w,
			'container_height': h,
			'image_width': image.width,
			'image_height': image.height
		};

		var cssCalc = fl.calcImageProperties(imgValues);
		var elem = $_("<span class=\"mimage\"></span>").css(cssCalc);
		elem.attr('lazy', image.url);

		return elem;
	}
	
	fl.calcImageProperties = function(imgObj){

		var zoomFactor = 1;

		// Punkt, auf den hin der Bildausschnitt beschnitten wird, relativ zum ursprung von detail
		var boxCuttingCenterX = imgObj.center_x - imgObj.detail_x; //imgObj.x + (imgObj.boxX / 2);
		var boxCuttingCenterY = imgObj.center_y - imgObj.detail_y; // imgObj.y + (imgObj.boxY / 2);

		// Hoehe und Breite des Container, auf den das Bild angepasst werden soll
		var containerWidth = imgObj.container_width;
		var containerHeight = imgObj.container_height;
		var containerAr = containerWidth / containerHeight;

		// Abmessungen des Bildes
		var imgWidth = imgObj.image_width;
		var imgHeight = imgObj.image_height;
		var imgAr = imgWidth / imgHeight;

		// Abmessungen des Ausschnittes
		var selectX = imgObj.detail_x;
		var selectY = imgObj.detail_y;
		var selectWidth = imgObj.detail_width;
		var selectHeight = imgObj.detail_height;
		var selectAr = selectWidth / selectHeight;

		var zoom = imgObj.zoom_mode == 1;

		var refAr = zoom ? selectAr : imgAr;
		var refWidth  = zoom ? selectWidth  : imgWidth;
		var refHeight = zoom ? selectHeight : imgHeight;


		var sWidth  = imgWidth;
		var sHeight = imgHeight;

		var dWidth  = containerWidth;
		var dHeight = containerHeight;

		var scaleToWidth = false;
		var scaleToHeight = false;

		var cutting = false;
		var samear  = false;

		if ( containerAr == refAr ) {

			zoomFactor = containerWidth / refWidth;
			sHeight = zoom ? selectHeight : imgHeight; 
			sWidth  = zoom ? selectWidth : imgWidth;
			if ( ! zoom ) {
				scaleToWidth  = true;
				scaleToHeight = true;
			}

			samear = true;

		} else if ( containerAr > refAr ) { // wider container

			if ( zoom ) {

				sHeight = selectHeight;
				sWidth  = sHeight * containerAr;

				if ( sWidth < imgWidth ) {
					zoomFactor = containerHeight / selectHeight;
				} else {
					zoomFactor = containerWidth / imgWidth;
					sWidth  = imgWidth;
					sHeight = sWidth * 1/containerAr;
				}
			} else {
				scaleToWidth = true;
				zoomFactor = containerWidth / imgWidth;
				sWidth  = imgWidth;
				sHeight = sWidth * 1/containerAr;
			}
		} else { // higher container, scale to width

			if ( zoom ) {

				sWidth = selectWidth;
				sHeight  = sWidth / containerAr;

				if ( sHeight < imgHeight ) {
					zoomFactor = containerWidth / selectWidth;

				} else {
					zoomFactor = containerHeight / imgHeight;
					sHeight  = imgHeight;
					sWidth = sHeight * containerAr;
				}
			} else {
				scaleToHeight = true;
				zoomFactor = containerHeight / imgHeight;
				sHeight  = imgHeight;
				sWidth = sHeight * containerAr;
			}
		}

		var sx = scaleToWidth ? 0 : selectX;
		var sy = scaleToHeight ? 0 : selectY;

		// free space outside selection
		var padRatioX = (imgWidth - selectWidth) / selectX;
		var padRatioY = (imgHeight - selectHeight) / selectY;

		// cut ratio inside selection
		var cutRatioX = boxCuttingCenterX / selectWidth;
		var cutRatioY = boxCuttingCenterY / selectHeight;

		var selRectWidth  = selectWidth * zoomFactor;
		var selRectHeight = selectHeight * zoomFactor;

		var padd = 0;

		if ( scaleToWidth === false ) {
			if ( selRectWidth < containerWidth ) {
				padd = (containerWidth - selRectWidth) / padRatioX;
				sx -= padd / zoomFactor;
			} else {
				padd = (selRectWidth - containerWidth) * cutRatioX;
				sx += padd / zoomFactor;
				cutting = true;
			}
		}

		if ( scaleToHeight === false ) {
			if ( selRectHeight < containerHeight ) {
				padd = (containerHeight - selRectHeight) / padRatioY;
				sy -= padd / zoomFactor;
			} else {
				padd = (selRectHeight - containerHeight) * cutRatioY;
				sy += padd / zoomFactor;
				cutting = true;
			}
		}


		var selRectX = (selectX - sx) * zoomFactor;
		var selRectY = (selectY - sy) * zoomFactor;

		var bcx = ( imgObj.detail_x - sx )  * zoomFactor;
		var bcy = ( imgObj.detail_y - sy )  * zoomFactor;

		var margin_top = Math.round(sy * zoomFactor) * -1;

		margin_left = Math.round(sx * zoomFactor) * -1;
		width = Math.round(imgObj.image_width*zoomFactor);
		height = Math.round(imgObj.image_height*zoomFactor);

		if(margin_top+height < containerHeight){
			margin_top = containerHeight-height;
		}

		var result = {
				'margin-top' : margin_top,
				'margin-left' : margin_left,
				'width' : width,
				'height' : height,
				'display': 'block',
				'background-size' : "cover"
		};
		return result;
	}

	fl.formatTime = function(t) {
		var mDate = new Date(t);
		var jetzt = new Date();
		var retval = "";
		var diff   = jetzt.getTime() - mDate.getTime();
		
		if ( diff < 1 * 3600 * 1000 ) {
			retval = "vor " + Math.round(diff / 1000 / 60) + " Minuten";
		} else {
			function pad(x) {
				return (x < 10 ? "0" + x:x );
			}
		
			retval = pad(mDate.getHours()) + ":" + pad(mDate.getMinutes()) + " Uhr";	
				
			if ( diff > 12 * 3600 * 1000 ) {	
				retval = pad(mDate.getDate()) + "." + pad(mDate.getMonth() + 1) + "." + mDate.getFullYear();
			}
		}
		return retval;
	}
	
	fl.autoColor = function(elem) {
		//elem.css({'background-color':"rgba(255,128,128,"+ (1-Math.random()/2)+")"});
		if (elem.hasClass('plain')) elem.addClass("s" + Math.ceil(Math.random() * 8));
	}
	
	fl.mkvideoframe = function(envelope, w, h) {
		// w, h shall only be set if we have a fixed size (never for list/overlay)
	
		if (envelope.message.media === undefined && envelope.message.link === undefined) return;
		if (!envelope.message.media) envelope.message.media = {'av':{'url': envelope.message.link}, 'image': {}};
		//if (envelope.message.media.av === undefined) s3_layout_mkvideoframe_old (envelope, w, h);
	
		var ss = envelope.message.media.service;
		var uu = envelope.message.media.av.url?envelope.message.media.av.url:envelope.message.link;
	
		var aspectratio = w/h;
		if (isNaN(aspectratio) || !aspectratio) {
			var ww = envelope.message.media.av.width?envelope.message.media.av.width:envelope.message.media.image.width;   
			var hh = envelope.message.media.av.height?envelope.message.media.av.height:envelope.message.media.image.height;
			// most services w/o av.width/height
			var aspectratio = ww/hh;
			if (isNaN(aspectratio) || !aspectratio)  aspectratio = 16/9;
			if (uu.match(/externalPlayer/i) != null) aspectratio = 16/11;  // NDR Spezialbehandlung wg. Branding
			if (uu.match(/meerkat/i) != null)        aspectratio = 9/16;
		}
		var padpercent = Math.round(10000/aspectratio)/100;
	
		// build the video container
		var d = $_("<div>");
		d.addClass('videoparent');
		d.css({'position': 'relative', 'padding-bottom': padpercent + '%', 'height': '0', 'display': 'none'});  // PUT IN CSS
	
		var i = $_("<iframe>");
		i.addClass('videoframe');
		i.attr({'frameborder': '0', 'scrolling': 'no', 'webkitAllowFullScreen':'webkitAllowFullScreen', 'mozallowfullscreen':'mozallowfullscreen', 'allowFullScreen':'allowFullScreen'});
		i.css({'border': '0px none transparent', 'display' : 'none', 'width': '100%', 'height': '100%', 'position': 'absolute', 'top': 0, 'left': 0, }); // PUT IN CSS
	
		d.append(i);
			
		// preprocess urls (not getting embeddable players in media.av.url)
	
		uu = uu.replace(/^.*youtu.be\/(.+)$/i,                    'https://www.youtube.com/embed/$1?html5=1&amp;autoplay=1&amp;origin=http://flyp.tv');
		uu = uu.replace(/^.*www.youtube.com\/.*\?v=([^&#]+).*$/i, 'https://www.youtube.com/embed/$1?html5=1&amp;autoplay=1&amp;origin=http://flyp.tv');	
		uu = uu.replace(/^.*livestream.*accountId=([0-9]+).*eventId=([0-9]+).*$/i, 'https://livestream.com/accounts/$1/events/$2/player?autoPlay=true');
		uu = uu.replace(/^.*vimeo.*\/([0-9]+)$/i,                 'https://player.vimeo.com/video/$1?autoplay=1');
		uu = uu.replace(/^.*ustream.*\?cid=([0-9]+).*$/i,         'https://www.ustream.tv/embed/$1?v=3&amp;wmode=direct&amp;autoplay=1');
		if (uu.match(/media.tagesschau.de\/video/) != null) uu = envelope.message.media.av.playerurl;
		uu = uu.replace(/\.html/,'~player_autoplay-true.html');
		// ndr livestream
		// not fixable
		// über Medienklammer eingesammelt, wird ein video/sophorandr angelegt, das aber fehlerhaft ist: http://www.ndr.de/fernsehen/livestream/index.html
		// kein Video über Extension
		// Workaround link / Layout video

	
		// working without mods: twitter, facebook, instagram, vine, ndr on-demand, bambuser, meerkat with special embed-url (needs twitter-login): http://widgets.meerkatapp.co/social/player/embed?username=christofurlopez&type=portrait&social=false&cover=default&mute=false&userid=&source=http%3A%2F%2Fdumdada.fkpscorpio.flyp.st%2Findex.html
		i.attr('llsrc', uu);

		return d;
	}
	
	fl.mkvideoframeold = function(envelope, w, h) {
		if(envelope.message.media === undefined) return;
		// preparing...
		var s = envelope.message.media.service;
		var k = envelope.message.media.key;
		var u = envelope.message.media.url;
		var auto = (envelope.message.media.attributes && envelope.message.media.attributes.autoplay) ? envelope.message.media.attributes.autoplay : false;
		var mute = (envelope.message.media.attributes && envelope.message.media.attributes.mute) ? envelope.message.media.attributes.mute : false;
		var loop = (envelope.message.media.attributes && envelope.message.media.attributes.loop) ? envelope.message.media.attributes.loop : false;
		var pofr = (envelope.message.media.attributes && envelope.message.media.attributes.posterframe) ? envelope.message.media.attributes.posterframe : false;
		var altr = (envelope.message.media.attributes && envelope.message.media.attributes.alternative) ? envelope.message.media.attributes.alternative : false;

		// go!
		var i = $_("<iframe>");
		i.addClass('videoframe');
		i.attr({'frameborder': '0', 'scrolling': 'no'});
		i.attr({'webkitAllowFullScreen':'webkitAllowFullScreen', 'mozallowfullscreen':'mozallowfullscreen', 'allowFullScreen':'allowFullScreen'});
		i.css({'border': '0px none transparent', 'display' : 'none', 'width': '100%', 'height':'100%'});
		if( s == 'facebook') {
			i.attr('llsrc', 'https://www.facebook.com/video/embed?video_id='+k);
		} else if (s == 'youtube' ) {
			//i.attr('llsrc', 'http://www.youtube.com/embed/' + k + '?html5=1&amp;autoplay=' + auto + '&amp;origin=http://flyp.tv');
			i.attr('llsrc', 'http://www.youtube.com/embed/' + k + '?html5=1&amp;autoplay=1&amp;origin=http://flyp.tv');
		} else if (s == 'vine') {
			//i.attr('llsrc', 'https://vine.co/v/'+ k +'/embed/simple');
			i.attr('llsrc', 'https://vine.co/v/'+ k +'/card');
			i.addClass('1x1');
			i.css("height", h*2);
			i.css("width", w);
		} else if (s == 'livestream.com') {
			i.attr('llsrc', 'http://cdn.livestream.com/embed/' + k + '?layout=4&amp;height=' + h + '&amp;width=' + w + '&amp;autoplay=' + auto);
		} else if (s == 'new.livestream.com') {
			i.attr('llsrc', u + '?autoPlay=' + auto + '&amp;width=' + w + '&amp;height=' + h + '&amp;mute=' + mute);
		} else if (s == 'vimeo') {
			i.attr('llsrc', 'http://player.vimeo.com/video/' + k + '?autoplay=1');
		} else if (s == 'ustream') {
			i.attr('llsrc', 'http://www.ustream.tv/embed/' + k + '?v=3&amp;wmode=direct');
		} else if (s == 'sophorandr') {

			var l = "";
			if (loop) l = "_loop-true";
			l += "_autoplay-true";
			//if (auto) l += "_autoplay-true";
			// FIXME feste groesse von sophora videos fuer eurovisionsseite!!!
			i.attr('llsrc', 'http://www.ndr.de/' + k + '-externalPlayer_width-'+ '518' +'_height-' + '291' + l + '.jsp');
		} else if (s == 'sophorats') {
			var l = "";
			if (loop) l = "_loop-true";
			l += "_autoplay-true";
			//if (auto) l += "_autoplay-true";
			// FIXME feste groesse von sophora videos fuer eurovisionsseite!!!
			i.attr('llsrc', 'http://www.tagesschau.de/multimedia/video/' + k + '~player_' + l + '.html');
		
		} else if (s == 'http') {
			// will not work for IE 7
			// if (yLib.isIEVersion(0,7)) return;
		
			var p = "";
			if (pofr) p = '&p=' + encodeURIComponent(pofr);
			if (altr) p += '&v2=' + encodeURIComponent(altr);
			i.attr('llsrc', 'http://jwplayer.flyp.tv/?w=' + w + '&h=' + h + '&a=' + auto + '&m=' + mute + '&l=' + loop+ '&v=' + encodeURIComponent(u) + p);
		} else if (s == 'rtmp' || s == 'rtmpt') {
			// will not work for IE 7
			// if (yLib.isIEVersion(0,7)) return;
		
			var p = "";
			if (pofr) p = '&p=' + encodeURIComponent(pofr);
			if (altr) p += '&v2=' + encodeURIComponent(altr);
			i.attr('llsrc', 'http://jwplayer.soviet.tv/?w=' + w + '&h=' + h + '&a=' + auto + '&m=' + mute + '&l=' + loop+ '&v=' + encodeURIComponent(u) + p);
		} else if(s == 'opengraph'){
			i.attr('llsrc', envelope.message.media.url);
		
	
		} else if(!!document.createElement('video').canPlayType && s == 'instagram'){
			var vid = $_('<video>').addClass('videoframe 16x19').attr('width', '100%').attr('height', '100%').attr('controls', '').attr('autoplay', '').hide();
			vid.append('Dieser Browser wird von Instagram nicht unterstützt!');
			if(envelope.message.media.url){
				vid.append($_('<source>').attr('llsrc', envelope.message.media.url).attr('type', 'video/mp4'));
			}
			//if(envelope.message.media.source) i.attr('llsrc', envelope.message.media.source + (envelope.message.media.source.lastIndexOf('/') != envelope.message.media.source.length -1 ? '/embed' : 'embed'));
			return vid;
		} else if(s == 'instagram'){
			i.addClass('16x19');
			if(envelope.message.media.source) i.attr('llsrc', envelope.message.media.source + (envelope.message.media.source.lastIndexOf('/') != envelope.message.media.source.length -1 ? '/embed' : 'embed'));
		}		
		return i;
	}
	
	// return the object
	return fl;
	
}(Flyp || {}, jQuery));