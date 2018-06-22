let timeoutHandle
let videoPlayer
let videoId = $('#video-player').attr('data-videoId')

function onYouTubePlayerAPIReady() {
	console.log(videoId)
  videoPlayer = new YT.Player('video-player', {
    videoId: videoId,
		playerVars: {
			controls: 0,
			showinfo: 0,
			iv_load_policy: 3,
			rel: 0,
			disablekb: 1,
			// end: 7,
			modestbranding: 1
		},
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  })
}

function onPlayerReady(event) {
  event.target.playVideo()
	resetNavBarTimeout(4000)
}

function onPlayerStateChange(event) {
  if(event.data === 0) {
		window.location.href = $('.skip').attr('href')
  }
}

function playPause() {
	let state = videoPlayer.getPlayerState()
	if (state == 1) {
		videoPlayer.pauseVideo()
		showNavBar()
	} else if (state == 2) {
		videoPlayer.playVideo()
		resetNavBarTimeout(1000)
	}
}

$('body').keydown((e) => {
	// check if user has pressed space
	if (e.keyCode == 32) {
		playPause()
  }
})

$('.nav-zone').click(playPause)

$('.video-link').click((e) => {
	videoPlayer.pauseVideo()
})

$('.nav-zone').mousemove((e) => {
	if (videoPlayer.getPlayerState() == 1) {
		showNavBar()
		resetNavBarTimeout(3000)
	}
})

$('nav').mouseleave((e) => {
	if (videoPlayer.getPlayerState() == 1) {
		resetNavBarTimeout(3000)
	}
})

$('nav').mouseenter(showNavBar)

function showNavBar() {
	window.clearTimeout(timeoutHandle)
	$('.nav-bar').removeClass('hidden')
}

function resetNavBarTimeout(timeout) {
	timeoutHandle = window.setTimeout(hideNav, timeout)
}

function hideNav() { $('.nav-bar').addClass('hidden') }

/* ONLOAD */
let query = window.location.search

history.replaceState('', '', '/watch/' + $('#video-player').attr('data-objId') + query)
$('.skip').attr('href', '/watch' + query)

$('.cutout').addClass(query.split('channel=')[1])
