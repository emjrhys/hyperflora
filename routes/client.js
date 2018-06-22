const express  = require('express'),
      ObjectID = require('mongodb').ObjectID,
      youtube  = require('youtube-api')

let router = express.Router()

let auth = youtube.authenticate({
  type: 'key',
  key: 'AIzaSyA-mI-1HFw5T7Ww2lsIQhmySiOcVidcBFs'
})

let historySize = 20

router.use((req, res, next) => {
  res.locals.history = req.cookies['history'] || []

  res.updateHistory = (vid) => {
    while (res.locals.history.length >= historySize) {
      res.locals.history.splice(0, 1)
    }

    res.locals.history.push(vid['id'])
    res.cookie('history', res.locals.history)
  }

  next()
})

router.get('/', (req, res) => {
  res.render('home')
})

router.get('/watch', (req, res) => {
  let channel = req.query.channel

  let searchParams = {
    approved: true
  }

  if (channel != null) {
    searchParams.channel = channel
  } else {
    searchParams.notInEverything = { $in: [null, 'false'] }
  }

  req.db.collection('videos').find(searchParams).toArray((err, results) => {
    let vid = getRandomFromArray(results)

    while (results.length > historySize && res.locals.history.indexOf(vid['id']) > -1) {
      console.log('checking again')
      vid = getRandomFromArray(results)
    }
    res.updateHistory(vid)

    res.render('watch', {
      objId: vid._id,
      videoId: vid.id,
      title: vid.title,
      channel: channel || null
    })
  })
})

router.get('/watch/:vidId', (req, res) => {
  req.db.collection('videos').find({
    _id: ObjectID(req.params.vidId)
  }).toArray((err, results) => {
    console.log(results)
    let vid = results[0]
    res.render('watch', { objId: vid._id, videoId: vid.id, title: vid.title })
  })
})

router.get('/submit', (req, res) => {
  res.render('submit', { title: 'Submit a video' })
})

router.post('/submit', (req, res) => {
  let vid_id = youtube_parser(req.body.url)

  if (vid_id) {
    req.db.collection('videos').find({ id: vid_id }).toArray((err, results) => {
      if (results.length > 0) {
        res.render('submit', { message: 'This video has already been submitted' })
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

        req.db.collection('videos').save(entry, (err, result) => {
          if (err) return console.log(err)
          console.log('Saved ' + entry.title + ' to database with id ' + entry.id)

          if (req.body.admin) {
            res.redirect('/admin/unapproved')
            return
          }

          res.render('submit', { message: 'Thanks, we\'ll review your submission!' })
        })
      })
    })
  } else {
    res.render('submit', { message: 'Only YouTube urls are supported' })
  }
})

router.get('/list', (req, res) => {
  req.db.collection('videos').find().sort({ '_id': -1 }).toArray((err, results) => {
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

module.exports = router
