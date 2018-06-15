var express      = require('express'),
    bodyParser   = require('body-parser'),
    pug          = require('pug'),
    fs           = require('fs'),
    readline     = require('readline'),
    google       = require('googleapis'),
    googleAuth   = require('google-auth-library')
    MongoClient  = require('mongodb').MongoClient,
    ObjectID     = require('mongodb').ObjectID,
    cookieParser = require('cookie-parser')

var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/'
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json'

var app = express()
var youtube = google.youtube('v3')
var oauth
var db

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static(__dirname + '/public'))

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.get('/', function (req, res) {
  res.render('home')
})

app.get('/watch', function (req, res) {
  db.collection('videos').find({ approved: true }).toArray(function(err, results) {
    var vid = getRandomFromArray(results)

    var history = getHistory(req)
    while (history.indexOf(vid['id']) > -1) {
      vid = getRandomFromArray(results)
    }

    res.cookie('history', updateHistory(history, vid['id']))

    res.render('watch', { objId: vid._id, videoId: vid.id, title: vid.title })
  })
})

app.get('/watch/:vidId', function (req, res) {
  db.collection('videos').find({
    _id: ObjectID(req.params.vidId)
  }).toArray(function(err, results) {
    console.log(results)
    var vid = results[0]
    res.render('watch', { objId: vid._id, videoId: vid.id, title: vid.title })
  })
})

app.get('/submit', function (req, res) {
  res.render('submit')
})

app.post('/submit', function (req, res) {
  var vid_id = youtube_parser(req.body.url)
  if (vid_id) {
    db.collection('videos').find({ id: vid_id }).toArray(function(err, results) {
      if (results.length > 0) {
        res.render('error', { error: 'This video has already been submitted' })
        return
      }

      youtube.videos.list({
        id: vid_id,
        part: 'snippet',
        auth: oauth
      }, function (err, response) {
        if (err) {
          console.log('The API returned an error: ' + err)
          return { error: 'The API returned an error: ' + err }
        }

        var entry = {
          url: req.body.url,
          id: vid_id,
          title: response.items[0].snippet.title,
          approved: false
        }

        db.collection('videos').save(entry, (err, result) => {
          if (err) return console.log(err)

          console.log('Saved to database!')
          res.redirect('/')
        })
      })
    })
  } else {
    res.render('error', { 'error': 'Only YouTube urls are supported!' })
  }
})

app.get('/list', function (req, res) {
  db.collection('videos').find().toArray(function(err, results) {
    res.render('list', { videos: results })
  })
})

app.get('/admin', function (req, res) {
  db.collection('videos').find({ approved: true }).toArray(function(err, approved) {
    db.collection('videos').find({ approved: false }).toArray(function(err, unapproved) {
      res.render('admin', { approved: approved, unapproved: unapproved })
    })
  })
})

app.post('/delete', function (req, res) {
  console.log(req.body.id)
  db.collection('videos').remove({ _id: ObjectID(req.body.id) }, function(err, results) {
    res.redirect('/admin')
  })
})

app.post('/approve', function (req, res) {
  console.log(req.body.id)
  db.collection('videos').update({ _id: ObjectID(req.body.id) }, { $set: { approved: true } }, function(err, results) {
    res.redirect('/admin')
  })
})

MongoClient.connect('mongodb://admin:kittenmittens@ds151752.mlab.com:51752/hyperflora', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'))
  })
})

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  authorize(JSON.parse(content))
})

function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      oauth = oauth2Client
    }
  });
}

function getNewToken(oauth2Client) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      oauth = oauth2Client
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function getHistory(req) {
  var history = req.cookies['history']

  if (typeof history === undefined) {
    history = []
  }
  return history
}

function updateHistory(history, id) {
  while (history.length >= 3) {
    history.splice(0, 1)
  }

  history.push(id)
  return history
}

function youtube_parser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
}

function getRandomFromArray(arr) {
  return arr[getRandomInt(0, arr.length)]
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
