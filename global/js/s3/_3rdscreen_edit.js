var ThirdEditor = mkclass({
	
	init: function (  ) {
	
		var self = this;
		
		this.lastFrame = null;
		this.dragger = null;	
		this.lastStyle = "s1";
		this.theStyle = "s1";
		this.start();
    this.lastTile = null;
    
    this.srcListId;
    this.targetListId;
    
    this.allFrames = {};
    this.frames;
    
    this.api = new ThirdApi();
    
    this.getAllFrames();
		
	},
	
	
	start: function () {
	  this.init_listeners();
	  
	},

  getAllFrames: function()
  {
    getAllFramesA(this.allFrames);
    console.log(this.allFrames);
  },

	show_layouts: function( elem, ui ){
		var self      = this;
		var id 				= elem.attr("id");
		var framename = id.replace("frame_", "");
		var streamId   = this.allFrames[framename];
		var frames 		= the3rdscreen.frames;
		var frame 		= frames[framename];
		var sizename  = frame.size_name;		
	
		
		$("#size_headline").text( streamId + "(" + sizename.toUpperCase() + ")" );
		$("#layouts").empty();
		
		$.each( the3rdscreen.layouts, function( k, v ) {
  		if( k.indexOf( "_" + sizename + "_" ) != -1) {
  			var loFunc  = the3rdscreen.layouts[ k ];
      
    		if ( loFunc ) {
    		
        	var d = loFunc(frame, ui.draggable.data("envelope"));
        	var layoutname = k.replace(/layout_/, '').replace(sizename + "_",'');
        	
        	if(d) {
        	  
        	  d.attr("streamId", streamId);
        	  d.attr("framename", framename);
        	  
        		d.addClass(self.theStyle);
        		d.data("envelope", ui.draggable.data("envelope"));
        		       		
        		d.attr("layout", layoutname);
        		d.attr("stylename", '');
        		var p = ce("span");
        		p.text(layoutname);
        		p.addClass("layout_info");
        		d.prepend(p);
        		d.click( function(){
        			self.prepare_tile(this);
        		});
        		$("#layouts").append(d);
  				}
  			}
  		} 			
		});
	},
	
	fillEditor: function(ui) {
	  var m = ui.draggable.data("envelope").message;
		$('#ed_headline').html( m.headline );
		$('#ed_text').text( m.text );
		//$('#ed_user').text( ui.draggable.data("envelope").content.user.name );
		//$('#ed_handle').text( ui.draggable.data("envelope").content.user.handle );
	},
	
	fillMessageList: function() {
	  // deprecated
	  return;
		for(var i = 0; i < the3rdscreen.update.length; i++) {
			$("#messagelist").append( this.buildMessage(the3rdscreen.update[i]) );
		}
	},

	buildMessageX: function( env ) {
	  if(env == undefined) return;
	  //console.log("buildMessage");
	  var m = env.message;
		var envelope = {
			revision: env.revision,
			id: env.id,
			mid: "m" + env.id,
			message: {
				user: {
					name: m.user.name,
					handle: m.user.handle,
					link: m.user.link,
					service: m.user.service
				},
				frame: 	m.frame,
				layout: m.layout,
				text: 	m.text,
				color: 	m.color,
				video: 	m.video,
				style: 	m.style,
				link:		m.link,
				info:		m.info,
				id: m.id,
				headline: m.headline,
				slideshow: m.slideshow,
				mediatype: m.mediatype,
				mediaurl: m.mediaurl
			}
			
		}
		if(m.media) {
		  envelope.message.media = { url: m.media.url };
		}
		
		var d = ce("div");
		d.addClass("message");
		d.attr("id", "m" + env.id);
    d.attr("usecount", "" + m.usecount);




    user_img_src = "";
    if(ck(m.user) && ck(m.user.icon)) user_img_src = m.user.icon;
    
    user_name = "";
    if(ck(m.user) && ck(m.user.name)) user_name = m.user.name;




    var inner2 = new Array(
       '<div class="v3_msg_container">',
       '	<div class="v3_left_bar"><img alt="" src="' + user_img_src + '"><br/><span mid="' + m.id + '" class="fr cp v3_show_headline unlocked" onclick="lockMessage(this)"></span></div>',
       '	<div class="v3_msg_content">',
       '		<div class="v3_username">' + user_name + '</div>',
       '		<div class="v3_service">' + m.service + '</div>',
       '		<div class="v3_headline ce" contenteditable="false" onblur="if ( !compareEditable(this) ){ updateMessage(\'message\', \'headline\', this ) };return(true);" onfocus="storeEditable(this);">' + m.headline + '</div>',
       '		<div class="v3_text ce" contenteditable="false" onblur="if ( !compareEditable(this) ){ updateMessage(\'message\', \'text\', this ) };return(true);" onfocus="storeEditable(this);">' + m.text + '</div>',
       '		<div class="v3_info">Info:<span class="ce" contenteditable="false" onblur="if ( !compareEditable(this) ){ updateMessage(\'message\', \'info\', this ) };return(true);" onfocus="storeEditable(this);">' + m.info + '</span></div>',
       '		<div class="v3_link">Link:<span class="ce" contenteditable="false" onblur="if ( !compareEditable(this) ){ updateMessage(\'message\', \'link\', this ) };return(true);" onfocus="storeEditable(this);">' + m.link + '</span></div>',
       '	</div>',
       '	<div class="v3_actions">',
       ' </div>',
       '	<div class="v3_msg_info"><span>' + m.time + '</span><span>#' + env.index + '</span></div>',
       '	<br class="cb"/>',
       '</div>').join('');  
     

       d.html(inner2);
       


		var dr = ce("div");
		dr.addClass("makeMeDraggable");
		dr.draggable( {
			start: self.handleDragStartEvent,
			helper: 'clone',
			appendTo: 'body'
		});
		dr.data("envelope", envelope);
		d.append(dr);
		
		return d;
		
		// $("#messagelist").append(d);
	},
	
	setSrcListId: function(id)
	{
	  this.srcListId = id;
	  console.log("setSrcListId: " + this.srcListId)
	},
	
	setTargetListId: function(id)
	{
	  this.targetListId = id;
	  console.log("setTargetListId: " + this.targetListId)
	},
	
	appendMessageToStream: function(streamId, mid)
	{
	  console.log("appendMessageToStream: " +  streamId + "; " + mid)
	  this.api.appendMessageToStream(streamId, mid);
	},
	
	prepare_tile: function(elem) {
		var self = this;
		
		var streamId = $(elem).attr("streamId")
		var e = $(elem).data("envelope");		
		e.message.style   = this.theStyle;
		e.message.layout  = $(elem).attr("layout").replace("layout_","");
		e.message.text    = $('#ed_text').text();
		e.message.headline = $('#ed_headline').text();
		e.message.size = this.frames[$(elem).attr("framename")].size_name;		  
		
		console.log("prepare tile: name: " + $(elem).attr("framename"));
		console.log(e.message.size);
		
		var f = function() 
		{
		  self.appendMessageToStream(streamId, e.message.id);
		}
		
		api.updateMessage(e.message, f);
		
		var listelemId = $(elem).data("envelope").mid;
		$("#" + listelemId).css("background-color", "lime");
		this.clearDrag();
		this.clearEditor();
	},

  
  handleDragStartEvent: function( event, ui ) {
  	var self = this;
  	var m = $(this).parent().attr("id");
  	
  	if(this.dragger != null && this.dragger != $(this)) {
  		self.clearDrag(); 
  	}
	},

	
	clearDrag: function() {
		$("#layouts").empty();
		if(this.lastFrame) {
  		this.lastFrame.elem.css("background-color", this.lastFrame.bgcol);
  	}
  	
  	$("#size_headline").empty();
	},
	
	clearEditor: function() {
		$.each($('#editor p'), function(idx, ele) {
			//console.log(ele);
			$(ele).html("");
		});
		$('#editor').fadeOut();
	},

	resetTile: function() {
		if( this.lastTile != null) {
		  this.lastTile.elem.html( this.lastTile.html );
		  this.lastTile.elem.removeClass( self.lastStyle );
		  
		  this.lastTile = null;
		}

	},

	init_listeners: function() {
		var self = this;
		console.log("init third editor");
		
		$('.styleswitch').click( function() {
		  
		  // fixme: geht so bei echten daten nicht...
		  
		  var oldStyleName = self.theStyle;
		  
			self.theStyle = $(this).attr('id');
			var style = $(this);
			
			self.lastTile.elem.removeClass(oldStyleName);
			self.lastTile.elem.addClass(self.theStyle)
			
			// untere tiles
			$.each( $('#layouts div'), function( key, val ){
			  if($(val).hasClass('tile')) {
			    if( self.lastStyle != null ) $(val).removeClass( self.lastStyle );
				  $(val).removeClass("c1");
				  $(val).addClass(style.attr("id"));
				  $(val).attr("stylename", self.theStyle); 
				}
			});
			
			/*
			if(self.lastFrame) {
				if(self.lastStyle) self.lastFrame.elem.removeClass(self.lastStyle);
				self.lastFrame.elem.removeAttr("background-color");
				self.lastFrame.elem.addClass(style.attr("id"));
			}
			*/
			self.lastStyle = $(this).attr('id');
		});
		
		
		$('#editor p').on('focus', function() {
		  
		});
		
		$('#editor p').on('keyup', function() {		  
		  var self = this;
		  var id = $(this).attr("id").replace("ed_","");
		  $.each($('#layouts .' + id), function(idx, ele) {
  			//console.log(ele);
  			$(ele).text( $(self).text() );
  		});
  		
		});
		
		$('.makeMeDraggable').draggable( {
			start: self.handleDragStartEvent,
			helper: 'clone',
			appendTo: 'body'
		});
		
		
		$('#editorX').draggable( {
			
		});
		
		
		$('.frame').droppable( {
			drop: function(event, ui) {
				console.log("drop: " + $(this).attr("id"));				
				
				ui.list = $(this).attr("id");			
				var id = $(this).attr("id");
				
				self.lastTile = {
				  html: $('#' + id + ' .tile').html(),
				  elem: $('#' + id + ' .tile'),
				  id: '#' + id
				}
				
				// leer machen, damit ich die neue bg-farbe sehe
				$('#' + id + ' .tile').empty();
				
				// add last selected style
				//console.log(self.lastStyle);
				$('#' + id + ' .tile').addClass(self.lastStyle);
							
				if(self.lastFrame) {
  				self.lastFrame.elem.css("border", self.lastFrame.border);
  				self.lastFrame.elem.css("z-index", self.lastFrame.zindex);
  		    
  			}
  			self.lastFrame = { border: $(this).css("border"), zindex: $(this).css("z-index"), elem: $(this) };
				
  			$(this).css("border", "4px solid blue");
  			$(this).css("z-index", "5");
  			self.show_layouts( $(this), ui);
				self.fillEditor( ui );
  	
  	    $('#editor').fadeIn();
  	    
		
			} 
		});
		
		$(document).keydown(function(evt) {
		  var kc = evt.keyCode || evt.which;
      //alert('Handler for .keypress() called. - ' + kc);
			switch(kc)
			{
				case 27: // esc
					self.clearDrag();
					self.clearEditor();
					self.resetTile();
					break;
			}
		});
		
	}

});

