let videoPlayer
let videoId = $('#video-player').attr('data-videoId')

function onYouTubePlayerAPIReady() {
	console.log(videoId)
  videoPlayer = new YT.Player('video-player', {
    videoId: videoId,
		playerVars: {
			controls: 0,
			showinfo: 0,
			iv_load_policy: 3
		},
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  })
}

function onPlayerReady(event) {
  event.target.playVideo()
}

function onPlayerStateChange(event) {
  if(event.data === 0) {
		window.location.href = $('.next').attr('href')
  }
}

$('.nav-zone').mousemove(function() {
	window.clearTimeout(timeoutHandle);
	$('.nav-bar').removeClass('hidden');
	timeoutHandle = window.setTimeout(hideNav, 3500);
});

$('nav').mouseleave(function() {
	timeoutHandle = window.setTimeout(hideNav, 3500);
});

$('nav').mouseenter(function() {
	window.clearTimeout(timeoutHandle);
	$('.nav-bar').removeClass('hidden');
});

function hideNav() { $('.nav-bar').addClass('hidden'); }

/* ONLOAD */
let timeoutHandle = window.setTimeout(hideNav, 6000);

let query = window.location.search

history.replaceState('', '', '/watch/' + $('#video-player').attr('data-objId') + query)
$('.next').attr('href', '/watch' + query)

$('.cutout').addClass(query.split('channel=')[1])
