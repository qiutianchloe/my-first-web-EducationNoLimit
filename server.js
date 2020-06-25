#!/usr/bin/env node

/**
 * Module dependencies.
 */
let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
//import database connection module
let db = require('./database/db')
//import express-session
let session = require('express-session');
//import connect-mongo for session persistence
let MongoStore = require('connect-mongo')(session);

//import routers
let indexRouter = require('./router/indexRouter')
let userRouter = require('./router/userRouter')
let fileRouter = require('./router/fileRouter')
let rateRouter = require('./router/rateRouter')


let app = express();
//define ejs template and the directory
app.set("view engine" , "ejs")
app.set("views","./views")

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//define cookie-session configuration object
app.use(session({
  name: 'user',   //define cookie name
  secret: 'abcdef', //define signature
  saveUninitialized: false,
  resave: false ,
  store: new MongoStore({
      url: 'mongodb+srv://dbuser:2020info30005@test-ryy97.mongodb.net/cookies_container?retryWrites=true&w=majority',
      touchAfter: 3600
  }),
  cookie: {
      maxAge: 1000*60*60*3 //define cookie expired time--3hours
  },
}));

  //use body-parser middleware
app.use(bodyParser.urlencoded({extended: true}))


app.use(indexRouter);
app.use(userRouter);
app.use(fileRouter);
app.use(rateRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var http = require('http');
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
var server = http.createServer(app);
server.listen(port);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}
