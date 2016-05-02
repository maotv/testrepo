var theImage = new Image();

function s3_layout_mktext(frame, envelope, cfg) {
	var d = s3_layout_mkdiv(frame, envelope, cfg);
	// jetzt aus frame.cfg:
	d.addClass(envelope.message.style);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	var p = ce("p");
	p.addClass("headline");
	if( ck(envelope.message.headline) ) p.html(envelope.message.headline);
	tc.append(p);	
	var p = ce("p");
	p.addClass("text");  
	p.html(s3_parse_messagetext(envelope.message.text)); 
  	tc.append(p);
  	
  	s3_layout_mkinfo(d, envelope);
		
  	return d;
}

function s3_layout_mktextbig(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	var p = ce("p");
	p.addClass("text textbig");  
	p.html(s3_parse_messagetext(envelope.message.text));
  	tc.append(p);
  	
  	s3_layout_mkinfo(d, envelope);
  		
  	return d;
}

function s3_layout_mktime(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	var p = ce("p");
	p.addClass("text texthuge");  
	p.html(s3_parse_messagetext(envelope.message.text));
  	tc.append(p);
  	
  	s3_layout_mkinfo(d, envelope);
  	
  	return d;
}

function s3_layout_mktextsmall(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	var p = ce("p");
	p.addClass("headline");  
	if( ck( envelope.message.headline ) ) {
		p.html(envelope.message.headline);
			
	}
	tc.append(p);
	
	p = ce("p");
	p.addClass("text textsmall");  
	p.html(s3_parse_messagetext(envelope.message.text));
  	tc.append(p);
  	
  	s3_layout_mkinfo(d, envelope);
  	
  	return d;
}

function s3_layout_mktextlink(frame, envelope) {
	var d, p;
	d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	var p = ce("p");
	p.addClass("headline");  
	if( ck(envelope.message.headline) ) p.html(envelope.message.headline);
	tc.append(p);	
	p = ce("p");
	p.addClass("text");  
	p.html(s3_parse_messagetext(envelope.message.text));  // parse should be removed when link is implemented properly
  	tc.append(p);
  	var tl = s3_layout_mk_link(envelope);
	if( tl ) {
		d.append(tl);	
	}
  	return d;
}

function s3_layout_mkmessage(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	if( ck( envelope.message.headline ) ) {
		var p = ce("p");
		p.addClass("headline");  
		p.html(envelope.message.headline);
		tc.append(p);	
	}
	var p = ce("p");
	p.addClass("text");  
	p.html(s3_parse_messagetext(envelope.message.text));
  	tc.append(p);
  	
	if( ck(envelope.message.user.name) || ck(envelope.message.user.handle) ) {
		//var us = s3_layout_mk_user(tc, envelope, frame);
		s3_layout_mk_user(d, envelope, frame);
	}
	if(envelope.message.link) {
  		d.on("click", function() { 
  			window.open(envelope.message.link);
  		});
  		d.addClass("cptr");
  	};
	
  return d;
}

function s3_layout_mkmessagebig(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	var p = ce("p");
	p.addClass("text textbig");  
	p.html(s3_parse_messagetext(envelope.message.text));
  	tc.append(p);
	if( ck(envelope.message.user.name) || ck(envelope.message.user.handle) ) {	
		//s3_layout_mk_user(tc, envelope, frame);
		s3_layout_mk_user(d, envelope, frame);
	}
	if(envelope.message.link) {
  		d.on("click", function() { 
  			window.open(envelope.message.link);
  		});
  		d.addClass("cptr");
  	};

  return d;
}

var xHeight = 0;
function s3_layout_mkimage(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	if( ck( envelope.message.media )  && ck( envelope.message.media.url ) ) {
		d.attr("mediaurl", envelope.message.media.url);
		
		if(frame.type != "list")
		{	
			var i = ce("div");
			setImageSource(i, envelope.message.media.url, envelope.lazy);
			i.css("background-size", "cover");
			i.addClass("image");
			d.append(i);
		} 
			else
		{
			var i = ce("img");
			setImageSource(i, envelope.message.media.url, envelope.lazy);
			//i.addClass("image");
			i.css("width", "100%");
			i.css("height", "auto");
			d.css("height","auto");

			d.append(i);
			
			var connDiv = ce("div");
			connDiv.addClass('connect');
			d.append(connDiv);

			var ficoDiv = ce("div");
			ficoDiv.addClass('flypicon flypiconConnect');
			ficoDiv.text('i');
			connDiv.append(ficoDiv);
		}
		

		var p = $(document.createElement("p"));

		if( ck( envelope.message.text ) ) {
			p.addClass("text");  
			p.css("z-index","2");
			
			p.addClass("transparent");
			var span = $(document.createElement("span"));
			span.addClass("infoblock");
			p.append(span);
			span.html(s3_parse_messagetext(envelope.message.text));
			//p.css("width", "100%");
			
		}

		if(frame.type != "list"){
			d.append(p);
		} else {
			//console.log("==list:");
			//d.remove('.tilecontent');
			connDiv.append(p);
		
			var p2 = ce("p");
			p2.addClass("headline");
			if( ck(envelope.message.headline) ) p2.html(envelope.message.headline);
			p.prepend(p2);
			p.append(d.find(".userImageContainer").detach());
		}

	}	
  	return d;
}

function s3_layout_mkimagelink(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	if( envelope.message.media && ck( envelope.message.media.url ) ) {
		d.attr('mediaurl', envelope.message.media.url);
		/*
		var i = ce("img");
		i.attr("src", envelope.message.media.url )
		i.addClass("image");
		d.append(i);
		*/
		/*var i = ce("div");
		i.css("background-image", "url(" + envelope.message.media.url + ")" );
		i.css("background-size", "cover");
		i.addClass("image");
		d.append(i);*/

		if(frame.type != "list")
		{	
			var i = ce("div");
			setImageSource(i, envelope.message.media.url, envelope.lazy);
			i.css("background-size", "cover");
			i.addClass("image");
			d.append(i);
		} 
			else
		{
			var i = ce("img");
			setImageSource(i, envelope.message.media.url, envelope.lazy);
			//i.addClass("image");
			i.css("width", "100%");
			i.css("height", "auto");
			d.css("height","auto");
			d.append(i);
			
			var connDiv = ce("div");
			connDiv.addClass('connect');
			d.append(connDiv);

			var ficoDiv = ce("div");
			ficoDiv.addClass('flypicon flypiconConnect');
			ficoDiv.text('i');
			connDiv.append(ficoDiv);
		}

		var tl = s3_layout_mk_link(envelope);
		if( tl ) {
			if(frame.type != "list"){
				d.append(tl);
			} else {
				connDiv.append(tl);
				
			}
		}
	}	
  return d;
}

function s3_layout_mkteaser(frame, envelope) {

	var d = s3_layout_mkdiv(frame, envelope);
	if( envelope.message.media && ck( envelope.message.media.url ) ) {
		var i = ce("div");
		setImageSource(i, envelope.message.media.url, envelope.lazy);
		i.addClass("teaserImage");
		d.append(i);
	}
	var ol = ce("div");
	ol.addClass("teaserTextContainer");

	var tt = ce("div");
	tt.addClass("teaserText");
	ol.append(tt);
	
	var p = ce("p");
  	p.addClass("headline");  
  	p.html(envelope.message.headline);
  	tt.append(p);	
  
  	if( ck( envelope.message.text ) ) {
    	var p = ce("p");
    	p.addClass("text");  
    	p.html(s3_parse_messagetext(envelope.message.text));
    	tt.append(p);
  	}
  	d.append(ol);
  
  	if(envelope.message.link) {
  		d.on("click", function() { 
  			window.open(envelope.message.link);
  		});
  		d.addClass("cptr");
  	};
  
  return d;
}

function s3_layout_mkpostcard(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	//var i = ce("img");
	
		
	if(frame.type != "list")
	{	
		if( ck( envelope.message.media )  && ck( envelope.message.media.url ) ) {
			var i = ce("div");
			setImageSource(i, envelope.message.media.url, envelope.lazy);
			i.css("background-size", "cover");
			i.addClass("image");
			d.append(i);
		}
	} 
		else
	{
		if( ck( envelope.message.media )  && ck( envelope.message.media.url ) ) {
			var i = ce("img");
			setImageSource(i, envelope.message.media.url, envelope.lazy);
			i.css("width", "100%");
			i.css("height", "auto");
			d.append(i);
		}
		d.css("height","auto");

		var connDiv = ce("div");
		connDiv.addClass('connect');
		d.append(connDiv);

		var ficoDiv = ce("div");
		ficoDiv.addClass('flypicon flypiconConnect');
		ficoDiv.text('i');
		connDiv.append(ficoDiv);
	}
	

	
	
	if( ck(envelope.message.user.name) || ck(envelope.message.user.handle) ) {	
		// var p = s3_layout_mk_user(d, envelope, frame);
		if(frame.type != "list"){
			var p = s3_layout_mk_user(d, envelope, frame);
		} else {
			var p = s3_layout_mk_user(connDiv, envelope, frame);
		}
		
		//p.css("width", d.width());
		p.addClass("transparent");
	}
		
	return d;
}

function s3_layout_mkpostcardtext(frame, envelope) {
	
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
		
	if(frame.type != "list")
	{			
		d.append(tc);
		if( ck( envelope.message.media )  && ck( envelope.message.media.url ) ) {
			var i = ce("div");
			setImageSource(i, envelope.message.media.url, envelope.lazy);
			i.css("background-size", "cover");
			i.addClass("image");
			d.append(i);
		}

	} 
	else
	{
		tc.remove();
		if( ck( envelope.message.media )  && ck( envelope.message.media.url ) ) {
			var i = ce("img");
			i.css("width", "100%");
			i.css("height", "auto");
			//$(i).on('load.imageCutter', onLoadImagesList);
			setImageSource(i, envelope.message.media.url, envelope.lazy);
			d.append(i);
		}
		d.css("height","auto");

		var connDiv = ce("div");
		connDiv.addClass('connect');
		d.append(connDiv);

		var ficoDiv = ce("div");
		ficoDiv.addClass('flypicon flypiconConnect');
		ficoDiv.text('i');
		connDiv.append(ficoDiv);
	}
	
	
	if(frame.type != "list"){
		var p = s3_layout_mk_user(d, envelope, frame);
	} else {
		var p = s3_layout_mk_user(connDiv, envelope, frame);
	}

	p.addClass("transparent_postcard");
	
		
	if( ck( envelope.message.text ) && p != undefined ) {
		var d2 = ce("div");
		d2.addClass("text");
		var debu = envelope.message.text;
		d2.html(s3_parse_messagetext(debu));
		p.prepend(d2);
	} 
	if(frame.type == "list"){
		var p2 = ce("p");
		p2.addClass("headline");
		if( ck(envelope.message.headline) ) p2.html(envelope.message.headline);
		p.prepend(p2);
		p.append(d.find(".userImageContainer").detach());
	}
	return d;
}

function s3_layout_mkvideo(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);		
	if( ck(envelope.message.media) || ck(envelope.message.link)) {
		var h = frame.size.height;
		var w = frame.size.width;

		if(envelope.framesize && envelope.framesize.height && envelope.framesize.width){
			h = envelope.framesize.height;
			w = envelope.framesize.width;		
		}

		// FIXME iframes auf 100% breite und hoehe setzen damit ueberall richtig
		// FIXME Hack für Listenclient Eurovision
		// FIXME...
		w = h = "100%";
		if( frame.type == "list" ) h = '326px';
				
		// <div class="cptr flypicon playVideoKachel" title="Video starten">P</div>
		var play = $('<div>');
		play.attr("title", "Video starten" );
		play.addClass("playVideoKachelContainer startVideo");
		
		var btn = $('<div>');
		btn.addClass("cptr flypicon playVideoKachel");
		btn.text("P");

		
		var pd1 = $('<div>');
		pd1.addClass("double-bounce1");
		pd1.css("display", "none");
		
		var pd2 = $('<div>');
		pd2.addClass("double-bounce2");
		pd2.css("display", "none");
		
		play.append(btn);
		play.append(pd1);
		play.append(pd2);
		
		d.append(play);

		var preview = frame.type == 'list' ? $('<img>') : $('<div>').css('background-size', 'cover');
		preview.addClass('startVideo img');
		
		preview.on('imageLoaded.list imageLoaded.nolist imageLoaded.sizeSet', function(ev, image){
			if(frame.type == 'list'){
				var tileDiv = $(ev.target).closest('div.tile');
				// var playHeight = $(ev.target).parent().parent().hasClass('guillotine-window') ? $(ev.target).parent().parent().outerHeight() : $(ev.target).height();
				var playHeight = tileDiv.find('.guillotine-window').length > 0 ? tileDiv.find('.guillotine-window').outerHeight() : $(ev.target).height();
				//console.log('img height', playHeight, outDiv,$('.guillotine-window'));
				play.css('top', playHeight / 2);
			}
			
		});		
		
		if (envelope.message.media) {
			var posta = (envelope.message.media.image && envelope.message.media.image.url)?envelope.message.media.image.url:envelope.message.media.poster; //FIXME RETRO
			setImageSource(preview, posta, envelope.lazy);
			//preview.attr('src', envelope.message.media.poster);
			// FIXME vorlaeufig
			preview.width('100%');
			preview.height('100%');
			if(frame.type == 'list') {
				preview.css("max-height", "360px");
				if (envelope.message.media && envelope.message.media.image) {
					var tmpimg = envelope.message.media.image;
					var tmph = tmpimg.height / tmpimg.width * frame.size.width;
					if (tmph) preview.css("max-height", tmph + "px");
				}
			}
			//if(frame.type == 'list' && !envelope.message.media.image.zoom)	preview.css("max-height", "360px");	
			// FIXME again!
			// hack fuer video in double kachel, http://mauerfall.tagesschau.flyp.cc/classic.html
			if( frame.size.height == "360" && frame.size_name == 'double') {
				//console.log('again');
				preview.height('180px');
				preview.css('margin-top','95px');
			}
		
			d.append(preview);
		}
		$('.startVideo', d).click(function(){
			
			
			var btn =  play.find('.playVideoKachel');
			var pd1 =  play.find('.double-bounce1');
			var pd2 =  play.find('.double-bounce2');
			
			btn.css("display", "none");
			pd1.css("display", "block");
			pd2.css("display", "block");
						
			var videoframe = $(this).parent().find('.videoframe');
			if(videoframe.attr('llsrc')){
				
				videoframe.attr('src', videoframe.attr('llsrc'));
				videoframe.removeAttr('llsrc');
				videoframe.load(function(ev){

					$(this).unbind('load');
					var videoframe = $(this);
					if(videoframe.attr('src').indexOf('vine') != -1){
						videoframe.attr('src', videoframe.attr('src'));
					}
					var daparent = $(this).closest('.tile')
					daparent.find('.startVideo').hide();
					daparent.find('.guillotine-window').hide();
					if(daparent.find('video').length > 0){
						$(this).parent().find('video').show();
					} else {
						$(this).parent().find('iframe').show();
					}
					daparent.find('.videoparent').show();
				});
			} else if($('source', videoframe).attr('llsrc')){
				videoframe.bind('loadedmetadata', function(ev){
					if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
						$(this).attr('height', this.videoHeight/this.videoWidth*$(this).outerWidth());
					}
					
				});
				$('source', videoframe).each(function(){
					$(this).attr('src', $(this).attr('llsrc'));
					$(this).removeAttr('llsrc');
				});

				videoframe.load();
				$(this).parent().find('.startVideo').hide();
				$(this).parent().find('.guillotine-window').hide();
				videoframe.show();
				
			}
		});

		var vf = s3_layout_mkvideoframe (envelope, w, h);
		d.append(vf);				
		
		if( frame.type == "overlay" || frame.type == "list" ) // video auch mit message
		{
		
			var tc = ce("div");
			tc.addClass('tilecontent');
			d.append(tc);
			if( ck( envelope.message.headline ) ) {
				var p = ce("p");
				p.addClass("headline");  
				p.html(envelope.message.headline);
				tc.append(p);	
			}
			var p = ce("p");
			p.addClass("text");  
			p.html(s3_parse_messagetext(envelope.message.text));
			tc.append(p);
	
			if( ck(envelope.message.user.name) || ck(envelope.message.user.handle) ) {
				s3_layout_mk_user(d, envelope, frame);
			}
		}
	}
	return d;
}


function s3_layout_mkiframe(frame, envelope)
{

	if(!envelope.message.link || envelope.message.link == "") return;
	var d = s3_layout_mkdiv(frame, envelope);
	var i = ce("iframe");

	if (envelope.framesize && frame.type == "list") {
		i.css("height", envelope.framesize.height);
		i.css("width", envelope.framesize.width);
	} else {
		if (parseInt(frame.size.height, 10) > 0) i.css("height", frame.size.height);
		i.css("width", frame.size.width);
	}
	i.attr({'webkitAllowFullScreen':'webkitAllowFullScreen', 'mozallowfullscreen':'mozallowfullscreen', 'allowFullScreen':'allowFullScreen'});
	i.attr("src", envelope.message.link);
	d.append(i);
	return d;
}


function s3_layout_mkvideoframe (envelope, w, h) {
	// w, h shall only be set if we have a fixed size (never for list/overlay)
	
	if (envelope.message.media === undefined && envelope.message.link === undefined) return;
	if (!envelope.message.media) envelope.message.media = {'av':{'url': envelope.message.link}, 'image': {}};
	
	var ss = envelope.message.media.service;
	var uu = envelope.message.media.av.url?envelope.message.media.av.url:envelope.message.link;
	if (!uu) uu = "";
	
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
	var d = ce("div");
	d.addClass('videoparent');
	d.css({'position': 'relative', 'padding-bottom': padpercent + '%', 'height': '0', 'display': 'none'});  // PUT IN CSS
	
	var i = ce("iframe");
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
	if (uu.match(/media.tagesschau.de\/video/) != null) {
		uu = envelope.message.media.av.playerurl;
		uu = uu.replace(/\.html/,'~player_autoplay-true.html');
	}
	// ndr livestream
	// not fixable
	// über Medienklammer eingesammelt, wird ein video/sophorandr angelegt, das aber fehlerhaft ist: http://www.ndr.de/fernsehen/livestream/index.html
	// kein Video über Extension
	// Workaround link / Layout video

	
	// working without mods: twitter, facebook, instagram, vine, ndr on-demand, bambuser, meerkat with special embed-url (needs twitter-login): http://widgets.meerkatapp.co/social/player/embed?username=christofurlopez&type=portrait&social=false&cover=default&mute=false&userid=&source=http%3A%2F%2Fdumdada.fkpscorpio.flyp.st%2Findex.html
	i.attr('llsrc', uu);

	return d;
	
	
}


function s3_layout_mkvideoframe_old (envelope, w, h) {

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
	console.log(fram);
	console.log(envelope);
	var i = ce("iframe");
	i.addClass('videoframe');
	i.attr({'width': w, 'height':h, 'frameborder': '0', 'scrolling': 'no'});
	i.attr({'webkitAllowFullScreen':'webkitAllowFullScreen', 'mozallowfullscreen':'mozallowfullscreen', 'allowFullScreen':'allowFullScreen'});
	i.css({'border': '0px none transparent', 'display' : 'none'});

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
	} else if (s == 'twitter') {
		var u = envelope.message.media.av.url; // this is the right place to look...
		var aspect = '16:9';
		var auto   = 1;
		

		i.attr('llsrc', 'http://jwplayer.flyp.st/?asp='+ encodeURIComponent(aspect) +'&a=' + auto + '&m=' + mute + '&l=' + loop+ '&v=' + encodeURIComponent(u) );
	} else if (s == 'sophorandr') {

		var l = "";
		if (loop) l = "_loop-true";
		l += "_autoplay-true";
		//if (auto) l += "_autoplay-true";
		// FIXME feste groesse von sophora videos fuer eurovisionsseite!!!
		i.attr('llsrc', 'http://www.ndr.de/' + k + '-externalPlayer_width-'+ '518' +'_height-' + '291' + l + '.jsp');
/*		if (u) i.attr('src', u);
		else {
			var l = "";
			if (loop) l = "_loop-true";
			if (auto) l += "_autoplay-true";
			i.attr('src', 'http://www.ndr.de/' + k + '-externalPlayer_width-'+ w +'_height-' + h + l + '.html');

		}*/
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
		var vid = $('<video>').addClass('videoframe 16x19').attr('width', '100%').attr('height', '100%').attr('controls', '').attr('autoplay', '').hide();
		//console.log('instagram', envelope.message.media);
		vid.append('Dieser Browser wird von Instagram nicht unterstützt!');
		if(envelope.message.media.url){
			vid.append($('<source>').attr('llsrc', envelope.message.media.url).attr('type', 'video/mp4'));
		}
		//if(envelope.message.media.source) i.attr('llsrc', envelope.message.media.source + (envelope.message.media.source.lastIndexOf('/') != envelope.message.media.source.length -1 ? '/embed' : 'embed'));
		return vid;
	} else if(s == 'instagram'){
		i.addClass('16x19');
		if(envelope.message.media.source) i.attr('llsrc', envelope.message.media.source + (envelope.message.media.source.lastIndexOf('/') != envelope.message.media.source.length -1 ? '/embed' : 'embed'));
	}


	return i;
}


function s3_layout_mkchat(frame, envelope) {

	var d = s3_layout_mkdiv(frame, envelope);
	d.attr('id', 'chatboxdummy');
	// console.log(d);
	return d;
	//FIXME: wegen secondscreen chat auskommentiert, wird levontinisiert

	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	
	var f = ce("form");
	var inp = ce("input");
	inp.attr("type", "text");
	inp.val("Ihr Kommentar");
	f.append(inp);
	var sub = ce("input");
	sub.attr("type", "submit");
	sub.attr("value", "Go");
	f.append(sub);
	
	tc.append(f);
  return d;
}

function s3_layout_comment(tile, envelope) {
	var d = ce("div");
	var p = ce("p");
	p.html(s3_parse_messagetext(envelope.message.text));
	if(envelope.message.user != undefined)
	{
		var s = ce("span");
		
		var un = (envelope.message.user.name) ? envelope.message.user.name : "";
		var uh;
		if(un != "") {
			uh = (envelope.message.user.handle) ? " (" + envelope.message.user.handle + ")" : "";
		} else {		
			uh = (envelope.message.user.handle) ? envelope.message.user.handle : "";
		}
		
		if( un != "" && envelope.message.user.handle && (un == envelope.message.user.handle) )
		{
		  uh = "";
		}
		
		s.text(un + uh);
		p.append(s);
	}
	d.append(p);
	if( envelope.message.user.icon != "" )
	{
	  var im = ce("img");
	  im.attr( "src", envelope.message.user.icon )
	  //d.append(im)
	}
	return d;
}

function s3_layout_elcomment(tile, envelope) {
	var d = ce("div");
	var p = ce("p");
	
	if(envelope.message.user != undefined)
	{
		var s = ce("span");
		
		var un = (envelope.message.user.name) ? envelope.message.user.name : "";
		var uh;
		if(un != "") {
			uh = (envelope.message.user.handle) ? " (" + envelope.message.user.handle + ")" : "";
		} else {		
			uh = (envelope.message.user.handle) ? envelope.message.user.handle : "";
		}
		
		if( un != "" && envelope.message.user.handle && (un == envelope.message.user.handle) ) {
		  uh = "";
		}
		
		var userString = "<strong>" + un + uh + ":</strong> ";
		//s.text(un + uh);
		//p.append(s);
	}

	
	p.html( userString + s3_parse_messagetext(envelope.message.text));
	d.append(p);
	if( envelope.message.user.icon != "" ) {
	  var im = ce("img");
	  im.attr( "src", envelope.message.user.icon )
	  //d.append(im)
	}
	return d;
}


function s3_layout_mkslideshow(frame, envelope, thirdscreen) {
	var d = s3_layout_mkdiv(frame, envelope);
	
	if( ck(envelope.message.substream) ) {
		var slideshow = new SlideShow();
		slideshow.container = d;
		slideshow.thirdscreen = thirdscreen;
		slideshow.frame = frame;
		slideshow.layouts = ThirdLayout;
		slideshow.envelope = envelope;
		slideshow.autoplay = ThirdScreenConfig.SLIDESHOW_AUTOPLAY
		slideshow.isLazyLoading = true;
		slideshow.initShow();
	}



	if(false && frame.type == "list")
	{
		var p = s3_layout_mk_user(d, envelope, frame);
		p.addClass("transparent_postcard").addClass("info");
		
		if( ck( envelope.message.text ) ) {
			var d2 = ce("div");
			d2.addClass("text");
			var debu = envelope.message.text;
			d2.html(s3_parse_messagetext(debu));
			p.prepend(d2);
		} 

		var p2 = ce("p");
		p2.addClass("headline");
		if( ck(envelope.message.headline) ) p2.html(envelope.message.headline);
		p.prepend(p2);
		
		d.append(p);
	}
	
	
	return d;
}


/* -----------*/
/* HELFERLEIN */
/* -----------*/

function ce(tag) {
	return $(document.createElement(tag));
}

function ck(obj) {
	return(obj && obj != "");
}

function str(obj) {
	if ( ! obj ) return "";
	return String(obj);
}

function nullify(i){
	var s = "";
	if (i < 10) s = "0";
	return s + i;
};

// Implementation FlypIcon-Font

function s3_parse_messagetext(t) {
	t = t + " ";
	var ico = 'l'; //das l ist das Kuerzel für das LinkIcon, das im Flypicons.css / fonts definiert ist.
	// console.log(t);
  	t = t.replace(/\|/g, '<br/>'); // line breaks
  	//t = t.replace(/(http[^ ,]+)/gi, ' <a class="flypicon overlay" target="_blank" href="$1" title="$1">'+ico+'</a> ');
  	//t = t.replace(/(http[^\s,]+)/gi, function(match, contents, offset, s) {
  	t = t.replace(/(http[^\s]+)/gi, function(match, contents, offset, s) {
  		return '<a class="flypicon overlay" target="_blank" href="'+contents.replace(/(\.*)$/gi, '')+'" title="'+contents+'">'+ico+'</a> ';
  	});
  	// t = t.replace(/([^ ,:]+\@[^ ,]+\.[^\s,]+)/gi,' <a href="mailto:$1" title="$1">'+ico+'</a> ');
  	t = t.replace(/([^A-Za-z0-9]+)\@([A-Za-z0-9_]+)/gi,'$1<a class="overlay userhandle" target="_blank" href="http://twitter.com/$2" title="@$2">@$2</a> ');
  	// t = t.replace(/@([^ ,:]+)/gi,' <a class="overlay userhandle" target="_blank" href="http://twitter.com/$1" title="@$1">@$1</a> ');
  	t = t.replace(/\B#(\w*[a-zA-ZÄÖÜäöü]+\w*)/gi,' <a class="overlay hashtag" target="_blank" href="http://twitter.com/search?q=%23$1" title="#$1">#$1</a> ');
	// console.log(t);
  	
  //	\B#\w*[a-zA-Z]+\w*
  //	https://twitter.com/search?q=%23Tagesschau&src=hash
  	return t;
}

function s3_parse_messagetext2(e,t) {
  var self = this;
  t = s3_parse_messagetext(t)
  e.html(t)
    .find('.overlay')
      .click(function(){
        // wenn es klar ist, wie wir mit den verschiedenen links umgehen, (twitter geht nicht im iframe auf, z.b.) dann so:
        //the3rdscreen.openLinkOverlay( $(this).attr("href") );
        //return false;
      })
  
  return t;
}



function s3_layout_mkdiv(frame, envelope, cfg) {	
    
	var d = ce("div");
	d.attr("size_name", envelope.message.size); //frame.size_name);

	d.attr('mid', envelope.message.id);	
	d.attr('id',"e" + envelope.id);	
	d.attr('layout', envelope.message.layout);
	if(envelope.message.comments != undefined) {
	  	d.attr('comkey', envelope.message.comments.key);
    	d.attr('commit', envelope.message.comments.commit);
  	}
  	d.css("position", "relative");
  	
  	// neu: auch listenclient
	d.css("width", ( frame.type == "list" ) ? "auto" : (envelope.framesize != undefined) ? envelope.framesize.width : frame.size.width);
	d.css("height", ( frame.type == "list" ) ? "100%" : (envelope.framesize != undefined) ? envelope.framesize.height : frame.size.height);  
  
  	d.css("overflow", "hidden");
	d.addClass("tile"); // + frame.size.name );  
	// jetzt wird per default der style aus der frame.cfg genutzt
	d.addClass( envelope.message.style );
	

	
	var tri = ce("div");
	//if(cfg != undefined && cfg.config.NO_COMMENT) {
	tri.addClass("nocomment theComment cptr xy" ); // nocomment // commentcount
	//tri.addClass("theComment");
	//}
	d.append(tri);
  
  
  	// neues userbild.
	if( envelope.message && envelope.message.user && envelope.message.user.icon != "" && String(envelope.message.style).charAt(0) == 'e' ) { 
		var uImgContainer = ce("div");
		uImgContainer.addClass("userImageContainer dn");
		var uImg = ce("img");
		uImg.addClass("userImage");
		// use lazyloading - only when userimage is visible
		//setImageSource(uImg, envelope.message.user.icon, envelope.lazy);
		uImg.attr("src", envelope.message.user.icon);
		uImgContainer.append(uImg);
		d.append(uImgContainer);
	}
  
  
	envelope.message.parsedText = s3_parse_messagetext(envelope.message.text);
	
	d.data("envelope", envelope);
	
  	return d; 
}

function s3_layout_mk_link(envelope) {
  	
	if( ck(envelope.message.link ) ) {
		p = ce("p");
		p.addClass("link");

		// link
		var a = ce("a");
		a.attr("href", envelope.message.link); 
		a.attr("target", ThirdScreenConfig.LINK_TARGET);

		var s = ce("span");
		s.addClass("flypicon");
		s.text("l");
		a.append(s);
		
		// bild, alt, jetzt font!
		/*
		var s = ce("span");
		var im = ce("img");
		im.attr("src", "/o/icons/link_weiss.png");
		s.append(im);
		s.addClass("link_img");
		a.append(s);
		*/
		
		// linktext
		var s = ce("span");
		if(envelope.message.info == "") envelope.message.info = "Bitte klicken";
		s.text(envelope.message.info);
		a.append(s);
		p.append(a);
		
		return p;
	}	
	return null;
}

var SVCMAP = {
	twitter: "twitter",
	facebook: "facebook",
	//chat: "flypsite",
  chat: "kommentar",
  comment: "kommentar",
	google: "google"
}

function getsvc(s) {
	if ( SVCMAP[s] ) return SVCMAP[s];
	return s;
}
 
function s3_layout_mk_user(elem, envelope, frame) {

	var u = envelope.message.user; 
	var m = envelope.message;      
  	var dv_tw_timeout = null;

	if( ck(u.name) || ck(u.handle) ) 
	{

		var p = ce("div");
		p.addClass("info");
	
		
		var mDate = new Date(m.time);
		var hr = mDate.getHours();
		var mn = mDate.getMinutes();
		
		var hrf = hr < 10 ? "0" + hr : hr;
		var mnf = mn < 10 ? "0" + mn : mn;
		var fDateTime = hrf + ":" + mnf + " Uhr";	
		
		// datum, mal wieder...
		var jetzt = new Date();
		if( jetzt.getTime() > 12 * 3600 * 1000 + mDate.getTime() ) {	
			fDateTime += " am " + nullify(mDate.getDate()) + "." + nullify(mDate.getMonth() + 1) + "." + mDate.getFullYear();
		}
				
		var uname = str(u.name);
		if ( uname == "polly" ) { uname = str(u.handle); }
		
		var uhndl = str(u.handle);
		var ulink = "";
		var ulinx = "";
		var slink = "";
		var slinx = "";
		
		if ( m.service == "twitter" || m.service == "facebook" ) {
		
			ulink = "<a target=\"_blank\" class=\"userhandle\" href=\"" + u.link + "\">";
			ulinx = "</a>";
		}	
		if ( m.srvlink ) {
			slink = "<a target=\"_blank\" class=\"srvlink\" href=\"" +m.srvlink + "\">";
			slinx = "</a>";
		}
		
		

		var strg = "";	
		var msgService = getsvc(str(m.service));
		if(msgService === 'chat') msgService = 'kommentar';
		
		var viatxt = " via " + msgService;
		if ( !m.service || m.service == "flyphq" || m.service == "opengraph") viatxt = "";

		if ( !uhndl || uhndl == "")  uhndl = uname;
		if ( !uname || uname == "")  uname = uhndl;

		
		if ( uhndl == uname ) {
			strg = uname + ' ' + "<span class=\"usrhandle\">" + slink + fDateTime + slinx + viatxt + "</span>";
		} else {
		
			if(uname && uname != "")
			{
				strg += "<span class=\"username\">" + ulink + uname + ulinx + "</span><span class=\"pipe\"> | </span>";
			}
			
			strg += '<span class="realuserhandle '+ msgService +'">' + ulink + uhndl + ulinx + '</span> ' + "<span class=\"usrhandle\">" + slink + fDateTime + slinx + viatxt +  "</span>";
		}
		
		var s = ce("span");
		s.addClass("infoblock");
		s.addClass(msgService);
		s.html(strg);
		p.append(s);
		
		if( ck( m.service ) ) {
			var dv = ce("div");			
			dv.addClass( "serviceicon serviceicon_" + m.service );
			p.append(dv);
			if ((m.srvlink || m.link) && m.service != 'twitter') {
				dv.addClass("cptr");
				//console.log(m.link);
				var msgServiceLink = m.srvlink ? m.srvlink : m.link;
				dv.on("click", function() {
					window.open(msgServiceLink).focus();
				});
			}
		}
		
		
		if( u.service == "twitter" ) {
		  //p.addClass("cptr");
		  
		  	var twac;

			twac = ce("div");
			twac.attr("id", "twac");
			twac.css("width", "0px");
			twac.css("height", "21px");
			twac.css("overflow", "hidden");
			twac.css("background-color", "transparent"); // transparent //elem.css("background-color"));
			twac.css("border", "0px solid red");
			twac.css("z-index", "1");
			twac.css("position", "absolute");
			twac.css("right", "20px")
			// FIXME wenn dv nicht gesetzt ist - s. 860 dann gibt das hier probleme
			twac.css("top", dv.position().top - 2);     

			var dtw = ce("div");
			dtw.css("width","90px");

			var tw_reply = ce("div");
			tw_reply.attr("title", "Reply");
			tw_reply.addClass("tw_reply twimg");
			tw_reply.on("click", function(){
				window.open( "https://twitter.com/intent/tweet?in_reply_to=" + m.srvid );
				twac.animate( {"width": "0px"}, 300);
				window.clearTimeout(dv_tw_timeout);
			});
			dtw.append(tw_reply);

			var tw_retweet = ce("div");
			tw_retweet.attr("title", "Retweet");
			tw_retweet.addClass("tw_retweet twimg");
			tw_retweet.on("click", function(){
				window.open( "https://twitter.com/intent/retweet?tweet_id=" + m.srvid );
			  	twac.animate( {"width": "0px"}, 300);
			  	window.clearTimeout(dv_tw_timeout);
			});
			dtw.append(tw_retweet);

			var tw_fav = ce("div");
			tw_fav.attr("title", "Favorite");
			tw_fav.addClass("tw_fav twimg");
			tw_fav.on("click", function(){
				window.open( "https://twitter.com/intent/favorite?tweet_id=" + m.srvid );
        		twac.animate( {"width": "0px"}, 300);
        		window.clearTimeout(dv_tw_timeout);
      		});
      		dtw.append(tw_fav);

      		twac.append(dtw);
		  
      		dv.parent().append(twac);
      		dv.append(twac);
      
      		twac.on("mouseenter", function() {

        		dv.attr("tw_action", "true");
      		});
      
			twac.on("mouseleave", function(){
				dv_tw_timeout = window.setTimeout(function() {
					if(dv.attr("tw_action") == undefined)
					{
						twac.animate( {"width": "0px"}, 100);
						dv.attr("tw_action", null);
					}
				}, 100);
			});
      
      		dv.addClass("cptr");
      
  			dv.on("mouseenter", function() {
  				
  		  		if(dv.attr("tw_action") == "true" ) return;
  		  		dv.attr("tw_action","true");
 
        		twac.animate( {"width": "78px"}, 100);
 
        		dv.on("mouseleave", function(){
          			dv.attr("tw_action", null);
          			dv_tw_timeout = window.setTimeout(function() {
            			if(dv.attr("tw_action") == undefined)
            			{
              				twac.animate( {"width": "0px"}, 100);
              				dv.attr("tw_action", null);
            			}
          			}, 100);
          
        		})
			});
		  
		  
			dv.on("click", function(){ 
				var theLink = u.link;
				window.open( theLink ); 	
				twac.animate( {"width": "0px"}, 100);
        		window.clearTimeout(dv_tw_timeout);			
			});
		  
		}
		
		
		
	} 
	else
	{
		var p = ce("div");
		p.addClass("info");
	}
	
	elem.append(p);
	return p;
}

function s3_layout_mkpoll(tile, envelope, thirdscreen){
	var d = s3_layout_mkdiv(tile, envelope);

	if(!envelope.message.media) return;

	var data = envelope.message.media.data;
	
	//FIXME: nicht immer vorhanden! > d&d editor
	if(!data) return;
	
	var msg = envelope.message;

	// TODO dummyPollLayoutType spaeter durch data.layoutType (?) ersetzen, wenn implementiert
	// typen jetzt: ('2x2', 'list', 'float')

	var pc = ce('div');
	pc.addClass('tilecontent');
	d.append(pc);

	var pul = ce('ul');
	
	//FIXME: nicht immer vorhanden!
	if(data.layout){
		switch (data.layout){
			case 'list':
				pul.addClass('pollList');
				break;
			case '2x2':
				pul.addClass('poll2x2');
				break;
			case 'float':
				pul.addClass('pollValues');
				break;
		}
	}
	pul.addClass('poll-ul-'+data.id);

	var pt = ce('p');
	pt.text(msg.headline);
	pt.addClass('headline');
	var pt2 = ce('p');
	pt2.text(msg.text);
	pt2.addClass('text');

	var pinf = ce('p');
	pinf.addClass('info');
	pinf.text(msg.info);
 
	var prevOpt = Cookies['FLYP-POLL-' + data.id];
	jQuery.map(data.options, function(opt){
		var pli = ce('li');
		pul.append(pli);

		var pspan = ce('span');
		if(!opt.bullet || opt.bullet === ''){
			pspan.append('&nbsp;');
		} else {
			pspan.text(opt.bullet);
		} 


		pli.append(pspan);
		pli.append(opt.text)
		
		pli.addClass('cptr poll-'+data.id);
		pli.addClass('option-'+data.id+'-'+opt.id);
		if(prevOpt){
			if(prevOpt == opt.id){
				pli.addClass('pollHilite');
			} else {
				pli.addClass('pollDisabled')
			}
		} else {
			pli.addClass('pollEnabled')
			var sendData = {};
			sendData.did = data.id;
			sendData.oid = opt.id;
			sendData.nick = ' ';
			pli.on('click', function(e){
				thirdscreen.sendPollCommit(sendData, poll_click_switch);
			});
			
/*			pli.on('click', function(ab){
				$.ajax({
				  type: "POST",
				  url: '/poll?x,'+ data.id + ',' + opt.id,
				  success: function(response){
				  	Cookies.create('FLYP-POLL-' + data.id, opt.id);

				  	poll_click_switch(data.id, opt.id);
				  }
				});
			});*/
		}
		
		
	});

	pc.append(pt);
	pc.append(pt2);
	pc.append(pul);

	var presp = ce('p');
	presp.addClass('pollRueckmeldung');
	presp.text(data.responsetext);
	pc.append(presp);

	if(!prevOpt){
		presp.css('display', 'none');
	}

	pc.append(pinf);
	
  return d;
}

/*********************/
/*Poll Refresh Helper*/
/*********************/

function poll_click_switch(poll_id, selected){
	$('.poll-'+poll_id).off('click');
	$('.poll-'+poll_id).removeClass('pollHilite pollDisabled pollEnabled');
	$('.poll-'+poll_id).addClass('pollDisabled');
	$('.option-'+poll_id+'-'+selected).removeClass('pollDisabled');
	$('.option-'+poll_id+'-'+selected).addClass('pollHilite');
/*	var presp = ce('p');
	presp.addClass('pollRueckmeldung');
	presp.text(responsetext);
	$('.poll-ul-'+poll_id).after(presp);*/
	var poll = $('.poll-ul-'+poll_id).parent();
	$('.pollRueckmeldung', poll).css('display', '');
	Cookies.create('FLYP-POLL-' + poll_id, selected);
}

function s3_layout_mkpollresult(tile, envelope, thirdscreen){
	function calc_res(options){
		var count = 0;
		var sum = 0;
		jQuery.map(options, function(opt){
			count += opt.votes;
			sum += opt.votes * opt.value;
		})
		return [sum,count];
	}

	// 'durchschnitt','gewichtet','prozent','listeAnzahl','listeSchnitt'

	var d = s3_layout_mkdiv(tile, envelope);

	if(!envelope.message.media) return;

	var data = envelope.message.media.data;

	//FIXME: nicht immer vorhanden! > d&d editor
	if(!data) return;

	var msg = envelope.message;

	var pc = ce('div');
	pc.addClass('tilecontent');
	d.append(pc);

	var pinf = ce('p');
	pinf.addClass('info');
	pinf.text(msg.info);

	if('gewichtet' == data.evaluation || 'prozent' == data.evaluation){
		var resultSum = calc_res(data.options);
		var pti = ce('p');
		pti.addClass('headline');
		pti.text(msg.headline);
		
		var pre = ce('p');
		pre.addClass('pollErgebnisBig');

		var pt2 = ce('p');
		pt2.addClass('text');
		pt2.text(msg.text);

		switch (data.evaluation){
			case 'gewichtet':
				if(resultSum[1] == 0 || resultSum[0] == 0){
					pre.text('ø '+'0' + " Punkte");
				} else {
					pre.text('ø '+Math.round((resultSum[0]/resultSum[1])*10)/10 + " Punkte");
				}
				
				break;
			case 'prozent':
				if(resultSum[1] == 0 || resultSum[0] == 0){

					pre.text('0' + '%');
				} else {
					pre.text(Math.round((100/resultSum[1])*data.options[0].votes) + '%');
				}
				break;
		}
			

		//pc.append(pti);
		//pc.append(pre);
	} else {

		var pul = ce('ul');

		var pt = ce('p');
		pt.text(msg.headline);
		pt.addClass('headline');
		
		var pt2 = ce('p');
		pt2.addClass('text');
		pt2.text(msg.text);
		
		/*data.options.map(function(opt){
			var pli = ce('li');
			pul.append(pli);

			var pspan = ce('span');
			pspan.text(opt.bullet);
			var pspan2 = ce('span');
			
			
			switch (data.evaluation){
				case 'listeAnzahl':
					pspan2.text(opt.votes);
					break;
				case 'listeSchnitt':
					// FIXME Punkte sollte per var gesetzt werden
					pspan2.text(Math.round(opt.votes * opt.value *10)/10  + " Punkte");
					break;
			}
			
			pli.append(pspan);
			pli.append(opt.text);
			pli.append(pspan2);
			pli.addClass('pollDisabled');
			pli.addClass('poll-result-'+data.id);
			pli.addClass('option-result-'+data.id+'-'+opt.id);
		});*/
		for (var i = 0; i < data.options.length; i++) {
			var opt = data.options[i];
		
			var pli = ce('li');
			pul.append(pli);

			var pspan = ce('span');
			if(!opt.bullet || opt.bullet === ''){
				pspan.append('&nbsp;');
			} else {
				pspan.text(opt.bullet);
			} 
			var pspan2 = ce('span');
			
			
			switch (data.evaluation){
				case 'listeAnzahl':
					pspan2.text(opt.votes);
					break;
				case 'listeSchnitt':
					// FIXME Punkte sollte per var gesetzt werden
					pspan2.text(Math.round(opt.votes * opt.value *10)/10  + " Punkte");
					break;
			}
			
			pli.append(pspan);
			pli.append(opt.text);
			pli.append(pspan2);
			pli.addClass('pollDisabled');
			pli.addClass('poll-result-'+data.id);
			pli.addClass('option-result-'+data.id+'-'+opt.id);
		};

		switch (data.layout){
			case 'list':
				pul.addClass('pollList');
				break;
			case '2x2':
				pul.addClass('poll2x2');
				break;
			case 'float':
				pul.addClass('pollValues');
				break;
		}
	}
	
	pc.append(pt);
	pc.append(pti);
	pc.append(pt2);
	pc.append(pre);
	pc.append(pul);
	pc.append(pinf);

  return d;
}

function s3_layout_mkinfo(d, envelope) {
	// sollte immer da sein, ggf. leer
	var p = ce("div");
	p.addClass("info");
	var sp = ce("span");
	if( ck( envelope.message.info ) ) {
		sp.html(envelope.message.info);
	}
	p.append(sp);
	d.append(p);	
}


/*
checks if lazyloading is enabled
if enabled - set up image or background image for lazyloading
if not - set up image or background image as usual
 */
function setImageSource(elem, url, lazy){
	elem.on('imageLoaded.list', onLoadImagesList);
	elem.on('imageLoaded.nolist', onLoadImagesNoList);
	if(	elem[0].tagName.toLowerCase() === 'img' ){
		if(the3rdscreen.dolazyloading && lazy){
			elem.attr("src", '/g/assets/trans.gif' );
			elem.attr('data-src', url );
			elem.addClass('lazyloading')
			//elem.on('load.imageCutter', onLoadImagesList);
			elem.on('load', function(){
				the3rdscreen.imageLoader.registerElement(this);
			});
		}else{
			var bgImg = new Image();
			bgImg.onload = function(){
				elem.attr('src', bgImg.src );
				elem.trigger('imageLoaded.list', bgImg);
			};
			bgImg.src = url;

		}
	}else{
		if(the3rdscreen.dolazyloading  && lazy){
			elem.css("background-image", "url(/g/assets/trans.gif)" ); 
			elem.attr('data-src', url );
			elem.addClass('lazyloading')
			the3rdscreen.imageLoader.registerElement(elem[0])
		}else{
			var bgImg = new Image();
			bgImg.onload = function(){
				// console.log('WAAAAAAAAAAAH', (new Date()).getSeconds(), (new Date()).getMilliseconds());
			   elem.css("background-image", "url(" + bgImg.src + ")" )
			   elem.trigger('imageLoaded.nolist', bgImg);
			};
			bgImg.src = url;
			elem.css("background-image", "url(" + url + ")" );	
		}
	}
}

function onLoadImagesList(ev, img){
	ev.preventDefault();
	// console.log('list', ev, this, img);
	// HACK -.-
	if(!$(this).hasClass('lazyloading') && $(this).closest('div[mid]').attr('layout') !== 'teaser'){
		var msgContainer = $(this).closest('div[mid]');
		var msg = msgContainer.data('envelope').message;
		var media = msg.media;
		var image = media.image;

		if( image.zoom && image.detail ){
			$(this).guillotine({width:image.detail.width, height: image.detail.height, init: {x:image.detail.x, y:image.detail.y}});
			$(this).guillotine('disable');
			$(this).trigger('imageLoaded.sizeSet', $(this).closest('.guillotine-window').height());
		} else if(navigator.userAgent.indexOf('Firefox') != -1){
			$(this).guillotine({width:img.width, height: img.height, init: {x:Math.round(img.width/2), y:Math.round(img.height/2)}});
			$(this).guillotine('disable');
			$(this).trigger('imageLoaded.sizeSet', $(this).closest('.guillotine-window').height());
		}
	}	
}

function onLoadImagesNoList(ev, img){
	ev.preventDefault();
	// console.log('nolist', ev, this, img);
	//console.log($(this).attr('class'))
	if(!$(this).hasClass('lazyloading') && $(this).closest('div[mid]').attr('layout') !== 'teaser' && $(this).closest('div[mid]').data('envelope') && $(this).closest('div[mid]').data('envelope').message){
		var msgContainer = $(this).closest('div[mid]');
		var msg = msgContainer.data('envelope').message;
		var media = msg.media;
		var image = media.image;
		if( image && image.center && image.detail ) {
			var xval = {
				'container_width': msgContainer.width(),
				'container_height': msgContainer.height(),
				'mao': "nix"
			};

			// console.log("imgValues222", xval);
			//console.log('hio', msgContainer.width(), msgContainer.height(), media);
			var imgValues = {
				'center_x': image.center.x,
				'center_y': image.center.y,
				'detail_x' : image.detail.x,
				'detail_y' : image.detail.y,
				'detail_width' : image.detail.width,
				'detail_height' : image.detail.height, 
				'zoom_mode' : image.zoom,
				'container_width': msgContainer.width(),
				'container_height': msgContainer.height(),
				'image_width': img.width,
				'image_height': img.height
			};
			// console.log("imgValues", imgValues);

			var cssCalc = calcImageProperties(imgValues);
			msgContainer.data('cuttingValues', imgValues);
			// console.log('HERE', (new Date()).getSeconds(), (new Date()).getMilliseconds(), cssCalc);
			$(this).css(cssCalc);
			$(this).trigger('imageLoaded.sizeSet');
		} 
	}	
}

function calcImageProperties(imgObj){

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


	// console.log("sel: " + selectX + "," + selectY + " " + selectWidth +"x" + selectHeight + " center: " + imgObj.center_x + ", " + imgObj.center_y);

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


	// console.log("C/ar: " + containerAr + " R/ar: " + refAr);

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
				// console.log("A");
				zoomFactor = containerHeight / selectHeight;
			} else {
				// console.log("B");
				zoomFactor = containerWidth / imgWidth;
				sWidth  = imgWidth;
				sHeight = sWidth * 1/containerAr;
			}
		} else {
			// console.log("C");

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
				// console.log("X");
				zoomFactor = containerWidth / selectWidth;

			} else {
				// console.log("Y");
				zoomFactor = containerHeight / imgHeight;
				sHeight  = imgHeight;
				sWidth = sHeight * containerAr;
			}
		} else {
			// console.log("Z");

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
			// console.log("if " + sx);
			padd = (containerWidth - selRectWidth) / padRatioX;
			sx -= padd / zoomFactor;
		} else {
			padd = (selRectWidth - containerWidth) * cutRatioX;
			// console.log("else " + selRectWidth + " " + containerWidth + " " + cutRatioX);
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
	// console.log("sx: " + sx + " zoom: " + zoomFactor + " left: " + margin_left);

	width = Math.round(imgObj.image_width*zoomFactor);
	height = Math.round(imgObj.image_height*zoomFactor);

	if(margin_top+height < containerHeight){
		margin_top = containerHeight-height;
	}

	var result = {
			'margin-top' : margin_top,
			'margin-left' : margin_left,
			'width' : width,
			'height' : height
	};
	return result;
}

var ThirdLayout = {

	layout_banner_image: function(tile, envelope) {
	    var d = s3_layout_mkdiv(tile, envelope);
	    if( envelope.message.image ) {
	        var i = $(document.createElement("img"));
	        i.attr("src", envelope.message.image);
	        d.append(i);
	      }
	    return d;
	},

	layout_base_text: function(tile, envelope) {
	    var d = s3_layout_mktext(tile, envelope);
	    return d;
	},
	
	layout_base_text_big: function(tile, envelope) {
	    var d = s3_layout_mktextbig(tile, envelope);
	    return d;
	},
	
	layout_base_text_link: function(tile, envelope) {
	    var d = s3_layout_mktextlink(tile, envelope);
	    return d;
	},

	layout_base_message: function(tile, envelope) {
	    var d = s3_layout_mkmessage(tile, envelope);
	    return d;
	},
	
	layout_base_message_big: function(tile, envelope) {
	    var d = s3_layout_mkmessagebig(tile, envelope);
	    return d;
	},
	
	layout_base_image: function(tile, envelope) {
	    var d = s3_layout_mkimage(tile, envelope);
	    return d;
	},
	
	layout_base_image_link: function(tile, envelope) {
	    var d = s3_layout_mkimagelink(tile, envelope);
	    return d;
	},
	 
	layout_base_postcard: function(tile, envelope) {
	    var d = s3_layout_mkpostcard(tile, envelope);
	    return d;
	},
	
	layout_base_postcard_text: function(tile, envelope) {
	    var d = s3_layout_mkpostcardtext(tile, envelope);
	    return d;
	},
	
	layout_base_video: function(tile, envelope) {
	    var d = s3_layout_mkvideo(tile, envelope);
	    d.attr("req", "media.video");
	    return d;
	},
	layout_base_iframe: function(tile, envelope) {
	    var d = s3_layout_mkiframe(tile, envelope);
	    return d;
	},
	
	layout_base_teaser: function(tile, envelope) {
	    var d = s3_layout_mkteaser(tile, envelope);
	    return d;
	},
	
	layout_double_teaser: function(tile, envelope) {
	    var d = s3_layout_mkteaser(tile, envelope);
	    return d;
	},
	
	layout_double_text: function(tile, envelope, cfg) {
	    var d = s3_layout_mktext(tile, envelope, cfg);
	    return d;
	},
	
	layout_double_text_big: function(tile, envelope) {
	    var d = s3_layout_mktextbig(tile, envelope);
	    return d;
	},
	
	layout_double_text_small: function(tile, envelope) {
	    var d = s3_layout_mktextsmall(tile, envelope);
	    return d;
	},
	
	layout_double_text_link: function(tile, envelope) {
	    var d = s3_layout_mktextlink(tile, envelope);
	    return d;
	},
	
	layout_double_message: function(tile, envelope) {
	    var d = s3_layout_mkmessage(tile, envelope);
	    return d;
	},
	
	layout_double_message_big: function(tile, envelope) {
	    var d = s3_layout_mkmessagebig(tile, envelope);
	    return d;
	},
	
	layout_double_image: function(tile, envelope) {
	    var d = s3_layout_mkimage(tile, envelope);
	    d.attr("req", "media");
	    return d;
	},
	
	layout_double_image_link: function(tile, envelope) {
	    var d = s3_layout_mkimagelink(tile, envelope);
	    return d;
	},
	
	layout_double_postcard: function(tile, envelope) {
	    var d = s3_layout_mkpostcard(tile, envelope);
	    return d;
	},
	
	layout_double_postcard_text: function(tile, envelope) {
	    var d = s3_layout_mkpostcardtext(tile, envelope);
	    return d;
	},
	
	layout_double_slideshow: function(tile, envelope, thirdscreen) {
	    var d = s3_layout_mkslideshow(tile, envelope, thirdscreen);
	    return d;
	},
	

	// FIND instagram video embed größe
	// FIXME: so nicht, gehört nach oben...
	layout_double_video: function(tile, envelope) {
		var d = s3_layout_mkvideo(tile, envelope);
	  	d.attr("req", "media.video");
		return d;
	},

	layout_double_iframe: function(tile, envelope) {
	    var d = s3_layout_mkiframe(tile, envelope);
	    return d;
	},
	
	
	layout_grande_text: function(tile, envelope) {
	    var d = s3_layout_mktextbig(tile, envelope);
	    return d;
	},
	
	layout_grande_video: function(tile, envelope) {
	    var d = s3_layout_mkvideo(tile, envelope);
	    
	    return d;
	},
	
	layout_grande_iframe: function(tile, envelope) {
	    var d = s3_layout_mkiframe(tile, envelope);
	    return d;
	},
	
	layout_short_chat: function(tile, envelope, cls) {
	  	var d = s3_layout_mkchat(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_short_chatframe: function(tile, envelope, cls) {
	  	var d = s3_layout_mkchat(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_base_chat: function(tile, envelope, cls) {
	  	var d = s3_layout_mkchat(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_base_chatframe: function(tile, envelope, cls) {
	  	var d = s3_layout_mkchat(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_short4_socialstream: function(tile, envelope) {
	  	var d = s3_layout_mktext(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_short4_text: function(tile, envelope) {
	  	var d = s3_layout_mktext(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_short4_message: function(tile, envelope) {
	  	var d = s3_layout_mkmessage(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_short4_text_big: function(tile, envelope) {
	  	var d = s3_layout_mktextbig(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	

	layout_comment: function(tile, envelope) {
	  	var d = s3_layout_comment(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},

	layout_elcomment: function(tile, envelope) {
	  	var d = s3_layout_elcomment(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_socialmessage: function(tile, envelope) {
	    //var d = s3_layout_socialstream(tile, envelope);
	  	var d = s3_layout_comment(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_tetris_text: function(tile, envelope) {
	    var d = s3_layout_mktext(tile, envelope);
	    return d;
	},
	
	layout_tetris_text_big: function(tile, envelope) {
	    var d = s3_layout_mktextbig(tile, envelope);
	    return d;
	},
	
	layout_tetris_text_link: function(tile, envelope) {
	    var d = s3_layout_mktextlink(tile, envelope);
	    return d;
	},

	layout_tetris_message: function(tile, envelope) {
	    var d = s3_layout_mkmessage(tile, envelope);
	    return d;
	},
	
	layout_tetris_message_big: function(tile, envelope) {
	    var d = s3_layout_mkmessagebig(tile, envelope);
	    return d;
	},
	
	layout_tetris_image: function(tile, envelope) {
	    var d = s3_layout_mkimage(tile, envelope);
	    return d;
	},
	
	layout_tetris_image_link: function(tile, envelope) {
	    var d = s3_layout_mkimagelink(tile, envelope);
	    return d;
	},
	
	layout_tetris_postcard: function(tile, envelope) {
	    var d = s3_layout_mkpostcard(tile, envelope);
	    return d;
	},
	
	layout_tetris_slideshow: function(tile, envelope, thirdscreen) {
	    var d = s3_layout_mkslideshow(tile, envelope, thirdscreen);
	    return d;
	},
	
	layout_tetris_video: function(tile, envelope) {
	    var d = s3_layout_mkvideo(tile, envelope);
	    return d;
	},	

	layout_tetris_time: function(tile, envelope) {
	    //var d = s3_layout_mktime(tile, envelope);
	    var d = s3_layout_mktime(tile, envelope);
	    return d;
	},	

	layout_short_time: function(tile, envelope) {
	    //var d = s3_layout_mktime(tile, envelope);
	    var d = s3_layout_mktime(tile, envelope);
	    return d;
	},	

	layout_base_time: function(tile, envelope) {
	    //var d = s3_layout_mktime(tile, envelope);
	    var d = s3_layout_mktime(tile, envelope);
	    return d;
	},	

	layout_double_time: function(tile, envelope) {
	    //var d = s3_layout_mktime(tile, envelope);
	    var d = s3_layout_mktime(tile, envelope);
	    return d;
	},	

	layout_base_poll: function(tile, envelope, thirdscreen) {
		var d = s3_layout_mkpoll(tile, envelope, thirdscreen);
		return d;
	},

	layout_base_pollresult: function(tile, envelope, thirdscreen) {
		var d = s3_layout_mkpollresult(tile, envelope, thirdscreen);
		return d;
	},

	layout_double_poll: function(tile, envelope, thirdscreen) {
		var d = s3_layout_mkpoll(tile, envelope, thirdscreen);
		return d;
	},

	layout_double_pollresult: function(tile, envelope, thirdscreen) {
		var d = s3_layout_mkpollresult(tile, envelope, thirdscreen);
		return d;
	},

	layout_tetris_poll: function(tile, envelope, thirdscreen) {
		var d = s3_layout_mkpoll(tile, envelope, thirdscreen);
		return d;
	},

	layout_tetris_pollresult: function(tile, envelope, thirdscreen) {
		var d = s3_layout_mkpollresult(tile, envelope, thirdscreen);
		return d;
	},

	layout_base_slideshow: function(tile, envelope, thirdscreen) {
	    var d = s3_layout_mkslideshow(tile, envelope, thirdscreen);
	    return d;
	},

}
