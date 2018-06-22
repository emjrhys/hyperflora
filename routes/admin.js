const express  = require('express')

let router = express.Router()

router.use((req, res, next) => {
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

router.get('/', (req, res) => {
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

    res.render('admin/stats', { title: 'Stats', total: results.length, hiddenTotal: hiddenTotal, channelCounts: channelCounts, untagged: untagged })
  })
})

router.get('/download', (req, res) => {
  req.db.collection('videos').find().toArray((err, results) => {
    res.json(results)
  })
})

module.exports = router
