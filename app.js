const express      = require('express'),
      bodyParser   = require('body-parser'),
      cookieParser = require('cookie-parser'),

      pug          = require('pug'),
      fs           = require('fs'),
      readline     = require('readline'),

      youtube      = require('youtube-api'),
      MongoClient  = require('mongodb').MongoClient,
      ObjectID     = require('mongodb').ObjectID,
      oldData      = require('./old-database.json')

let app = express()
let db

let auth = youtube.authenticate({
  type: 'key',
  key: 'AIzaSyA-mI-1HFw5T7Ww2lsIQhmySiOcVidcBFs'
})

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
    let vid = getRandomFromArray(results)

    // let history = getHistory(req)
    // while (history.indexOf(vid['id']) > -1) {
    //   vid = getRandomFromArray(results)
    // }
    //
    // res.cookie('history', updateHistory(history, vid['id']))

    res.render('watch', { objId: vid._id, videoId: vid.id, title: vid.title })
  })
})

app.get('/watch/:vidId', function (req, res) {
  db.collection('videos').find({
    _id: ObjectID(req.params.vidId)
  }).toArray(function(err, results) {
    console.log(results)
    let vid = results[0]
    res.render('watch', { objId: vid._id, videoId: vid.id, title: vid.title })
  })
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

app.get('/old', (req, res) => {
  res.render('old', { videos: oldData })
})

app.get('/vimeo', (req, res) => {
  res.render('old', { videos: oldData, vimeo: true })
})

app.get('/submit', function (req, res) {
  res.render('submit')
})

app.post('/submit', function (req, res) {
  console.log(req.originalUrl)
  let vid_id = youtube_parser(req.body.url)

  if (vid_id) {
    db.collection('videos').find({ id: vid_id }).toArray(function(err, results) {
      if (results.length > 0) {
        res.render('submit', { error: 'This video has already been submitted' })
        return
      }

      youtube.videos.list({
        id: vid_id,
        part: 'snippet',
        auth: auth
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
          res.redirect('/admin')
        })
      })
    })
  } else {
    res.render('submit', { error: 'Only YouTube urls are supported' })
  }
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

function getHistory(req) {
  let history = req.cookies['history']
  console.log(history)
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
  let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
  let match = url.match(regExp)
  return (match&&match[7].length==11)? match[7] : false
}

function getRandomFromArray(arr) {
  return arr[getRandomInt(0, arr.length)]
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}
