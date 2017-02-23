var socket = io();

socket.on('startTrial', function(msg) {
	startTrial(msg);
});

socket.on('treeA', function(msg){
	
});

///////////////////////////////////////////////////////////////////////
//////////////////////// JGL FUNCTIONS ////////////////////////////////
///////////////////////////////////////////////////////////////////////

function startTrial(params) {
	params = params.split('.');

}

function updateScreen() {

	requestAnimationFrame(updateScreen);
}

window.onload = function () {
	$("#preview").hide();
	$("#active").hide();
	$("#noturk").hide();
	// startup
	if (turk.previewMode) {
		$("#preview").show();
	} else if (!turk.previewMode && turk.assignmentId!='') {
		$("#active").show();
	} else {
		$("#noturk").show();
	}
};