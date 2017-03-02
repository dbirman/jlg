// This is the ad logic. You shouldn't need to edit this unless you're running your server somewhere other than the gru.stanford.edu server (which you shouldn't do).

			var debug;

			function getExperiment() {
				debug = getQueryVariable('debug')=='true';
			}

$(document).ready(function() {launch();});

function launch() {
	debug = getQueryVariable('debug')=='true';
	if (debug) {
		$("#preview").show();
		$("#active").show();
	} else if (turk.previewMode) {
		$("#preview").show();
		$("#active").hide();
	} else if (!turk.previewMode) {
		$("#preview").hide();
		$("#active").show();
	}
};

var experimentWindow,path,expName;

var server = 'localhost:8080';

function openwindow() {
	path = location.pathname;
	expName = path.substr(path.indexOf('ad-')+3,path.indexOf('.html')-(path.indexOf('ad-')+3));
	if (debug) {	
		experimentWindow = window.open('http://'+server+'/exp.html?exp='+expName+'&debug=1','Popup','toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=no,width='+1024+',height='+768+'');
	} else {
		experimentWindow = window.open('http://'+server+'/exp.html?exp='+expName,'Popup','toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=no,width='+1024+',height='+768+'');
	}
}

function submit() {
	var dataPackage = {
		turk:turk,
		path:path,
		expName:expName,
		success:true
	}
	experimentWindow.close();
	turk.submit(dataPackage);
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}
	console.log('Query variable %s not found', variable);
}
