

function onRadioClick(itm) {
	// alert("click " + itm.target.name + "/" + itm.target.value);
	
	jQuery.ajax({
			url: "/x/loglevel",
			type: "POST",
			data: { klass: itm.target.name, value: itm.target.value, token: FLYPDBG_TOKEN },
			success: function() {
			
			}, 
			error: {
			
			}	
		});
}


function init() {

	var table = $("#content");
	
	for ( pkg in STATUS_LOG_LEVEL ) {
	
		var td = $(document.createElement("td"));
		td.text(STATUS_LOG_LEVEL[pkg].name);
		
		var tr = $(document.createElement("tr"));
		tr.append(td);
		table.append(tr);
		
		
		var classes = STATUS_LOG_LEVEL[pkg].classes;
		for ( cll in classes ) {

			tr = $(document.createElement("tr"));
			table.append(tr);
			
			var cls = classes[cll];
			td = $(document.createElement("td"));
			td.text("___ " + cls.show);
			tr.append(td);

			for ( var ri = 0; ri < 7; ri++ ) {
				td = $(document.createElement("td"));
				radio = $(document.createElement("input"));
				radio.attr("type", "radio");
				radio.attr("name", cls.name);
				radio.attr("value", ri);
				if ( cls.level == ri ) radio.attr("checked", "checked");
				
				radio.bind('click', onRadioClick);
				
				td.append(radio);
				tr.append(td);
			}

			
		}
		
		
		
		
	}



}

