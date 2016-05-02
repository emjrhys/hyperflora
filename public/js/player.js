/* TODO: Figure out something better to do with the next button */

$('.next').mousemove(function() {
	$('.next').removeClass('hidden');
});

$('.next').mouseleave(function() {
	setTimeout(hideNext, 300);
});

function hideNext() {
	$('.next').addClass('hidden');
}

setTimeout(hideNext, 1000);
