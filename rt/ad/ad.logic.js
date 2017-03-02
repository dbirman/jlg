// This is the ad logic. You shouldn't need to edit this unless you're running your server somewhere other than the gru.stanford.edu server (which you shouldn't do).

var debug;

function getExperiment() {
	debug = getQueryVariable('debug')=='true';
}

window.onload = function() {
	debug = getQueryVariable('debug')=='true';
	if (!debug && turk.assignmentId=="" || turk.previewMode) {
		document.getElementById("preview").style.display="";
		document.getElementById("active").style.display="none";
	} else {
		document.getElementById("preview").style.display="none";
		document.getElementById("active").style.display="";
	}
};

function openwindow() {
	var path = location.pathname;
	var expName = path.substr(path.indexOf('ad-')+3,path.indexOf('.html')-1);
	popup = window.open('http://localhost:8080/exp.html?exp='+expName,'Popup','toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=no,width='+1024+',height='+768+'');
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