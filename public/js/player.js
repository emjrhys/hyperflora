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

function hideNav() { $('.nav-bar').addClass('hidden'); }

let timeoutHandle = window.setTimeout(hideNav, 2000);

history.replaceState('', '', '/watch/' + $('#video-player').attr('data-objId') + window.location.search)
$('.next').attr('href', '/watch' + window.location.search)

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
