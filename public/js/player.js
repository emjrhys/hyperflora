$('.nav-zone').mousemove(function() {
	window.clearTimeout(timeoutHandle);
	$('.nav-bar').removeClass('hidden');
	timeoutHandle = window.setTimeout(hideNav, 1500);
});

$('nav').mouseleave(function() {
	timeoutHandle = window.setTimeout(hideNav, 1500);
});

$('nav').mouseenter(function() {
	window.clearTimeout(timeoutHandle);
	$('.nav-bar').removeClass('hidden');
});

function hideNav() { console.log("hid nav"); $('.nav-bar').addClass('hidden'); }

var timeoutHandle = window.setTimeout(hideNav, 2000);
