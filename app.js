var express    = require('express')
var bodyParser = require('body-parser')
var pug        = require('pug')

const MongoClient = require('mongodb').MongoClient

var app = express()
var db

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.get('/', function (req, res) {
  res.render('home')
})

app.get('/watch', function (req, res) {
  db.collection('videos').find().toArray(function(err, results) {
    console.log(results)
    res.render('watch', { video: results[getRandomInt(0, results.length)] })
  })
})

app.get('/submit', function (req, res) {
  res.render('submit')
})

app.post('/submit', function (req, res) {
  var vid_id = youtube_parser(req.body.url)
  if (vid_id) {
    db.collection('videos').save({ url: req.body.url, id: vid_id }, (err, result) => {
      if (err) return console.log(err)

      console.log('Saved to database!')
      res.redirect('/')
    })
  }
  res.render('error')
})

app.get('/list', function (req, res) {
  db.collection('videos').find().toArray(function(err, results) {
    res.render('list', { videos: results })
  })
})

MongoClient.connect('mongodb://admin:kittenmittens@ds151752.mlab.com:51752/hyperflora', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'))
  })
})

function youtube_parser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
