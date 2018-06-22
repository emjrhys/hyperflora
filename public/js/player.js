let timeoutHandle
let videoPlayer
let videoId = $('#video-player').attr('data-videoId')

function onYouTubePlayerAPIReady() {
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
		playNextVideo()
		showNavBar(true)
		resetNavBarTimeout(4000)
  }
}

function playNextVideo() {
	videoPlayer.loadVideoById(nextVideo.youtubeId)
	$('.nav-zone').removeClass('paused')
	$('.video-link').attr('href', 'https://www.youtube.com/watch?v=' + nextVideo.youtubeId)
	$('.video-link').html(nextVideo.title)

	replaceURL(nextVideo.searchId, query)
	loadNextVideo()
}

function loadNextVideo() {
	$.get('/random/' + (channel || ''), (data) => {
		nextVideo = data
	})
}

function playPause() {
	let state = videoPlayer.getPlayerState()
	if (state == 1) {
		videoPlayer.pauseVideo()
		$('.nav-zone').addClass('paused')
		showNavBar(false)
	} else if (state == 2) {
		videoPlayer.playVideo()
		$('.nav-zone').removeClass('paused')
		resetNavBarTimeout(1000)
	}
}

$('body').keydown((e) => {
	// check if user has pressed space or f
	if (e.keyCode == 32) {
		playPause()
  } else if (e.which == 70 || e.keyCode == 70) {
		toggleFullscreen()
	}
})

$('.skip').click((e) => {
	e.preventDefault()
	playNextVideo()
	showNavBar(false)
	resetNavBarTimeout(4000)
})

$('.nav-zone').click(playPause)

function toggleFullscreen() {
	let video = $('#video-wrapper')[0]

	if (document.fullscreenElement ||
      document.mozFullScreenElement ||
			document.webkitFullscreenElement ||
			document.msFullscreenElement) {

		let exit = document.exitFullscreen ||
							 document.msExitFullscreen ||
							 document.mozCancelFullScreen ||
							 document.webkitExitFullscreen
		exit.call(document)
		$('.fullscreen-toggle').removeClass('active')

  } else {
		let req = video.requestFullScreen ||
							video.msRequestFullscreen ||
							video.webkitRequestFullScreen ||
							video.mozRequestFullScreen
		req.call(video)
		$('.fullscreen-toggle').addClass('active')
	}
}

$('.fullscreen-toggle').click(toggleFullscreen)

$('.video-link').click((e) => {
	videoPlayer.pauseVideo()
})

$('.nav-zone, nav').mousemove((e) => {
	showNavBar(false)

	if (videoPlayer.getPlayerState() != 2) {
		resetNavBarTimeout(3000)
	}
})

function showNavBar(clean) {
	if (clean) {
		$('.nav-bar').addClass('clean')
	} else {
		$('.nav-bar').removeClass('clean')
	}

	$('.nav-bar').removeClass('hidden')
	window.clearTimeout(timeoutHandle)
}

function resetNavBarTimeout(timeout) {
	timeoutHandle = window.setTimeout(hideNav, timeout)
}

function hideNav() { $('.nav-bar').addClass('hidden') }

function replaceURL(id, query) {
	history.replaceState('', '', '/watch/' + id + query)
}

/* ONLOAD */
let query = window.location.search,
		channel = query.split('channel=')[1],
		searchId = $('#video-player').attr('data-searchId'),
		nextVideo

loadNextVideo()

replaceURL(searchId, query)
$('.cutout').addClass(channel)

let title = 'Everything'
if (channel) {
	title = channel.charAt(0).toUpperCase() + channel.slice(1)
}
document.title = 'Hyperflora | ' + title
