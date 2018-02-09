// Dependencies
const crypto = require('crypto')
const express = require('express')
// const routes = require('./routes')
const about = require('./routes/about')
const index = require('./routes/index')
const http = require('http')
const path = require('path')

// Extensions for Express
const favicon = require('serve-favicon')
const logger = require('morgan')
const methodOverride = require('method-override')
const session = require('express-session')
const bodyParser = require('body-parser')
const multer = require('multer')
const errorHandler = require('errorhandler')

// Configuration for Multer -- Node.js middleware for handling `multipart/form-data` (file upload)
const UPLOAD_DIR = global.UPLOAD_DIR = path.join(__dirname, '/public/images/uploads')
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)
      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})
const upload = multer({ storage })

// Configuration for Express -- Node.js web application framework
const app = express()

app.set('port', process.env.PORT || 3000)
app.set('views', './views')
app.set('view engine', 'pug')
app.use(favicon('./public/favicon.ico'))
app.use(logger('dev'))
app.use(methodOverride())
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: '12345678'
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use('/', express.static('./public', {
  setHeaders: (res, path, stat) => {
    if (/\.(3gp|gif|jpg|jpeg|png|ico|wmv|avi|asf|asx|mpg|mpeg|mp4|pls|mp3|mid|wav|swf|flv|exe|zip|tar|rar|gz|tgz|bz2|uha|7z|doc|docx|xls|xlsx|pdf|iso|js|css|eot|svg|ttf|woff|woff2)$/.test(path)) {
      const day = 86400
      res.set('Access-Control-Allow-Origin', '*')
      res.set('Cache-Control', `public, max-age=${day * 30}, must-revalidate, proxy-revalidate, immutable, stale-while-revalidate=86400, stale-if-error=604800`) // 30 days
    }
  }
}))

app.get('/', index.get)
app.post('/', upload.single('image'), index.post)
app.get('/about', about.get)

// NOTE: Uses fiery.me branch of https://github.com/BobbyWibowo/HttpErrorPages
app.use((req, res, next) => {
  res.status(404).sendFile('HTTP404.html', { root: '../HttpErrorPages/dist/' })
})
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).sendFile('HTTP505.html', { root: '../HttpErrorPages/dist/' })
})

// NOTE: Error handling middleware should be loaded after the loading of the routes
if (app.get('env') === 'development') {
  app.use(errorHandler())
}

const server = http.createServer(app)
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
