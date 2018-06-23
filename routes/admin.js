const express  = require('express')

let router = express.Router()

router.use((req, res, next) => {

  next()
})

router.get('/', (req, res) => {
  let channelFilter = req.query.channel,
      visibilityFilter = req.query.visibility

  let searchParams = {
    approved: true,
  }

  if (channelFilter != null && channelFilter != 'all') {
    searchParams.channels = channelFilter
  }

  if (visibilityFilter == 'visible') {
    searchParams.notInEverything = { $in: [null, false] }
  } else if (visibilityFilter == 'hidden') {
    searchParams.notInEverything = true
  }

  req.db.collection('videos').find(searchParams).sort({ '_id': -1 }).toArray((err, results) => {
    res.render('admin/videoList', {
      title: 'Dashboard',
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

router.get('/unapproved', (req, res) => {
  req.db.collection('videos').find({ approved: false }).sort({ '_id': -1 }).toArray((err, results) => {
    res.render('admin/videoList', {
      title: 'Unapproved videos',
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

router.get('/stats', (req, res) => {
  let channelCounts = {}
  for (let i = 0; i < res.locals.channels.length; i++) {
    channelCounts[res.locals.channels[i]] = {
      total: 0,
      hidden: 0
    }
  }

  let untagged = 0,
      hiddenTotal = 0

  req.db.collection('videos').find({ approved: true }).toArray((err, results) => {
    for (let i = 0; i < results.length; i++) {
      let channels = results[i]['channels'],
          hidden   = results[i]['notInEverything']

      if (hidden) { hiddenTotal += 1 }

      if (channels == null || channels.length == 0) {
        untagged += 1

      } else {
        for (let i = 0; i < channels.length; i++) {
          channelCounts[channels[i]].total += 1
          if (hidden) {
            channelCounts[channels[i]].hidden += 1
          }
        }
      }
    }

    res.render('admin/stats', { title: 'Stats', total: results.length, hiddenTotal: hiddenTotal, channelCounts: channelCounts, untagged: untagged })
  })
})

router.get('/download', (req, res) => {
  req.db.collection('videos').find().toArray((err, results) => {
    res.json(results)
  })
})

router.get('/:searchId', (req, res) => {
  req.db.collection('videos').find({
    searchId: req.params.searchId
  }).toArray((err, results) => {
    res.render('admin/videoList', {
      title: 'Dashboard',
      page: 'videos',
      videos: results,
      controls: {
        filterEnabled: false,
        channelChangerEnabled: true,
        buttonsEnabled: true,
        approve: false
      }
    })
  })
})

module.exports = router
