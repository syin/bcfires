'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _output_simplified = require('../output_simplified.json');

var _output_simplified2 = _interopRequireDefault(_output_simplified);

var _output_simplified_padded = require('../output_simplified_padded.json');

var _output_simplified_padded2 = _interopRequireDefault(_output_simplified_padded);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var port = 3000;

var fires = _output_simplified2.default.features;

app.use(function (request, response, next) {
  next();
});

app.use(function (err, request, response, next) {
  console.log(err);
  response.status(500).send('error');
});

app.get('/', function (request, response) {
  response.sendFile(_path2.default.join(__dirname, '../map.html'));
});

app.use(_express2.default.static('public'));

app.get('/bcmap.geojson', function (request, response) {
  response.sendFile(_path2.default.join(__dirname, '../bcmap.geojson'));
});

app.get('/fires/:year', function (req, res) {
  var year = req.params.year;
  var firesInYear = utils.filterFiresByYear(year)(fires);
  var firesInYearConvexHulls = utils.filterFiresByYear(year)(_output_simplified_padded2.default);
  res.send([firesInYear, firesInYearConvexHulls]);
});

app.listen(port, function (err) {
  if (err) {
    return console.log('error', err);
  }
  console.log('server is listening on ', port);
});