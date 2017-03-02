window.onload = function() {
	if (turk.assignmentId=="" || turk.previewMode) {
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
	popup = window.open('localhost:8080/exp.html?'+expName,'Popup','toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=no,width='+1024+',height='+768+'');
}