const express      = require('express'),
      bodyParser   = require('body-parser'),
      cookieParser = require('cookie-parser'),
      passport     = require('passport'),
      Strategy     = require('passport-local').Strategy,
      session      = require('express-session'),
      MongoClient  = require('mongodb').MongoClient,
      pug          = require('pug'),
      path         = require('path'),

      channels     = require('./data/channels.json'),
      credentials  = require('./data/credentials.json')

let app = express(),
    db

app.set('port', (process.env.PORT || 5000))
app.set('view engine', 'pug')
app.set('views', __dirname + '/views')
app.locals.basedir = path.join(__dirname, 'views')

app.use(express.static(__dirname + '/public'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({ secret: 'lyla', resave: false, saveUninitialized: false }))

passport.use(new Strategy({ session: false },
  (username, password, cb) => {
    if (username == credentials.id && password == credentials.pass) {
      return cb(null, credentials)
    }

    return cb(null, false)
  }
))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  cb(null, credentials)
})

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.channels = channels
  req.db = db

  res.locals.getChannelLabel = (video) => {
    let channels = video.channels,
        notInEverything = video.notInEverything

    let hiddenMarker = ''
    if (notInEverything) {
      hiddenMarker = '*'
    }

    if (channels == null || channels.length == 0) {
      return hiddenMarker + 'no channels'
    } else if (channels.length >= 3) {
      return hiddenMarker + channels.length + ' channels'
    } else {
      return hiddenMarker + channels.join(', ')
    }
  }

  next()
})

app.use('/', require('./routes/client'))
app.use('/admin', authenticate, require('./routes/admin'))
app.use('/api', authenticate, require('./routes/api'))

app.get('/login', (req, res) => {
  res.render('admin/login')
})

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => { res.redirect('/admin') }
)

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

function authenticate(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

MongoClient.connect('mongodb://admin:kittenmittens@ds151752.mlab.com:51752/hyperflora', (err, database) => {
  if (err) return console.log(err)

  db = database
  console.log('Connected to database')

  app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'))
  })
})
