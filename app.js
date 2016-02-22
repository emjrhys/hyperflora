var express  = require('express');
var exphbs   = require('express-handlebars');
var firebase = require('firebase');

var app = express();
var ref = new Firebase('http://hyperflora.firebaseio.com');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/watch', function (req, res) {
  var videoId = req.params.videoId || null;

  ref.once('value', function(data) {
    res.render('watch', {
      videos: data,
      startVideo: videoId
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});