var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connectDB = require('./model/dbconfig');
require('dotenv').config();
const cors = require('cors');

// var indexRouter = require('./routes/index');
// const authRoutes = require('./routes/authRoutes');

const AuctionAuthRoutes = require('./routes/AuctionAuthRoutes');
// const createAucRoutes = require('./routes/createAucRoutes');
const itemRoutes = require('./routes/ItemRoutes');
const otpRoutes = require('./routes/otpRoutes');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
connectDB();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api', authRoutes);


app.use('/api', AuctionAuthRoutes);
// app.use('/api', createAucRoutes);
app.use('/api', itemRoutes);
app.use("/api", otpRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  const error = {
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  };

  // send error response
  res.status(err.status || 500).json({
    success: false,
    message: error.message,
    error: error.error
  });
});

module.exports = app;
