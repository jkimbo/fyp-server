
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Location = new Schema({
  lat: Number,
  lng: Number,
  timestamp: String
});

var Coach = new Schema({
  id: Number,
  currentLocation: [Location]
});

var Route = new Schema({
  id: Number,
  description: String,
  coaches: [Coach],
  points: [Location],
  stops: [Location]
});

module.exports = {
  Route: mongoose.model('Route', Route),
  Coach: mongoose.model('Coach', Coach)
}
