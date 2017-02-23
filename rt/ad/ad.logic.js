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
	popup = window.open('{{ server_location }}/consent?hitId={{ hitid }}&assignmentId={{ assignmentid }}&workerId={{ workerid }}','Popup','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width='+1024+',height='+768+'');
}