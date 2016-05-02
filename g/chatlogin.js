var FlypSite = {
	rio: "",
	token: ""
}




var bodyOnLoad = function() {
	
	var rio = new Rio();
	rio.quiet();
	rio.onSession = onSession;
	FlypSite.rio = rio;
	
	FlypSite.token = rio.getParameterByName("token");
	$("#tkval").text(FlypSite.token);
	rio.start();
	
	
	
}


var onSession  = function() {
	// User Token
	FlypSite.rio.sendChat("UT", FlypSite.token);
}