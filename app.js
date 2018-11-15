var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
require('dotenv').config();

var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var auth = require('./routes/auth');

var app = express();

app.engine('ejs', require('express-ejs-extend'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 100 * 1000 }
}));
app.use(flash());

const authCheck = function (req, res, next) {
  console.log('middleware', req.session);
  if (req.session.uid === process.env.ADMIN_UID) {
    return next();
  } else {
    return res.redirect('/auth/signin');
  }
};

app.use('/', indexRouter);
app.use('/dashboard', authCheck, dashboardRouter);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, '您所查看的頁面不存在:('));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
