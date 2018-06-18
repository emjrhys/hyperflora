const express      = require('express'),
      bodyParser   = require('body-parser'),
      cookieParser = require('cookie-parser'),

      pug          = require('pug'),
      fs           = require('fs'),
      readline     = require('readline'),
      path         = require('path'),

      youtube      = require('youtube-api'),
      MongoClient  = require('mongodb').MongoClient,
      ObjectID     = require('mongodb').ObjectID,
      channelList  = require('./data/channels.json')

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

app.locals.basedir = path.join(__dirname, 'views')
app.use((req, res, next) => {
  res.locals.channels = channelList
  res.locals.getChannelLabel = function(channels) {
    if (channels == null || channels.length == 0) {
      return 'no channels'
    }

    if (typeof channels === 'string') {
      return channels
    } else if (channels.length >= 3) {
      return channels.length + ' channels'
    } else {
      return channels.join(', ')
    }
  }
  next()
})

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/watch', (req, res) => {
  let channel = req.query.channel

  let searchParams = {
    approved: true
  }

  if (channel != null) {
    searchParams.channel = channel
  } else {
    searchParams.notInEverything = { $in: [null, 'false'] }
  }

  db.collection('videos').find(searchParams).toArray((err, results) => {
    let vid = getRandomFromArray(results)

    res.render('watch', {
      objId: vid._id,
      videoId: vid.id,
      title: vid.title,
      channel: channel || null
    })
  })
})

app.get('/watch/:vidId', (req, res) => {
  db.collection('videos').find({
    _id: ObjectID(req.params.vidId)
  }).toArray((err, results) => {
    console.log(results)
    let vid = results[0]
    res.render('watch', { objId: vid._id, videoId: vid.id, title: vid.title })
  })
})

app.get('/list', (req, res) => {
  db.collection('videos').find().sort({ '_id': -1 }).toArray((err, results) => {
    res.render('admin/videoList', {
      page: 'list',
      videos: results,
      controls: {
        filterEnabled: false,
        channelChangerEnabled: false,
        buttonsEnabled: false
      }
    })
  })
})

app.get('/admin', (req, res) => {
  let channelFilter = req.query.channel,
      visibilityFilter = req.query.visibility

  let searchParams = {
    approved: true,
  }

  if (channelFilter != null && channelFilter != 'all') {
    searchParams.channel = channelFilter
  }

  if (visibilityFilter == 'visible') {
    searchParams.notInEverything = { $in: [null, false] }
  } else if (visibilityFilter == 'hidden') {
    searchParams.notInEverything = true
  }

  db.collection('videos').find(searchParams).sort({ '_id': -1 }).toArray((err, results) => {
    res.render('admin/videoList', {
      page: 'videos',
      videos: results,
      channelFilter: channelFilter,
      visibilityFilter: visibilityFilter,
      controls: {
        filterEnabled: true,
        channelChangerEnabled: true,
        buttonsEnabled: true,
        approve: false
      }
    })
  })
})

app.get('/admin/unapproved', (req, res) => {
  db.collection('videos').find({ approved: false }).sort({ '_id': -1 }).toArray((err, results) => {
    res.render('admin/videoList', {
      page: 'unapproved',
      videos: results,
      controls: {
        filterEnabled: false,
        channelChangerEnabled: true,
        buttonsEnabled: true,
        approve: true
      }
    })
  })
})

app.get('/admin/stats', (req, res) => {
  let channelCounts = {}
  for (let i = 0; i < channelList.length; i++) {
    channelCounts[channelList[i]] = {
      total: 0,
      hidden: 0
    }
  }
  let untagged = 0,
      hiddenTotal = 0

  db.collection('videos').find({ approved: true }).toArray((err, results) => {
    for (let i = 0; i < results.length; i++) {
      let channel = results[i]['channel'],
          hidden  = results[i]['notInEverything']

      if (channel == null || channel == 'none' || channel.length == 0){
        untagged += 1

      } else if (typeof channel === 'string') {
        channelCounts[channel].total += 1
        if (hidden) {
          hiddenTotal += 1
          channelCounts[channel].hidden += 1
        }

      } else {
        for (let i = 0; i < channel.length; i++) {
          channelCounts[channel[i]].total += 1
          if (hidden) {
            hiddenTotal += 1
            channelCounts[channel[i]].hidden += 1
          }
        }
      }
    }

    res.render('admin/stats', { total: results.length, hiddenTotal: hiddenTotal, channelCounts: channelCounts, untagged: untagged })
  })
})

app.get('/submit', (req, res) => {
  res.render('submit')
})

app.post('/submit', (req, res) => {
  console.log(req.originalUrl)
  let vid_id = youtube_parser(req.body.url)

  if (vid_id) {
    db.collection('videos').find({ id: vid_id }).toArray((err, results) => {
      if (results.length > 0) {
        res.render('submit', { error: 'This video has already been submitted' })
        return
      }

      youtube.videos.list({
        id: vid_id,
        part: 'snippet',
        auth: auth
      }, (err, response) => {
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

          console.log('Saved ' + entry.title + ' to database with id ' + entry.id)
          res.redirect('/admin')
        })
      })
    })
  } else {
    res.render('submit', { error: 'Only YouTube urls are supported' })
  }
})

app.post('/approve', (req, res) => {
  db.collection('videos').update({ _id: ObjectID(req.body.id) }, { $set: { approved: true } }, (err, results) => {
    console.log('Approved ' + req.body.id)
    res.redirect('/admin/unapproved')
  })
})

app.post('/unapprove', (req, res) => {
  db.collection('videos').update({ _id: ObjectID(req.body.id) }, { $set: { approved: false } }, (err, results) => {
    console.log('Removed ' + req.body.id + ' from approved')
    res.redirect('/admin')
  })
})

app.post('/update', (req, res) => {
  let objId = req.body.id,
      channel = req.body.channel,
      notInEverything = (req.body.notInEverything == 'true')

  db.collection('videos').update({ _id: ObjectID(objId) }, { $set: { channel: channel, notInEverything: notInEverything } }, (err, results) => {
    console.log('Updated ' + objId + ' with channel ' + channel + ' and flag notInEverything: ' + notInEverything)
  })
})

app.post('/delete', (req, res) => {
  db.collection('videos').remove({ _id: ObjectID(req.body.id) }, (err, results) => {
    console.log('Deleted ' + req.body.id)
    res.redirect(req.get('referer'))
  })
})

MongoClient.connect('mongodb://admin:kittenmittens@ds151752.mlab.com:51752/hyperflora', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'))
  })
})

// This goes in the watch method (doesn't really work)
// let history = getHistory(req)
// while (history.indexOf(vid['id']) > -1) {
//   vid = getRandomFromArray(results)
// }
//
// res.cookie('history', updateHistory(history, vid['id']))

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
