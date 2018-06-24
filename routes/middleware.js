function generateSearchParams(req, res, next) {
  let channelFilter = req.query.channel || req.params.channel,
      visibilityFilter = req.query.visibility

  // special case for everything channel
  if (req.path != '/' && !channelFilter && !visibilityFilter) {
    visibilityFilter = 'visible'
  }

  let params = {
    approved: true,
  }

  if (channelFilter == 'none') {
    params.channels = []
  } else if (channelFilter != null && channelFilter != 'all') {
    params.channels = channelFilter
  }

  if (visibilityFilter == 'visible') {
    params.notInEverything = { $in: [null, false] }
  } else if (visibilityFilter == 'hidden') {
    params.notInEverything = true
  }

  console.log(params)
  req.searchParams = params
  req.channelFilter = channelFilter || 'all'
  req.visibilityFilter = visibilityFilter || 'all'
  next()
}

function getRandomVideoFromSearch(req, res, next) {
  req.db.collection('videos').find(req.searchParams).toArray((err, results) => {
    let vid = getRandomFromArray(results)

    while (results.length > res.locals.historySize && res.locals.history.indexOf(vid.searchId) > -1) {
      console.log('checking again')
      vid = getRandomFromArray(results)
    }
    res.updateHistory(vid)

    res.video = vid
    next()
  })
}

function getRandomFromArray(arr) {
  return arr[getRandomInt(0, arr.length)]
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

module.exports = {
  generateSearchParams: generateSearchParams,
  getRandomVideoFromSearch: getRandomVideoFromSearch
}
