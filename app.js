var express  = require('express');
var pug      = require('pug');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/watch', function (req, res) {
  res.render('watch', { video: vid, title: "| " + vid.title });
});

app.get('/list', function (req, res) {
  res.render('list', { videos: videos });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
