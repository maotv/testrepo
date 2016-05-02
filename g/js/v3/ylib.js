var yLib = {};

yLib.global = this;

// uncomment this line to enable logging output
this.logging = false;


// ********************************************************************************************************
//
// Events
//
// ********************************************************************************************************

yLib.addListener = function(elm, trigger, self, cback, args)//{{{
{
    
    if (!elm || (!elm.addEventListener && !elm.attachEvent) || !cback) return;
    
    if (!args) args = [];

    var m = function (evt)
    {
    if (!self) self = this;
    args.unshift(evt);
    cback.apply(self, args);
        
    };

    if (!elm.__anonListener__) elm.__anonListener__ = {};
    if (!elm.__anonListener__[trigger]) elm.__anonListener__[trigger] = [];
    elm.__anonListener__[trigger].push({anon: m, cback: cback});
    
    if(elm.addEventListener) {
        elm.addEventListener(trigger, m, false);
    } else {
        elm.attachEvent('on'+trigger, m);
    }

};//}}}

yLib.removeListener = function(elm, trigger, cback)//{{{
{
    if (!elm || (!elm.removeEventListener && !elm.detachEvent) || !cback || !elm.__anonListener__ || !elm.__anonListener__[trigger]) return;

    var m = null;
    var t = elm.__anonListener__[trigger];

    var nt = [];
    for (var i = 0; i < t.length; i++)
    {
    if (t[i].cback == cback)
    {
        m = t[i].anon;
        continue;
    }
    nt.push(t[i]);
    }

    if (m) {
        if(elm.removeEventListener) {
            elm.removeEventListener(trigger, m, false);
        }
        if(elm.detachEvent) {
            elm.detachEvent(trigger, m);
        }
    }    
        
    elm.__anonListener__[trigger] = nt;
};//}}}

yLib.preventDefault = function(evt)//{{{
{
    if (evt.preventDefault) evt.preventDefault();
    evt.returnValue = false;
};//}}}


// ********************************************************************************************************
//
// Communication
//
// ********************************************************************************************************

yLib.httpGet = function(args)//{{{
{
    var req = null;

    // if (yLib.global['XMLHttpRequest'] ) { // && !yLib.global['XDomainRequest']   // good in IE8 to get Cookies
    if (yLib.global['XMLHttpRequest'])
    {
        req = new XMLHttpRequest();
    }
    else if (yLib.global['XDomainRequest']) //  && !yLib.global['XDomainRequest'] )   // good in IE8 to see the chat, BUT: no cookies
    {
        req = new XDomainRequest();
    }
    else
    {
        return;
    }

    if (yLib.isIEVersion(0,99)) req.withCredentials = true;

    var isIE7 = yLib.isIEVersion(0, 7.99);
    var isIE8 = yLib.isIEVersion(8.0, 8.99);
    
    req.onload = function (e)//{{{
    {
        if (!args.onLoad)
        {
            return;
        }
           
        args.onLoad(e);
    };//}}}

    req.onreadystatechange = function(e)//{{{
    {
        if (!args.onStateChange && args.debug)
        {
            return;
        }

        if (req.readyState == 4 && args.onComplete) args.onComplete(req, e);

        if (args.onStateChange && !args.onStateChange(req)) return;

        if ((isIE7 || isIE8) && req.readyState == 4)
        {
            req.onload(e);
        }
        
    };//}}}

    req.onerror = function(e)//{{{
    {
        if (!args.onError)
        {
            yLib.errorLog("yLib.req.onerror: " + args.url +" " + e);
            return;
        }

        args.onError(e);
    };//}}}

    req.open("GET", args.url, true);
    req.send();

    return req;
};//}}}

yLib.getRio = function(args){//{{{
    return new Rio(args);
}//}}}

yLib.getShanghai = function(args){//{{{
    return new Shanghai(args);
}//}}}

yLib.transmissionToDataArray= function(tr)//{{{
{
    var dataList = [];
    var chnodes = [];

    if (tr.childNodes.length > 1)
    chnodes = (tr.childNodes[0].nodeType == 1)? tr.childNodes[0].childNodes: tr.childNodes[1].childNodes;
    else
    chnodes = tr.firstChild.childNodes;

    var i, j, n, d, p, props;

    for (i = 0; i < chnodes.length; i++)
    {
    n = chnodes[i];
    if (n.nodeType != 1) continue;
    dataList.push(n);
    }

    return dataList;
}//}}}

// ********************************************************************************************************
//
// HTML / DOM Manipulation
//
// ********************************************************************************************************

yLib.hide = function(elm)//{{{
{
    yLib.css(elm, 'display', 'none');
};//}}}

yLib.show = function(elm)//{{{
{
    yLib.css(elm, 'display', 'block');
};//}}}

// add/update css propertie on element
yLib.css = function(elm, k, v)//{{{
{
    if (!elm || !elm.style) return;
    elm.style[k] = v;
};//}}}

yLib.addClass = function(elm, cname)//{{{
{
    if (!elm || !cname) return;
    elm.className += cname;
};//}}}

yLib.removeClass = function(elm, cname)//{{{
{
    if (!elm || !cname) return;
    elm.className.replace(new RegExp('(?:^|\s)' + cname + '(?!\S)') , '');
}//}}}

// attributes array [[name,value],[name,value]]
yLib.newElement = function (type, attributes)//{{{
{
    var e = document.createElement(type);
    for( var i=0; i<attributes.length; i++){
    attr = attributes[i];
    e.setAttribute(attr[0],attr[1]);
    }
    return e;
}//}}}

yLib.createElementTree = function(elems)//{{{
{
    var e = document.createElement(elems[0]);
    var prev = e;
    for(var i=1; i< elems.length;i++){
    var s = document.createElement(elems[i]);
    prev.appendChild(s);
    prev = s;
    }
    
    return e;
    
}//}}}

// ********************************************************************************************************
//
// Tools / Helper
//
// ********************************************************************************************************
yLib.dateObjFromMySQLDateTime = function(str)//{{{
{
    try {
		var dtarr = str.split(' ');
    		var darr = dtarr[0].split('-');
    		var tarr = dtarr[1].split(':');
    		if (tarr.length == 3) {
    			return new Date(new Number(darr[0]), new Number(darr[1])-1, new Number(darr[2]), new Number(tarr[0]), new Number(tarr[1]), new Number(tarr[2]), 0);
    		} else if (tarr.length == 2) {
    			return new Date(new Number(darr[0]), new Number(darr[1])-1, new Number(darr[2]), new Number(tarr[0]), new Number(tarr[1]), 0, 0);
    		} else if (tarr.length == 1) {
    			return new Date(new Number(darr[0]), new Number(darr[1])-1, new Number(darr[2]), new Number(tarr[0]), 0, 0, 0);
    		} else if (tarr.length == 0) {
    			return new Date(new Number(darr[0]), new Number(darr[1])-1, new Number(darr[2]), 0, 0, 0, 0);
    		}
	} catch(e) {return new Date();}
}//}}}

yLib.getInternetExplorerVersion = function()//{{{
{
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null) rv = parseFloat( RegExp.$1 );
    }

    return rv;
};//}}}

yLib.isIEVersion = function(min, max)//{{{
{
    var ver = yLib.getInternetExplorerVersion();
    if (ver < 0) return false;
    if (min <= ver && ver <= max) return true; 
    return false;
};//}}}

yLib.isNumber = function(n)//{{{
{
    return (!isNaN(n) && isFinite(n));
}//}}}

yLib.isWindow = function(elm)//{{{
{
    return (elm != null && elm == elm.window);
}//}}}

yLib.boxModel = function()//{{{
{
    return (document.compatMode === "CSS1Compat");
}//}}}

yLib.elementDimension = function(elm)//{{{
{
    var doc, docElemProp, orig, ret;

    if (yLib.isWindow(elm)) { // is window

    doc = elm.document;

    var w = doc.documentElement["clientWidth"];
    var h = doc.documentElement["clientHeight"];

    if (!yLib.boxModel() && doc.body) {
        w = doc.body["clientWidth"];
        h = doc.body["clientHeight"];
    }

    return {width: w, height: h};
    }

    // document width or height
    if ( elm.nodeType === 9 ) {
    // either scroll[Width/Height] or offset[Width/Height], whichever is greater
    doc = elm.documentElement;

    var w, h;

    // when a window > document, IE6 reports a offset[Width/Height] > client[Width/Height]
    // so we can't use max, as it'll choose the incorrect offset[Width/Height]
    // instead we use the correct client[Width/Height]
    // support:IE6
    if (doc["clientWidth"] >= doc["scrollWidth"]) {
        w = doc["clientWidth"];
    } else {
        w = Math.max(
        elm.body["scrollWidth"], doc["scrollWidth"],
        elm.body["offsetWidth"], doc["offsetWidth"]
        );
    }

    if (doc["clientHeight"] >= doc["scrollHeight"]) {
        h = doc["clientHeight"];
    } else {
        h = Math.max(
        elm.body["scrollHeight"], doc["scrollHeight"],
        elm.body["offsetHeight"], doc["offsetHeight"]
        );
    }

    return {width: w, height: h};
    }

    // width or height on the element
    var cssW = elm.style.width;
    var cssH = elm.style.height;

    var f = parseFloat(cssW);
    var w = (yLib.isNumber(f))? f: 0;

    f = parseFloat(cssH);
    var h = (yLib.isNumber(f))? f: 0;

    return {width: w, height: h};
};//}}}

yLib.scrollPosition = function(elm)//{{{
{
    var win;

    if (yLib.isWindow(elm)) {
    win = elm;
    } else if (elm.nodeType == 9) {
    win = elm.defaultView || elm.parentWindow;
    } else {
    win = false;
    }

    var ret = {left: 0, top: 0};

    if (win) {
    if (win['pageXOffset']) {
        ret.left = win['pageXOffset'];
    } else if (yLib.boxModel() && win.document.documentElement['scrollLeft']) {
        ret.left = win.document.documentElement['scrollLeft'] || win.document.body["scrollLeft"];
    }

    if (win['pageYOffset']) {
        ret.top = win['pageYOffset'];
    } else if (yLib.boxModel() && win.document.documentElement['scrollTop']) {
        ret.top = win.document.documentElement['scrollTop'] || win.document.body["scrollTop"];
    }
    } else {
    ret.top = elm['scrollTop'];
    }

    return ret;
};//}}}

yLib.createCover = function(zindex)//{{{
{
    var body = document.getElementsByTagName('body')[0];

    if (!zindex) zindex = '9999998';

    var bgdiv = document.createElement('div');
    bgdiv.style.position    = 'absolute';
    bgdiv.style.top         = '0px';
    bgdiv.style.left        = '0px';
    bgdiv.style.width       = yLib.elementDimension(window).width   + 'px';
    bgdiv.style.height      = yLib.elementDimension(window).height  + 'px';
    bgdiv.style.background  = '#000000';
    bgdiv.style.opacity     = '0.8';
    bgdiv.style.filter      = 'alpha(opacity=80)';
    bgdiv.style.zIndex      = parseInt(zindex, 10);

    body.appendChild(bgdiv);

    return bgdiv;
};//}}}

yLib.createPopup = function(iID, url, w, h)//{{{
{
    var body = document.getElementsByTagName('body')[0];

    var bgdiv = yLib.createCover('9999997');

    var cls = function (evt)
    {
    body.removeChild(bgdiv);
    //iframe.src = 'about:blank';
    iframe.style.display = 'none';
    iframe.btnClose.style.display = 'none';
    };

    bgdiv.onclick = cls;

    var iframe = document.getElementById(iID);
    if (!iframe)
    {
    iframe = document.createElement('iframe');
    iframe.id               = iID;
    iframe.name             = iID;

    iframe.btnClose = document.createElement('a');
    iframe.btnClose.id = iID + '_close';
    iframe.btnClose.appendChild(document.createTextNode('X'));

    body.appendChild(iframe);
    body.appendChild(iframe.btnClose);
    }

    iframe.width      = w;
    iframe.height     = h;
    iframe.src        = url;

    var itop = yLib.scrollPosition(window).top + (yLib.elementDimension(window).height - h) / 2;
    var ileft = (yLib.elementDimension(window).width - w) / 2;

    iframe.style.position   = 'absolute';
    iframe.style.border     = '1px none #ffffff';
    iframe.style.top        = itop + 'px';
    iframe.style.left       = ileft + 'px';
    iframe.style.width      = w + 'px';
    iframe.style.height     = h + 'px';
    iframe.style.zIndex     = '9999998';
    iframe.style.display    = 'block';

    iframe.btnClose.style.position = 'absolute';
    iframe.btnClose.style.zIndex     = '9999998';
    iframe.btnClose.style.display    = 'block';
    iframe.btnClose.style.top        = (itop + 5) + 'px';
    iframe.btnClose.style.left       = (ileft + w - 20) + 'px';
    iframe.btnClose.style.width      = '20px';
    iframe.btnClose.style.height     = '20px';

    iframe.btnClose.onclick = cls;
};//}}}

yLib.queryArgs = function()//{{{
{
    var args = {};

    var search = window.location.search;
    if (search && search.length > 1)
    {
    var argsarr = search.substr(1).split('&');
    var a,k,v;
    for (var i = 0; i < argsarr.length; i++)
    {
        a = argsarr[i].split('=');
        if (!a || a.length != 2) continue;
        args[a[0]] = a[1];
    }
    }

    return args;
};//}}}

yLib.errorLog = function(s)//{{{
{
    // errohandling
    if (yLib.global['console']) console.error(s);
}//}}}

yLib.log = function(s)//{{{
{
    // logging
    if (yLib.global['console'] && yLib.global['logging']) console.log(s);
}//}}}

yLib.xmlDocFromString = function (s)//{{{
{
    if (window.DOMParser)
    {
    var parser = new DOMParser();
    return parser.parseFromString(s, "text/xml");
    }
    else if (yLib.global['ActiveXObject'])
    {
    var parser = new ActiveXObject("Microsoft.XMLDOM");
    parser.loadXML(s)
    return parser;
    }

    return null;
}//}}}

yLib.objectFromNodeProperties = function (n)//{{{
{
    return yLib.objectFromNodeElements(n, 'property');
}//}}}

yLib.objectFromNodeElements = function (n, nodename)//{{{
{
    var propNodes = n.getElementsByTagName(nodename);
    var props = {};
    var p;
    for (var i = 0; i < propNodes.length; i++)
    {
		var propName = yLib.getAttribute(propNodes[i], "name");
		var propValue = "";

		if(yLib.getAttribute(propNodes[i], "value") != null){
			propValue = yLib.getAttribute(propNodes[i], "value")
		}else if( propNodes[i].childNodes.length > 0){
			propValue =  propNodes[i].childNodes[0].nodeValue;
		}
		   
		props[propName] = propValue;
    
    }
    return props;
}//}}}

yLib.getAttribute = function(node, attribute){//{{{
    var isIE8orLower = yLib.isIEVersion(0, 8.99);
    if (isIE8orLower)
    {
        var att = node.attributes.getNamedItem(attribute);
        if (att)
        {
            return node.attributes.getNamedItem(attribute).nodeValue;
        }
        return null;
    }
    else
    {
        return node.getAttribute(attribute);
    }
}//}}}

yLib.dateObjToString = function(format, d)//{{{
{
    var mname = 'dateObjToString_' + format;
    if (yLib[mname]) return yLib[mname](d);
    return "unknown format";
}//}}}

yLib.dateObjToString_DDMMYYYY = function(d)//{{{
{
    if (!d) return "";

    var dd = d.getDate() + "";
    if (dd.length < 2) dd = "0" + dd;

    var mm = (d.getMonth() + 1) + "";
    if (mm.length < 2) mm = "0" + mm;

    var yyyy = d.getFullYear();

    return dd + "." + mm + "." + yyyy;
}//}}}

yLib.dateObjToString_HHMMSS = function(d)//{{{
{
    if (!d) return "";

    var hh = d.getHours() + "";
    if (hh.length < 2) hh = "0" + hh;

    var mm = d.getMinutes() + "";
    if (mm.length < 2) mm = "0" + mm;

    var ss = d.getSeconds() + "";
    if (ss.length < 2) ss = "0" + ss;

    return hh + ":" + mm + ":" + ss;
}//}}}

yLib.dateObjToString_HHMM = function(d)//{{{
{
    if (!d) return "";

    var hh = d.getHours() + "";
    if (hh.length < 2) hh = "0" + hh;

    var mm = d.getMinutes() + "";
    if (mm.length < 2) mm = "0" + mm;

    return hh + ":" + mm;
}//}}}

yLib.spadd = function(s, l, p)//{{{
{
    if (!s) s = '';
    if (!p) p = ' ';
    if (!l) l = 0;
    for (var i = s.length; i < l; i++)
    {
        s = p + s;
    }
    return s;
}//}}}

// ********************************************************************************************************
//
// Communication Rio Style
//
// ********************************************************************************************************

var Rio = function(args)//{{{
{
    var a = this.args = args;

    if (!a.postUpdate) a.postUpdate = function (){};
    if (!a.startRuntimePhase) a.startRuntimePhase = function() {};

    this.url = a.url;
}//}}}

Rio.prototype.pollInterval = 7000; // time between regular update calls
Rio.prototype.rapidUpdateInterval = 2; // time between immediate updates
Rio.prototype.time = 0;
Rio.prototype.timeoffset = 0;
Rio.prototype.lifetimePower = 4;
Rio.prototype.initialRequest = true;
Rio.prototype.firstResponse = true;
Rio.prototype.running = true;
Rio.prototype.revision = -1;
Rio.prototype.requestRevision = 0;
Rio.prototype.intervalCallerActive = false;
Rio.prototype.PATH_FIRST = "rio/first.json";
Rio.prototype.PATH_POLL = "rio/carrier.json";
Rio.prototype.PATH_INITIAL = "rio/initial.json";
Rio.prototype.PATH_UPDATE = "rio/u";
Rio.prototype.PATH_STREAM = "rio/s";
Rio.prototype.REVISION_MASK = 255;
Rio.prototype.FILE_NAME_LENGTH = 4;
Rio.prototype.currentRequest = null;
Rio.prototype.transmissionRequest = "notyet";

Rio.prototype.start = function()//{{{
{
    this.first();
};//}}}

Rio.prototype.first = function()//{{{
{
    var self = this;

    var r = yLib.httpGet({
        url: this.url + "/" + this.PATH_FIRST + "?" + String(Math.random()).substring(2),
        onLoad: function (evt)
        {
            var json = eval('(' + r.responseText + ')');
            var t = self.time = json.time*1000;
            self.timeoffset = (new Date().getTime()) - t;
            self.revision = json.revision;
            self.evalCarrierJSON(json);
            self.initial();
        }
    });
}//}}}

Rio.prototype.evalCarrierJSON = function(json)//{{{
{
    this.commitcode = (json.commit)? json.commit: this.commitcode;
    this.pollInterval = (json.pollInterval)? json.pollInterval: this.pollInterval;
    this.lifetimePower = (json.lifetimePower)? json.lifetimePower: this.lifetimePower;
}//}}}

Rio.prototype.initial = function()//{{{
{
    var self = this;

    var r = yLib.httpGet({
        url: this.url + "/" + this.PATH_INITIAL + "?commitcode=" + this.commitcode,
        onLoad: function (evt)
        {
            var json = eval('(' + r.responseText + ')');
            self.updateRevision = self.revision = json.revision;
            self.evalCarrierJSON(json);
            self.waitForUpdate();
            self.args.postUpdate(json);
        }
    });
}//}}}

Rio.prototype.waitForUpdate = function()//{{{
{
    var self = this;

    this.args.startRuntimePhase();

    var nua = navigator.userAgent;
    var isaw = this.is_android_webview = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));

    if (!isaw && yLib.global['WebSocket'])
    {
        // this.websocket = new WebSocket();
        // return;
    }

    this.poll();
};//}}}

Rio.prototype.poll = function()//{{{
{
    if (this.pollInCall) return;

    var self = this;

    var r = yLib.httpGet({
        url: this.url + "/" + this.PATH_POLL + "?" + this.pcode((new Date().getTime()) - this.timeoffset, this.lifetimePower),
        onComplete: function (evt)
        {
          
          console.log("poll complete " + r.state);
          
            setTimeout(function () {
                self.pollInCall = false;
                self.poll();
            }, self.pollInterval);

            // FIXME LEvon: r.state ist undefined
            if ( r.state > 399 ) return;

            console.log("poll cont.");
            var json = eval('(' + r.responseText + ')');
            self.revision = json.revision;
            self.evalCarrierJSON(json);
            self.update();
        }
    });
};//}}}

Rio.prototype.update = function()//{{{
{
    console.log("one");
    if (this.updateInCall || this.updateRevision >= this.revision) return;
    console.log("two");

    this.updateInCall = true;
    var self = this;

    var f = function()
    {
        if (self.updateRevision >= self.revision)
        {
            console.log("end");
            self.updateInCall = false;
            return;
        }

        console.log("letsgo");


        var urev = self.updateRevision + 1;
        var surev = yLib.spadd((urev & self.REVISION_MASK).toString(16), self.FILE_NAME_LENGTH, '0');

        var r = yLib.httpGet({
            url: self.url + "/" + self.PATH_UPDATE + "/" + surev + ".json?" + urev,
            onComplete: function()
            {
                self.updateRevision = urev;
                if (r.status == 200)
                {
                    var json = eval('(' + r.responseText + ')');
                    self.evalCarrierJSON(json);
                    self.args.postUpdate(json);
                }

                f();
            }
        });
    };

    f();
};//}}}

Rio.prototype.pcode = function(t, p)//{{{
{
    var tm = parseInt(t / 1000, 10);
    var mask = 0xfffffff ^ ((1 << p) - 1);
    var val = tm & mask;

    if (val < 0)
    {
        val = 0xFFFFFFFF + val + 1;
    }

    return val.toString(16).toUpperCase();
}//}}}

Rio.prototype.getBucketMessages = function(stream, bucknum, cback)//{{{
{
    if (!cback) cback = function() {};
    if (!bucknum) bucknum = 0;
    if (!stream) stream = 'public';

    var buckfold = Math.floor(bucknum/256);
    var sbuckpath = yLib.spadd(buckfold.toString(16), 6, '0') + '/' + yLib.spadd(bucknum.toString(16), 6, '0') + '.json';

    var r = yLib.httpGet({
        url: this.url + '/' + this.PATH_STREAM + '/' + stream + '/' + sbuckpath,
        onLoad: function()
        {
            var json = eval('(' + r.responseText + ')');
            var msgs = [], m, itms = json.items;
            if (!itms) itms = [];
            for (var i = 0, ii = itms.length; i < ii; i++)
            {
                m = itms[i];
                if (m.deleted) continue;
                msgs.push(m);
            }
            cback(msgs);
        }
    });
}//}}}

Rio.prototype.requestMoreMessages = function(stream, pos, length, cback)//{{{
{
    var self = this;

    var bucknum = Math.floor(pos/16);
    var messages = [];
    if (!length) length = 10;
    if (!cback) cback = function () {};

    var mpusher = function (bmessages)
    {
        var m;
        for (var i = bmessages.length - 1; i > 0; i--)
        {
            m = bmessages[i];
            if (messages.length >= length) break;
            if (m.index < pos) messages.push(m);
        }

        if (messages.length >= length || bucknum == 0)
        {
            cback(messages);
            return;
        }

        bucknum -= 1;
        self.getBucketMessages(stream, bucknum, mpusher);
    }; 

    this.getBucketMessages(stream, bucknum, mpusher);
}//}}}

// ********************************************************************************************************
//
// Communication Shanghai Style - needs yLib.httpGet + yLib.xmlDocFromString
//
// ********************************************************************************************************

var Shanghai = function(args)//{{{
{
    this.listener = {};
    this.listener.onTransmission = (args.onTransmission) ? args.onTransmission: function (d){ };
}//}}}

Shanghai.prototype.pollInterval = 5; // time between regular update calls
Shanghai.prototype.rapidUpdateInterval = 2; // time between immediate updates
Shanghai.prototype.time = 0;
Shanghai.prototype.timeoffset = 0;
Shanghai.prototype.lifetimePower = 3;
Shanghai.prototype.useFirstXML = true;
Shanghai.prototype.initialRequest = true;
Shanghai.prototype.firstResponse = true;
Shanghai.prototype.running = true;
Shanghai.prototype.revision = -1;
Shanghai.prototype.requestRevision = 0;
Shanghai.prototype.intervalCallerActive = false;
Shanghai.prototype.firstXMLFilename = "first.xml";
Shanghai.prototype.stateXMLFilename = "state.xml";
Shanghai.prototype.channelFilename = "channel-";
Shanghai.prototype.updateFilename = "update-";
Shanghai.prototype.currentRequest = null;
Shanghai.prototype.transmissionRequest = "notyet";

Shanghai.prototype.start = function(url)//{{{
{
    var self = this;

    this.url = url;
    this.request();
};//}}}

Shanghai.prototype.request = function()//{{{
{
    var self = this;
    var now = new Date().getTime();
    var isecs = 1 << this.lifetimePower;
//    var rtime = (now + (isecs*1000)) - this.timeoffset;
    var rtime = new Date().getTime() - this.timeoffset;

    if ( this.initialRequest ) {
        this.idstr = String(Math.random()).substring(2);
    } else {
        this.idstr = this.pcode(rtime);
    }

    var firstUrl, query;
    if (this.initialRequest && this.useFirstXML) {
        firstUrl = this.url + "/" + this.firstXMLFilename;
        query =  firstUrl + "?" + this.idstr;
    } else {
        query =  this.url + "/" + this.stateXMLFilename + "?" + this.idstr;
    }

    this.currentRequest = yLib.httpGet(
        {
            onLoad: function (evt)
            {
                self.requestLoaded(evt);
            },
            url: query
        }
    );
    
}//}}}

Shanghai.prototype.requestLoaded = function(evt)//{{{
{

    var doc = yLib.xmlDocFromString(this.currentRequest.responseText);
    if (!doc) return;

    var state = doc.firstChild;
    if (state.nodeName == "xml") {
        state = doc.childNodes[1];
    }

    var now = new Date().getTime();
    var tmp = null;

    tmp = yLib.getAttribute(state,"protocol");
    //tmp = state.getAttribute("protocol");
    if ( tmp == null || tmp.length == 0 ) {
        this.protocolVersion = 1;
    } else {
        this.protocolVersion = parseInt(tmp, 10);
    }

    // read time from state.xml
    if (this.time == 0) {
        var serverTime = 0;

        tmp = yLib.getAttribute(state,"time");
        //tmp = state.getAttribute("time");
        if (tmp != null && tmp.length != 0) {
            serverTime = parseInt(tmp * 1000, 10);
        }
        this.time = serverTime;
    }

    if (this.initialRequest) {
        this.timeoffset = now - this.time;
        this.initialRequest = false;
    }
    
    tmp = yLib.getAttribute(state,"serial");
    //tmp = state.getAttribute("serial");
    if (tmp == null || tmp.length == 0) {
        this.serial = 0;
    } else {
        this.serial = parseInt(tmp, 10);
    }

    tmp = yLib.getAttribute(state,"pi");
    //tmp = state.getAttribute("pi");
    if (tmp != null && tmp.length != 0) {
        var piattr = parseInt(tmp, 10);
        if (piattr > 0 && piattr < 600) {
            this.pollInterval = piattr;
        }
    }

    tmp = yLib.getAttribute(state,"lt");
    //tmp = state.getAttribute("lt");
    if (tmp != null && tmp.length != 0) {
        var ltattr = parseInt(tmp, 10);
        if (ltattr > 0 && ltattr < 10) {
            this.lifetimePower = ltattr;
        }
    }
    
    this.onStateResponse();
};//}}}

Shanghai.prototype.onStateResponse = function()//{{{
{
    
    if (!this.running) return;

    var self = this;
    if (this.firstResponse) {
        this.firstResponse = false;
        this.mustHandleResponse = false;
        // handle the response here if true
        // working around an MSIE bug where onload is called before transmissionrequest is set
        this.requestRevision = this.serial;
        var urlx = this.url + "/" + this.channelFilename + this.serial + ".xml";
        this.transmissionRequest = yLib.httpGet(
            {
                onLoad: function (evt)
                {
                    self.mustHandleResponse = self.onTransmission();
                },
                url: urlx
            }
        );
    } else {
        if ( this.serial > this.revision ) {
                this.mustHandleResponse = false;
            this.requestRevision = this.revision + 1;
            var url = this.url + "/" + this.updateFilename + this.requestRevision + ".xml"; 
            this.transmissionRequest = yLib.httpGet(
            {
                onLoad: function (evt)
                {
                    self.mustHandleResponse = self.onTransmission();
                },
                url: url
            }
            );
        } else {
            this.theShowMustGoOn();
        }
    }
    
     if (this.mustHandleResponse) {
        this.onTransmission();
    }
};//}}}

Shanghai.prototype.fetchUpdate = function()//{{{
{
    var self = this;
        this.mustHandleResponse = false;
    this.requestRevision = this.revision + 1;
    var url = this.url + "/update-" + this.requestRevision + ".xml";
    this.transmissionRequest = yLib.httpGet(
        {
            onLoad: function (evt)
            {
            self.mustHandleResponse = self.onTransmission();
            },
            url: url
        }
        );
        if(this.mustHandleResponse){
            this.onTransmission();
        }
}//}}}

Shanghai.prototype.theShowMustGoOn = function()//{{{
{
    var self = this;

    if (!this.intervalCallerActive) {
    this.intervalCallerActive = true;
    
    if(  this.serial > this.revision ){
        // still not up to date - fetch all updates in rapid mode
        this.stateICaller = setTimeout(
        function ()
        {
            self.intervalCallerActive = false;
            self.fetchUpdate();
        },
        this.rapidUpdateInterval * 1000
        );
        
    }else{
        
        // up to date - get updates in regular mode
        this.stateICaller = setTimeout(
        function ()
        {
            self.intervalCallerActive = false;
            self.request();
        },
         this.pollInterval * 1000
        );
        
    }
    
    
    
    }
};//}}}

Shanghai.prototype.onTransmission = function(evt)//{{{
{
    var i = 1;
    if(this.transmissionRequest == "notyet"){
        return true;
    }
    
    
    this.revision = this.requestRevision;
    this.theShowMustGoOn();
    
   
  
    var doc = yLib.xmlDocFromString(this.transmissionRequest.responseText);
    if (!doc) return;
    this.listener.onTransmission(doc);
    this.mustHandleResponse = false;
}//}}}

Shanghai.prototype.pcode = function(t)//{{{
{
    var tm = parseInt(t / 1000, 10);
    var mask = 0xfffffff ^ ((1<<this.lifetimePower)-1);
    var val = tm & mask;

    if (val < 0)
    {
        val = 0xFFFFFFFF + val + 1;
    }

    val = val.toString(16).toUpperCase();

    return val; 
};//}}}

Shanghai.prototype.configureIntervals = function(interval, lifetime)//{{{
{
    this.pollInterval = interval;
    this.lifetimePower = lifetime;
};//}}}
