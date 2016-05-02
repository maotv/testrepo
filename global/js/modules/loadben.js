!function(){
	var scripts = document.getElementsByTagName('script');
	var current = scripts[scripts.length-1].src;
	var eventobj = getEvent(current);

	var setup = {
		container: 'myFlypContainer3',
		style:     'module1',
		owner:     eventobj.owner,
		event:     eventobj.event,
		stream:    'content',
		imagevariant: 'small',
		animfunc:   'fade', // fade oder slide
		interval:   5000,  
		poll:       true,
		parts:      {header: 0, content: 1, footer:0.21},
		template:   '\
	<li class="STYLE CSERVICE">\
	<header></header>\
	<content>LINK\
	MIMG\
	<p>MTEXT</p>\
	ENDLINK</content>\
	<footer><p>USERSERVICELINEORHEADLINE</p></footer>\
	</li>',
		overlayarea: 0.3,
		defaultlink: ''
	};

	var q = current.split('?').pop();
	q = q.replace(/amp;/g, '');
	var qarr = q.split('&');
	for (var i = 0; i < qarr.length; i++) {
		var parr = qarr[i].split('=');
		setup[parr[0]] = parr[1];
	}

	function go(){
		if (typeof jQuery != "function" || typeof Flyp != "object" || typeof Flyp.Module != "function") {window.setTimeout(go, 100);return}
		new Flyp.Module(setup);
	}
	
	var jstoload = [
	  "//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js",
	  "//d3kcx7oxb4qpd2.cloudfront.net/global/js/modules/vienna.js",
	  "//flyp.cc/global/js/modules/module.v3.js"
	];
	if (typeof jQuery == "function") jstoload.shift(); // don't load jQuery if already present

	var csstoload = [
	  // fixme: so soll es wieder werden!!! "//d3kcx7oxb4qpd2.cloudfront.net/global/js/modules/"+ setup['style'] +".css",
	  "//d3kcx7oxb4qpd2.cloudfront.net/global/css/flypicons.css",
	  "//flyp.cc/global/js/modules/"+ setup['style'] +".css"
	];
	
	// the loading functions... if already loaded, they don't load again... (using document.flypfilesloaded)
	if (typeof document.flypfilesloaded !== "object") document.flypfilesloaded = {};
	!function(e,t,r){function n(){for(;d[0]&&"loaded"==d[0][f];)c=d.shift(),c[o]=!i.parentNode.insertBefore(c,i)}for(var s,a,c,d=[],i=e.scripts[0],o="onreadystatechange",f="readyState";s=r.shift();){if (document.flypfilesloaded[s]) continue;document.flypfilesloaded[s]=true, a=e.createElement(t),"async"in i?(a.async=!1,e.head.appendChild(a)):i[f]?(d.push(a),a[o]=n):e.write("<"+t+' src="'+s+'" defer></'+t+">"),a.src=s}}(document,"script",
		jstoload
	);
	!function(f){while(f.length){var c=document.createElement("link"), fil=f.shift() ; if (!document.flypfilesloaded[fil]) {c.setAttribute("rel", "stylesheet");c.setAttribute("type", "text/css");c.setAttribute("href", fil);document.getElementsByTagName("head")[0].appendChild(c);document.flypfilesloaded[fil] = true;}}}(
		csstoload
	);

	window.setTimeout(go, 100);
	
	function getEvent(url) {
		var owner, event, ret = {}, m1, m2;
		m1 = current.match(/\/([^\/]+?)\.([^\/]+?)\.flyp\...\//);
		if (m1) {
			ret.owner = m1[2];
			ret.event = m1[1];
		} else {
			m2 = current.match(/events\/([^\/]+)\/([^\/]+)\//);
			if (m2) {
				ret.owner = m2[1];
				ret.event = m2[2];
			}
		}
		return ret;
	}

}();
