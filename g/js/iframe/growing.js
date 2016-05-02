(function () {
	var f_eventurl = document.getElementById('f_frame').getAttribute('src').match(/\/([^\/]+?)\//)[1];
	var f_body     = document.body, f_html = document.documentElement, f_allowed = false;
	var f_frameid  = "flypsiteFrame" + Math.round(Math.random()*10e15);
	document.write('<iframe id="'+ f_frameid +'" class="flypsiteFrame" frameborder="0" src="//'+ f_eventurl +'/?'+ f_frameid +'&allowmessaging" height="800px" width="100%" scrolling="no" seamless="seamless"></iframe>');

	window.addEventListener('message', function(e) {
		var message = e.data;
		var marr = message.split(':');
		var el = document.getElementById(f_frameid);
		el.style.height = (marr[1]) + "px";
		f_allowed = true;
	});
	
	window.addEventListener("orientationchange", function() {
		// reload iframe
		var el = document.getElementById(f_frameid);
		el.setAttribute('src', '//'+ f_eventurl +'/?'+ f_frameid +'&allowmessaging&' + Math.round(Math.random()*10e15));
		window.location.hash = '#top';
		window.scroll(0,0);
	}, false);
	
	window.addEventListener('scroll', function(e){
		var f_height = Math.max( f_body.scrollHeight, f_body.offsetHeight, f_html.clientHeight, f_html.scrollHeight, f_html.offsetHeight );
		document.getElementById(f_frameid).contentWindow.postMessage('frame-top:' + document.getElementById(f_frameid).getBoundingClientRect().top, '*');
		if (window.pageYOffset > f_height - window.innerHeight - 130 && f_allowed) {
			document.getElementById(f_frameid).contentWindow.postMessage('load-more', '*');
			f_allowed = false;
		}
	});
}());