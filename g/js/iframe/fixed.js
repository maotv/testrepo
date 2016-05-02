(function () {
	var src = document.getElementById('f_frame').getAttribute('src');
	var f_eventurl = src.match(/\/([^\/]+?)\//)[1];
	var f_body     = document.body, f_html = document.documentElement;
	var f_frameid  = "flypsiteFrame" + Math.round(Math.random()*10e15);
	var h      = src.match(/h=([0-9]+)/);
	if (h) h = h[1];
	else h = 200;
	var client = src.match(/client=([^&]+)/);
	if (client) client = client[1] + ".html";
	else client = "index.html";
	document.write('<div id="d'+ f_frameid +'" class="dflypsiteFrame" style="height:'+ h +'px;-webkit-overflow-scrolling:touch;"><iframe id="'+ f_frameid +'" class="flypsiteFrame" frameborder="0" src="//'+ f_eventurl +'/'+ client +'?'+ f_frameid +'" height="100%" width="100%" seamless="seamless"></iframe></div><style>@media only screen and (min-device-width : 320px) and (max-device-width : 1024px) { .dflypsiteFrame { overflow: scroll; -webkit-overflow-scrolling:touch; }} </style>');
}());