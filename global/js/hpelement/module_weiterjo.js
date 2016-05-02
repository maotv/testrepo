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

		this.v = new Flyp.Vienna({
			key: "http://" + env.event + "." + env.owner + ".flyp.tv/rio",
			root: "//d3kcx7oxb4qpd2.cloudfront.net/events/" + env.owner + "/" + env.event + "/rio"	
		});
		
		this.stream    = env.stream;
		this.interval  = (env.interval?env.interval:3000);
		this.w = this.flypparent.width();
		var h = this.flypparent.height();
		if (h == 0) {
			this.h = Math.ceil(this.w * 9 / 16);
			this.force169 = true;
		} else        this.h = h;

		//this.container.css({height: this.h + "px"});
		this.parts     = (env.parts)?env.parts:{header: 0.21, content: 0.79, footer:0};
		var smaller = Math.min (this.h, this.w * 0.666);
		var thepart = Math.max(this.parts.header, this.parts.footer);
		this.fonts     = (this.env.headerfontsizes)?this.env.headerfontsizes: {'icon': Math.round(smaller * thepart * 0.4) + "px", 'text': Math.round(smaller * thepart * 0.36) + "px", 'smalltext':  Math.round(smaller * thepart * 0.34) + "px"};
		this.imagevariant = (env.imagevariant)?env.imagevariant:'small';
		this.autocolor = !(env.autocolor === false);
		this.animate   = !(env.animate === false);
		this.autoresize= !(env.autoresize === false);
		this.animfunc  = (env.animfunc == "fade")? this.fader: (env.animfunc == "slide")? this.slider:this.floater;
		this.overlayarea  = (env.overlayarea)?env.overlayarea * 1: 0.25;
		this.poll         = (env.poll === true);
		this.pollinterval = (parseInt(env.pollinterval, 10) > 0)?parseInt(env.pollinterval, 10):120000;
		
		this.forceclear  = (env.forceclear === true);
		
		if (env.template) this.template  = env.template;
		else {
			this.template = '\
<li class="STYLE CSERVICE">\
	<header>\
		<p>SERVICEICON USERICON USERNAME MTIME USERHANDLE MSERVICE</p>\
	</header>\
	<content>\
		MIMG\
		<p>MTEXT</p>\
	</content>\
	<footer>\
	</footer>\
</li>';

		} 
		this.fonts.lineheight = Math.round(smaller * Math.max(this.parts.header, this.parts.footer) * 0.3) + "px";
		
		if (this.forceclear) this.container.empty();
				
		this.start();
		
		if (!this.playingVideo && this.animate && !this.failed) {
			clearInterval(this.intervalID);
			this.intervalID = window.setInterval(
				(function(self) {			//Self-executing func which takes 'this' as self
					return function() {		//Return a function in the context of 'self'
						self.animfunc(); 		//Thing you wanted to run as non-window 'this'
					}
				})(this), this.interval);
		}
		
		var self = this;
		if (this.autoresize) {
			$_(window).resize( function() {  // resize-Events sammeln (500ms)
				if (self.resizetriggered) return;
				window.setTimeout(
					(function(self1) {			//Self-executing func which takes 'this' as self
						return function() {		//Return a function in the context of 'self'
							self1.resize(); 		//Thing you wanted to run as non-window 'this'
							self1.resizetriggered = false;
						}
					})(self), 
				500);
				self.resizetriggered = true;
			});
		}
		
		if (this.poll) {
			window.setTimeout(
				(function(self1) {			//Self-executing func which takes 'this' as self
					return function() {		//Return a function in the context of 'self'
						self1.startEmpty(); 		//Thing you wanted to run as non-window 'this'
					}
				})(self), 
			this.pollinterval);
		
		}
	}
	
	fl.Module = Module;  // use as Flyp.Module
	
	// instance methods
	var proto = Module.prototype;

	proto.start = function() {	
		this.startEmpty();
	}
	
	proto.startEmpty = function() {	
		var self = this;
		
		this.v.pollStreamInitialData(this.stream, function(envelopeArray, metaData) { 
			self.data = envelopeArray;
			this.playingVideo = false;
			
			for(var i in self.data) {
				var m = self.data[i].message;
				if (m.link && String(m.link).indexOf("externalPlayer") > -1) {
					// is the video already built?
					var vid = self.container.find("iframe");
					if (!(vid.length > 0 && vid.attr("src") == String(m.link))) {
						self.container.find(".flypContainer").empty();
						self.buildVideo( self.data[i] );
					}
					self.playingVideo = true;
				}
			}
			
			if (!self.playingVideo) {
				self.container.find(".flypContainer").empty();
				self.buildAll();
			
				if (self.data.length > 1) {
					self.container.find("li").css({visibility: "hidden"});
					self.animfunc();
				} else {
					self.container.find("li").css({visibility: "visible"});
				}
			}
			if (self.poll) {
				window.setTimeout(
					(function(self1) {			//Self-executing func which takes 'this' as self
						return function() {		//Return a function in the context of 'self'
							self1.startEmpty(); 		//Thing you wanted to run as non-window 'this'
						}
					})(self), 
				self.pollinterval);
			}
		});
	}

	proto.checkContainer = function() {
		if(this.container.length == 0) {
			fl.log("no container found! please insert &gtdiv id=\"" + this.env.container + "\"/> at desired position inside your html!");
			return;
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
			if (j++ > 20) break;
			var li = this.buildElement(this.data[i]);
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
		var c = this.container.find(".flypContainer");
		var vid = c.find('iframe');
		if (vid.length == 0) {
			vid = $_("<iframe allowfullscreen=\"allowfullscreen\"></iframe>");
			c.append(vid);
			vid.attr('src', envlp.message.link);
		}
		var aspect = 16/9;
		var w = c.height() * aspect;
		var offs = (c.width() - w) /2;
		vid.css({width: w, height: c.height(), 'margin-left': offs});
	}

	proto.buildElement = function(envelope) {
		if (!envelope.message) return;
		var m = envelope.message;
		var hasImage = m.media && m.media.image && m.media.image.url;
		var showconditionalheadline = hasImage && m.service && (m.service == 'flyphq' || m.service == 'opengraph' || m.service == 'mail');
		
		elem = this.template
			.replace(/USERSERVICELINEORHEADLINE/, showconditionalheadline?'MHEADLINE MTIME' : 'USERSERVICELINE')
			.replace(/USERSERVICELINE/, 'SERVICEICON USERNAME MTIME USERHANDLE MSERVICE')
			
			.replace(/CSERVICE/, m.service)
			.replace(/STYLE/, m.style)
			.replace(/MHEADLINE/, m.headline)
			.replace(/MTEXT/, m.headline? m.headline + ": " + m.text : m.text)
			.replace(/MIMG/, hasImage? '<span class="mimage"></span>':'')
			.replace(/USERICON/, m.user && m.user.icon?'<img onerror="this.style.display=\'none\'" class="icon" src="' + m.user.icon.replace('http:', '') + '"></img>':'')
			.replace(/USERNAME/, m.user && m.user.name?'<span class="name">' + m.user.name + '</span>':'')
			.replace(/USERHANDLE/, m.user && m.user.handle && m.service != 'mail' && m.user.name != m.user.handle ?'<span class="handle">' + m.user.handle + '</span>':'')
			.replace(/MTIME/, m.time?'<span class="time">' + fl.formatTime(m.time) + '</span>':'')
			.replace(/MSERVICE/g, m.service && m.service != 'flyphq'?'<span class="service">'+ m.service +'</span>':'')
			.replace(/SERVICEICON/, m.service?'<span class="flypiconBig serviceicon_'+m.service+'"></span>':'')
			.replace(/LINK/, m.link?'<a target="_blank" href="'+m.link+'">':'')
			.replace(/ENDLINK/, m.link?'</a>':'')
		var li = $_(elem);

		this.container.find(".flypContainer").append(li);
		if (hasImage) {
			m.media.image.url = m.media.image.url.replace(/:large/, ':' + this.imagevariant);
			//m.media.image.url = m.media.image.url.replace('http://tv.ypics.de', 'https://d3kcx7oxb4qpd2.cloudfront.net/ypics');
			m.media.image.url = m.media.image.url.replace('http://tv.ypics.de', 'https://d32odw1frluegp.cloudfront.net');
		}
		
		if (this.autocolor) fl.autoColor(li);
		
		this.setupli(li, m);
		return li;
	}
	
	
	proto.setupli = function(li, m) {
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
		if (cont.find('span.mimage').length > 0) {
			var imgElem = fl.getImageElem(m.media.image, this.w, this.h * this.parts.content);
			cont.find('span.mimage').replaceWith(imgElem);
		}

		if (true) {
			// set message text size
						
			while (cont.find("p").height() > cont.height() * (1-this.overlayarea)) {
				cont.css({'font-size': parseInt(cont.css('font-size'), 10) * 0.95 + "px"});
				if (parseInt(cont.css('font-size'),10) < 12) break;
			}
			
			var test = 0;
			while (cont.find("p").height() < cont.height()*0.5) {
				cont.css({'font-size': parseInt(cont.css('font-size'), 10) * 1.03 + "px"});
				if (test++ > 3) {
					break;
				}
			}
		}

	}

	proto.floater = function(){
		if (this.data.length > 1) {		
			var li = this.container.find(".flypContainer li:last-child").detach();

			var img = li.find("content span.mimage");
			if (img.length > 0 && img.attr('lazy')) {
				img.css({'background-image': "url(" + img.attr('lazy') + ")"});
				img.removeAttr('lazy');
			}
			this.container.find(".flypContainer").prepend(li);
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
		if (this.data.length > 1) {
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
		if (this.data.length > 1) {
			var li = this.container.find(".flypContainer li:first-child").detach();
			var lilast = this.container.find(".flypContainer li:last-child");

			var img = li.find("content span.mimage");
			if (img.length > 0 && img.attr('lazy')) {
				img.css({'background-image': "url(" + img.attr('lazy') + ")"});
				img.removeAttr('lazy');
			}
			
			li.css({display: "none", visibility: "visible", position: 'absolute', top:0 });
			this.container.find(".flypContainer").append(li);
			li.fadeIn(1000);
			lilast.fadeOut(500);
			// load next image
			var li2 = this.container.find(".flypContainer li:first-child");
			li2.css({visibility: "hidden"});
			var img2 = li2.find("content span.mimage");
			if (img2.length > 0 && img2.attr('lazy')) {
				img2.css({'background-image': "url(" + img2.attr('lazy') + ")"});
				img2.removeAttr('lazy');
			}
		}
	}

	proto.resize = function() {
		var fc = this.container.find(".flypContainer");
		if ($_("body").width() < this.mobileswitch) this.container.addClass ("mobile");
		else this.container.removeClass ("mobile");
		
		this.w = this.flypparent.width();
		var h = this.flypparent.height();
		if (h == 0 || this.force169) this.h = Math.ceil(this.w * 9 / 16);
		else this.h = h;
		//this.flypparent.css({height: this.h + "px"});
		var smaller = Math.min (this.h, this.w * 0.666);
		var thepart = Math.max(this.parts.header, this.parts.footer);
		this.fonts     = (this.env.headerfontsizes)?this.env.headerfontsizes: {'icon': Math.round(smaller * thepart * 0.4) + "px", 'text': Math.round(smaller * thepart * 0.36) + "px", 'smalltext':  Math.round(smaller * thepart * 0.34) + "px"};
		this.fonts.lineheight = Math.round(smaller * thepart * 0.3) + "px";
		if (!this.playingVideo) {
			fc.empty();
			this.buildAll();
			this.animfunc();
		} else this.buildVideo();
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
			'detail_x' : image.detail?image.detail.x:false,
			'detail_y' : image.detail?image.detail.y:false,
			'detail_width' : image.detail?image.detail.width:false,
			'detail_height' : image.detail?image.detail.height:false, 
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

	
	// return the object
	return fl;
	
}(Flyp || {}, jQuery));