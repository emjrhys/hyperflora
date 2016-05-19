var express  = require('express');
var path     = require('path');
var firebase = require('firebase');

var app = express();
var db = new Firebase('http://hyperflora.firebaseio.com');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/watch', function (req, res) {
  db.once('value', function(dataSnapshot) {
    var videos = [];

    dataSnapshot.forEach(function(child) {
      videos.push(child.val());
    });

    console.log(videos);
    var vid = videos[Math.floor(Math.random() * videos.length)];

    res.render('watch', { video: vid, title: "| " + vid.title });
  });

  // res.render('watch', { video: { host: "youtube", url: "", title: "Video"} });
});

app.get('/list', function (req, res) {
  db.once('value', function(dataSnapshot) {
    var videos = dataSnapshot.val();
    console.log(videos);
    res.render('list', { videos: videos });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
