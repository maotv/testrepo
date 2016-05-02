var Flyp = (function(fl){
		
	fl.init = function(env) {
		this.env = env;
		this.v = new this.Vienna({
			url: "http://" + env.event + "." + env.owner + ".flyp.tv/rio"
		});
		
		this.container = env.container;
		this.elemHeight = env.h;
		
		this.start();
		
	}

	fl.start = function() {	
		this.v.pollStreamInitialData(this.env.stream, function(envelopeArray, metaData) { 
			if( !fl.checkContainer(self.container)) return;
			for(var i in envelopeArray) {
				fl.buildElement(envelopeArray[i]);
			}		
		});
	}


	fl.checkContainer = function(id) {
		id = "#" + fl.env.container; //id;
		
		if($(id).length == 0) {
			alert("no container found! please insert <div class=\"" + id + "\"/> at desired position inside your html!");
			return;
		}
		if( $(id + " ul").length == 0) {
			fl.log("no <ul>. creating this by myself.");
			var ul = $('<ul></ul>').addClass('flypContainer');
			$(id).append(ul)
		}
		return true;
	}


	fl.buildElement = function(envelope) {
		var m = envelope.message;
		var header = $("<header></header>");
	
		header.append('<p>' + envelope.message.user.name + '</p>');
		var content = $('<content></content>');
		if(m.media && m.media.image) {
			var img = $("<img></img>");
			img.attr("src", m.media.image.url);
			img.css("width","100%");
			img.css("height", "100%");
			content.append(img);
		}
		content.append('<p>' + 	envelope.message.text + '</p>');
	
		var footer = $('<footer></footer>');
		footer.append('<p>' + envelope.message.service + '</p>');
	
		var li = $('<li></li>');
		li.append(header);
		li.append(content);
		li.append(footer);
		
		$("#" + this.container + " ul").prepend(li);
	}


	fl.initAnimation = function() {
		window.requestAnimationFrame(this.animate);
	}


	fl.scroller = function() {
		fl.log("scrollerX");
		fl.log($(".flypContainer").scrollTop());
		var self = this;
		
		window.requestAnimationFrame(fl.scroller);
	}

	fl.mover = function(){
		var li = $('#' + fl.env.container + " ul li:last-child").detach();
		fl.log("detach: " , li);
		var oH = li.height;
		fl.log(oH);
		$('#' + fl.env.container + " ul li:first-child").prepend(li);
	}

	fl.log = function(s) {
		if (typeof console === "undefined"){
		    console={};
    		console.log = function(){
        		return;
    		}
		}
		console.log(s);
	}	
	

	$(document).ready( function(){
		window.setInterval(fl.mover,3000);
	});

	return fl;
	
}(Flyp || {}));


// nimmt die url auseinander und erzeugt params.obj
var scripts = document.getElementsByTagName('script');
var myScript = scripts[ scripts.length - 1 ];
var queryString = myScript.src.replace(/^[^\?]+\??/,'');
var params = parseQuery( queryString );

function parseQuery ( query ) {
   var Params = new Object ();
   if ( ! query ) return Params; // return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) continue;
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}


var FlypConfig = {};
FlypConfig.owner = params.owner;
FlypConfig.event = params.event; // = "http://hitchbot.journal.flyp.tv/rio";
FlypConfig.container = params.container; //'#myFlypContainer';
FlypConfig.stream = params.stream; //'#myFlypContainer';

// könnte man auch die params direkt reinwerfen...
// jQuery fehlt noch...
Flyp.init(FlypConfig);