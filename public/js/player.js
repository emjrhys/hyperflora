/* TODO: Figure out something better to do with the next button */

$('.nav-zone').mousemove(function() {
	window.clearTimeout(timeoutHandle);
	$('nav').removeClass('hidden');
	timeoutHandle = window.setTimeout(hideNav, 1000);
});

$('nav').mouseleave(function() {
	timeoutHandle = window.setTimeout(hideNav, 1000);
});

$('nav').mouseenter(function() {
	window.clearTimeout(timeoutHandle);
	$('nav').removeClass('hidden');
});

function hideNav() { $('nav').addClass('hidden'); }

var timeoutHandle = window.setTimeout(hideNav, 2000);
