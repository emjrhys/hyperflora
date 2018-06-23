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
	resetControlsTimeout(4000)
}

function onPlayerStateChange(event) {
  if(event.data === 0) {
		playNextVideo()
		showControls(true)
		resetControlsTimeout(4000)
  }
}

function loadNextVideo() {
	$.get('/random/' + (query || ''), (data) => {
    console.log(data)
		nextVideo = data
	})
}

function playNextVideo() {
	videoPlayer.loadVideoById(nextVideo.youtubeId)
  updatePage()
	$('.hover-zone').removeClass('paused')
	loadNextVideo()
}

function updatePage() {
  $('.video-link').attr('href', 'https://www.youtube.com/watch?v=' + nextVideo.youtubeId)
	$('.video-link').html(nextVideo.title)

  if (admin) updateAdminControls()
  replaceURL(nextVideo.searchId, query)
}

function playPause() {
	let state = videoPlayer.getPlayerState()
	if (state == 1) {
		videoPlayer.pauseVideo()
		$('.hover-zone').addClass('paused')
		showControls(false)
	} else if (state == 2) {
		videoPlayer.playVideo()
		$('.hover-zone').removeClass('paused')
		resetControlsTimeout(1000)
	}
}

$('body').keydown((e) => {
	// check if user has pressed space or f
	if (e.keyCode == 32) {
		e.preventDefault()
		playPause()
  } else if (e.which == 70 || e.keyCode == 70) {
		toggleFullscreen()
	}
})

$('.skip').click((e) => {
	e.preventDefault()
	playNextVideo()
	showControls(false)
	resetControlsTimeout(4000)
})

$('.hover-zone').click(playPause)

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

$('.controls').mousemove((e) => {
	showControls(false)

	if (videoPlayer.getPlayerState() != 2) {
		resetControlsTimeout(3000)
	}
})

function showControls(clean) {
	if (clean) {
		$('.controls').addClass('clean')
	} else {
		$('.controls').removeClass('clean')
	}

	$('.controls').removeClass('hidden')
	window.clearTimeout(timeoutHandle)
}

function resetControlsTimeout(timeout) {
	timeoutHandle = window.setTimeout(hideControls, timeout)
}

function hideControls() { $('.controls').addClass('hidden') }

function replaceURL(id, query) {
	history.replaceState('', '', '/watch/' + id + query)
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/* ONLOAD */
let query = window.location.search,
    searchParams = {},
		searchId = $('#video-player').attr('data-searchId'),
    admin = $('.admin-controls').length,
		nextVideo

query.substr(1).split("&").forEach(function (pair) {
  if (pair === "") return
  var parts = pair.split("=")
  searchParams[parts[0]] = parts[1] &&
    decodeURIComponent(parts[1].replace(/\+/g, " "))
})

loadNextVideo()

// set custom page url
replaceURL(searchId, query)

// change home button style to match channel
$('.cutout').addClass(searchParams.channel)

// set page title from channel
let title = 'Everything'
if (searchParams.channel) { title = capitalize(searchParams.channel) }

document.title = 'Hyperflora | ' + title
