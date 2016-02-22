var ref = new Firebase('http://hyperflora.firebaseio.com');

var channel = getParameterByName("channel") || null,
	  videoQueue = [],
    videoPlaying = null;

ref.once("child_added", function(snapshot, prevChildKey) {
  var nextVid = snapshot.val();

  if (channel == null || nextVid.channels.indexOf(channel) >= 0) {
    queue(nextVid);
    shuffle(videoQueue);

    if (videoPlaying == null) {
      videoPlaying = nextVid;
    }
  }
});

function queue(video) {
	console.log(video);
  console.log("Title: " + video.title);
  console.log("URL: " + video.url);
	videoQueue.push(video);
}

