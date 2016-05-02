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
			i.css("background-image", "url(" + envelope.message.media.url + ")" );
			i.css("background-size", "cover");
			i.addClass("image");
			d.append(i);
		} 
			else
		{
			var i = ce("img");
			i.attr("src", envelope.message.media.url )
			//i.addClass("image");
			//i.css("width", "100%");
			i.addClass("w100p");
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
		


		if( ck( envelope.message.text ) ) {
			var p = $(document.createElement("p"));
			p.addClass("text");  
			p.css("z-index","2");
			
			p.addClass("transparent");
			var span = $(document.createElement("span"));
			p.append(span);
			span.html(s3_parse_messagetext(envelope.message.text));
			//p.css("width", "100%");
			

			if(frame.type != "list"){
				d.append(p);
			} else {
				//console.log("==list:");
				//d.remove('.tilecontent');
				connDiv.append(p);
			}
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
			i.css("background-image", "url(" + envelope.message.media.url + ")" );
			i.css("background-size", "cover");
			i.addClass("image");
			d.append(i);
		} 
			else
		{
			var i = ce("img");
			i.attr("src", envelope.message.media.url )
			//i.addClass("image");
			//i.css("width", "100%");
			i.addClass("w100p");
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
	//console.log("s3_layout_mkteaser");
	var d = s3_layout_mkdiv(frame, envelope);
	if( envelope.message.media && ck( envelope.message.media.url ) ) {
		/*var i = ce("img");
		i.attr("src", envelope.message.media.url )
		i.addClass("teaserimage");
		d.append(i);*/
		var i = ce("div");
		i.css("background-image", "url(" + envelope.message.media.url + ")" );
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
  		d.addClass("cp");
  	};
  
  return d;
}

function s3_layout_mkpostcard(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	d.append(tc);
	//var i = ce("img");
	if( ck( envelope.message.media )  && ck( envelope.message.media.url) ) {
		
		if(frame.type != "list")
		{	
			var i = ce("div");
			i.css("background-image", "url(" + envelope.message.media.url + ")" );
			i.css("background-size", "cover");
			i.addClass("image");
			d.append(i);
		} 
			else
		{
			
			// hack: we dont like the opengraph images...

				var i = ce("img");
				i.attr("src", envelope.message.media.url )
				//i.css("width", "100%");
				i.addClass("w100p");
				i.addClass("imgsrvc_" + envelope.message.media.service);
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
	}	
	return d;
}

function s3_layout_mkpostcardtext(frame, envelope) {
	
	//console.log("s3_layout_mkpostcardtext");

	var d = s3_layout_mkdiv(frame, envelope);
	var tc = ce("div");
	tc.addClass('tilecontent');
	//d.append(tc);
	
	if( ck( envelope.message.media )  && ck( envelope.message.media.url ) ) 
	{
		
		if(frame.type != "list")
		{	
		
			d.append(tc);
		
			var i = ce("div");
			i.css("background-image", "url(" + envelope.message.media.url + ")" );
			i.css("background-size", "cover");
			i.addClass("image");
			d.append(i);
		} 
		else
		{
			tc.remove(); //$('.tilecontent').remove();
			var i = ce("img");
			i.attr("src", envelope.message.media.url )
			//i.css("width", "100%");
			i.addClass("w100p");
			i.addClass("imgsrvc_" + envelope.message.media.service);
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
		
		
		//if( ck(envelope.message.user.name) || ck(envelope.message.user.handle) ) {	
			//var p = s3_layout_mk_user(d, envelope, frame);
			
			if(frame.type != "list"){
				var p = s3_layout_mk_user(d, envelope, frame);
			} else {
				var p = s3_layout_mk_user(connDiv, envelope, frame);
			}

			//p.css("width", d.width());
			p.addClass("transparent_postcard");
		//}
		/*
		else
		
		{
			var p = s3_layout_mk_user(connDiv, envelope, frame);
		}
		*/
		// fixme: das war vor der demo ok! p war immer gesetzt
				
		if( ck( envelope.message.text ) && p != undefined ) {
			//console.log("debu");
			var d2 = ce("div");
			d2.addClass("text");
			var debu = envelope.message.text;
			//console.log("debu: " , debu);
			d2.html(s3_parse_messagetext(debu));
			p.prepend(d2);
		} 
		
	}	
	return d;
}



function s3_layout_mkvideo(frame, envelope) {
	var d = s3_layout_mkdiv(frame, envelope);		
	if( ck(envelope.message.media) ) {
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
		
		// <div class="cp flypicon playVideoKachel" title="Video starten">P</div>
		var play = $('<div>');
		play.attr("title", "Video starten" );
		play.addClass("playVideoKachelContainer startVideo");
		
		var btn = $('<div>');
		btn.addClass("cp flypicon playVideoKachel");
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

		var preview = $('<img>');
		preview.addClass('startVideo img');
		preview.attr('src', envelope.message.media.poster);
		// FIXME vorlaeufig
		preview.width('100%');
		preview.height('100%');
		
		d.append(preview);
		
		$('.startVideo', d).click(function(){
			
			
			var btn =  play.find('.playVideoKachel');
			var pd1 =  play.find('.double-bounce1');
			var pd2 =  play.find('.double-bounce2');
			
			btn.css("display", "none");
			pd1.css("display", "block");
			pd2.css("display", "block");
						
			var iframe = $(this).parent().find('iframe');
			if(iframe.attr('llsrc')){
				
				iframe.attr('src', iframe.attr('llsrc'));
				iframe.removeAttr('llsrc');
				iframe.load(function(ev){
					$(this).unbind('load');
					var iframe = $(this);
					if(iframe.attr('src').indexOf('vine') != -1){
						iframe.attr('src', iframe.attr('src'));
					}
					$(this).parent().find('.startVideo').hide();
					$(this).parent().find('iframe').show();
					//img.hide();
					//btn.hide();
				});
			}
		});

		

		var vf = s3_layout_mkvideoframe (envelope, w, h);
		if( frame.type == "list" )
		{
			d.mutate('width', function(el,info) {
				var w = d.width();
				var h = w / (16/9);
				vf.attr({'width': w, 'height':h});
			});
		}
		d.append(vf);
	}
	return d;
}


function s3_layout_mkiframe(frame, envelope)
{

	if(!envelope.message.link || envelope.message.link == "") return;
	var d = s3_layout_mkdiv(frame, envelope);
	var i = ce("iframe");
	i.css("height", frame.size.height);
	i.css("width", frame.size.width);
	i.attr({'webkitAllowFullScreen':'webkitAllowFullScreen', 'mozallowfullscreen':'mozallowfullscreen', 'allowFullScreen':'allowFullScreen'});
	i.attr("src", envelope.message.link);
	d.append(i);
	return d;
}

function s3_layout_mkvideoframe (envelope, w, h) {
  if(envelope.message.media === undefined) return;
	// preparing...
	var s = envelope.message.media.service;
	var k = envelope.message.media.key;
	var u = envelope.message.media.url;
	var auto = (envelope.message.media.attributes && envelope.message.media.attributes.autoplay)?envelope.message.media.attributes.autoplay:false;
	var mute = (envelope.message.media.attributes && envelope.message.media.attributes.mute)?envelope.message.media.attributes.mute:false;
	var loop = (envelope.message.media.attributes && envelope.message.media.attributes.loop)?envelope.message.media.attributes.loop:false;
	var pofr = (envelope.message.media.attributes && envelope.message.media.attributes.posterframe)?envelope.message.media.attributes.posterframe:false;
	var altr = (envelope.message.media.attributes && envelope.message.media.attributes.alternative)?envelope.message.media.attributes.alternative:false;

	// go!
	var i = ce("iframe");
	i.attr({'width': w, 'height':h, 'frameborder': '0', 'scrolling': 'no'});
	i.attr({'webkitAllowFullScreen':'webkitAllowFullScreen', 'mozallowfullscreen':'mozallowfullscreen', 'allowFullScreen':'allowFullScreen'});
	i.css({'border': '0px none transparent', 'display' : 'none'});
	//console.log(envelope.message);
	if( s == 'facebook') {
		i.attr('llsrc', 'https://www.facebook.com/video/embed?video_id='+k);
	} else if (s == 'youtube' ) {
		//i.attr('llsrc', 'http://www.youtube.com/embed/' + k + '?html5=1&amp;autoplay=' + auto + '&amp;origin=http://flyp.tv');
		i.attr('llsrc', 'http://www.youtube.com/embed/' + k + '?html5=1&amp;autoplay=1&amp;origin=http://flyp.tv');
	} else if (s == 'vine') {
		//i.attr('llsrc', 'https://vine.co/v/'+ k +'/embed/simple');
		i.attr('llsrc', 'https://vine.co/v/'+ k +'/card');
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
/*		if (u) i.attr('src', u);
		else {
			var l = "";
			if (loop) l = "_loop-true";
			if (auto) l += "_autoplay-true";
			i.attr('src', 'http://www.ndr.de/' + k + '-externalPlayer_width-'+ w +'_height-' + h + l + '.html');

		}*/
	} else if (s == 'http') {
		// will not work for IE 7
		// if (yLib.isIEVersion(0,7)) return;
		
		var p = "";
		if (pofr) p = '&p=' + encodeURIComponent(pofr);
		if (altr) p += '&v2=' + encodeURIComponent(altr);
		i.attr('llsrc', 'http://jwplayer.soviet.tv/?w=' + w + '&h=' + h + '&a=' + auto + '&m=' + mute + '&l=' + loop+ '&v=' + encodeURIComponent(u) + p);
	} else if (s == 'rtmp' || s == 'rtmpt') {
		// will not work for IE 7
		// if (yLib.isIEVersion(0,7)) return;
		
		var p = "";
		if (pofr) p = '&p=' + encodeURIComponent(pofr);
		if (altr) p += '&v2=' + encodeURIComponent(altr);
		i.attr('llsrc', 'http://jwplayer.soviet.tv/?w=' + w + '&h=' + h + '&a=' + auto + '&m=' + mute + '&l=' + loop+ '&v=' + encodeURIComponent(u) + p);
	} else if(s == 'opengraph'){
		i.attr('llsrc', envelope.message.media.url);
		
	
	}
	return i;
}


function s3_layout_mkchat(frame, envelope) {

	var d = s3_layout_mkdiv(frame, envelope);
	d.attr('id', 'chatboxdummy');
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

	//console.log("third???", thirdscreen);


	if( ck(envelope.message.substream) ) {
		var d = s3_layout_mkdiv(frame, envelope);
		var slideshow = new SlideShow();
		slideshow.container = d;
		slideshow.thirdscreen = thirdscreen;
		slideshow.frame = frame;
		slideshow.layouts = ThirdLayout;
		slideshow.envelope = envelope;
		// FIXME hier autoplay an / aus
		slideshow.autoplay = ThirdScreenConfig.SLIDESHOW_AUTOPLAY
		slideshow.isLazyLoading = true;
		slideshow.initShow();
		
		return d;
	} 
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
  	t = t.replace(/\@([A-Za-z0-9_]+)/gi,' <a class="overlay userhandle" target="_blank" href="http://twitter.com/$1" title="@$1">@$1</a> ');
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
	d.css("width", ( frame.type == "list" ) ? "100%" : (envelope.framesize != undefined) ? envelope.framesize.width : frame.size.width);
	d.css("height", ( frame.type == "list" ) ? "100%" : (envelope.framesize != undefined) ? envelope.framesize.height : frame.size.height);  
  
  	d.css("overflow", "hidden");
	d.addClass("tile"); // + frame.size.name );  
	// jetzt wird per default der style aus der frame.cfg genutzt
	d.addClass( envelope.message.style );
	
	var tri = ce("div");
	//if(cfg != undefined && cfg.config.NO_COMMENT) {
	tri.addClass("nocomment theComment cp xy" ); // nocomment // commentcount
	//tri.addClass("theComment");
	//}
	d.append(tri);
  
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
		if ( uhndl == uname ) {

			
			// FIXME kommentare gibts schon!!!
			// das sollte anders geloest werden...
			
			if(msgService === 'chat') msgService = 'kommentar';
			// END FIXME kommentare gibts schon!!!
			
			strg = uname + ' ' + "<span class=\"usrhandle\">" + slink + fDateTime + slinx + " via " + msgService/*getsvc(str(m.service))*/ + "</span>";
		} else {
			if(uname && uname != "")
			{
				strg += ulink + uname + ulinx + " | ";
			}

			
			var viatxt = " via " + getsvc(str(m.service));
			if ( ! m.service ) viatxt = "";

			strg += '<span class="realuserhandle '+ msgService +'">' + ulink + uhndl + ulinx + '</span> ' + "<span class=\"usrhandle\">" + slink + fDateTime + slinx + viatxt +  "</span>";
		}
		
		var s = ce("span");
		s.html(strg);
		p.append(s);
		
		if( ck( m.service ) ) {
			var dv = ce("div");			
			dv.addClass( "serviceicon serviceicon_" + m.service );
			p.append(dv);
			if ((m.srvlink || m.link) && m.service != 'twitter') {
				dv.addClass("cp");
				//console.log(m.link);
				var msgServiceLink = m.srvlink ? m.srvlink : m.link;
				dv.on("click", function() {
					window.open(msgServiceLink).focus();
				});
			}
		}
		
		
		if( u.service == "twitter" ) {
		  //p.addClass("cp");
		  
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
      
      		dv.addClass("cp");
      
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
		
		pli.addClass('cp poll-'+data.id);
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
	
	// FIXME: so nicht, gehört nach oben...
	layout_double_video: function(tile, envelope) {
		var d = s3_layout_mkdiv(tile, envelope);
		var h = tile.size.height; // /2 /1.1;
		var w = tile.size.width; // /1.1;
		var i = s3_layout_mkvideoframe (envelope, w, h);
		if(i) {
		  //i.css({'margin': '5%'});
		  d.append(i);
		}		
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
	  	setTimeout(function () {
            if (cls.chatInitialized) return;
            cls.initChat();
        }, 2000);
	    return d;
	},
	
	layout_short_chatframe: function(tile, envelope, cls) {
	  	var d = s3_layout_mkchat(tile, envelope);
	  	d.attr("tetris", false);
	  	setTimeout(function () {
            if (cls.chatInitialized) return;
            cls.initChat();
        }, 2000);
	    return d;
	},
	
	layout_base_chat: function(tile, envelope, cls) {
	  	var d = s3_layout_mkchat(tile, envelope);
	  	d.attr("tetris", false);
	  	setTimeout(function () {
            if (cls.chatInitialized) return;
            cls.initChat();
        }, 2000);
	    return d;
	},
	
	layout_base_chatframe: function(tile, envelope, cls) {
	  	var d = s3_layout_mkchat(tile, envelope);
	  	d.attr("tetris", false);
	  	setTimeout(function () {
            if (cls.chatInitialized) return;
            cls.initChat();
        }, 2000);
	    return d;
	},
	
	layout_short4_socialstream: function(tile, envelope) {
	    //var d = s3_layout_socialstream(tile, envelope);
	  	var d = s3_layout_mktext(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_short4_text: function(tile, envelope) {
	    //var d = s3_layout_socialstream(tile, envelope);
	  	var d = s3_layout_mktext(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_short4_message: function(tile, envelope) {
	    //var d = s3_layout_socialstream(tile, envelope);
	  	var d = s3_layout_mkmessage(tile, envelope);
	  	d.attr("tetris", false);
	    return d;
	},
	
	layout_short4_text_big: function(tile, envelope) {
	    //var d = s3_layout_socialstream(tile, envelope);
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
