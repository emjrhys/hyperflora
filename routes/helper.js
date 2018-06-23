function generateSearchParams(req, res, next) {
  let channelFilter = req.query.channel || req.params.channel,
      visibilityFilter = req.query.visibility

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

module.exports.generateSearchParams = generateSearchParams
