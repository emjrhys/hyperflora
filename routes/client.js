const express  = require('express'),
      ObjectID = require('mongodb').ObjectID,
      youtube  = require('youtube-api'),

      generateSearchParams = require('./middleware.js').generateSearchParams,
      getRandomVideoFromSearch = require('./middleware.js').getRandomVideoFromSearch

let router = express.Router()

let auth = youtube.authenticate({
  type: 'key',
  key: 'AIzaSyA-mI-1HFw5T7Ww2lsIQhmySiOcVidcBFs'
})

router.use((req, res, next) => {
  res.locals.historySize = 20
  res.locals.history = req.cookies['history'] || []

  res.updateHistory = (vid) => {
    while (res.locals.history.length >= res.locals.historySize) {
      res.locals.history.splice(0, 1)
    }

    res.locals.history.push(vid.searchId)
    res.cookie('history', res.locals.history)
  }

  next()
})

router.get('/', (req, res) => {
  res.render('home')
})

router.get('/random/:channel?',
  generateSearchParams,
  getRandomVideoFromSearch,
  (req, res) => {
    res.send(res.video)
})

router.get('/watch',
  generateSearchParams,
  getRandomVideoFromSearch,
  (req, res) => {
    res.render('watch', { video: res.video, loggedIn: req.user })
  }
)

router.get('/watch/:searchId', (req, res) => {
  req.db.collection('videos').findOne({
    searchId: req.params.searchId
  }, (err, result) => {
    let vid = result
    res.render('watch', { video: vid, loggedIn: req.user })
  })
})

router.get('/submit', (req, res) => {
  res.render('submit', { title: 'Submit a video' })
})

router.post('/submit', (req, res) => {
  let youtubeId = youtube_parser(req.body.url)

  if (youtubeId) {
    req.db.collection('videos').find({ youtubeId: youtubeId }).toArray((err, results) => {
      if (results.length > 0) {
        res.render('submit', { message: 'This video has already been submitted' })
        return
      }

      youtube.videos.list({
        id: youtubeId,
        part: 'snippet',
        auth: auth
      }, (err, response) => {
        if (err) {
          console.log('The API returned an error: ' + err)
          return { error: 'The API returned an error: ' + err }
        }

        var entry = {
          url: req.body.url,
          youtubeId: youtubeId,
          title: response.items[0].snippet.title,
          approved: false
        }

        req.db.collection('videos').save(entry, (err, result) => {
          if (err) return console.log(err)

          let objId = result.ops[0]._id,
              searchId = objId.toString().slice(0, 8)
          req.db.collection('videos').update({ _id: objId }, { $set: { searchId: searchId } })

          console.log('Saved ' + entry.title + ' to database with id ' + searchId)

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

router.get('/list', generateSearchParams, (req, res) => {
  req.db.collection('videos').find(req.searchParams).sort({ '_id': -1 }).toArray((err, results) => {
    res.render('admin/videoList', {
      page: 'list',
      videos: results,
      channelFilter: req.channelFilter,
      visibilityFilter: req.visibilityFilter,
      controls: {
        filterEnabled: true,
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

module.exports = router
