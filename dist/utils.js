'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterFiresByYear = undefined;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var filterFiresByYear = function filterFiresByYear(year) {
  return _ramda2.default.filter(function (x) {
    return Number(x.properties.FIRE_YEAR) === Number(year);
  });
};

exports.filterFiresByYear = filterFiresByYear;