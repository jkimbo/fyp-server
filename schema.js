
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/*
 * Location data
 */
var Location = new Schema({
  lat: Number, // latitude
  lng: Number, // longitude
  timestamp: String, // timestamp of location
  coach: Number, // id of coach
  speed: String,
  altitudeAccuracy: String,
  altitude: String,
  accuracy: String,
  heading: String
});

var Coach = new Schema({
  id: Number, // id of coach
  route: Number, // route number
  description: String // coach description [optional]
});

/*
 * Route data
 */
var Route = new Schema({
  id: Number, // route id
  description: String, // description of route
  coaches: [Coach], // list of coaches that operate on route
  points: [Location], // lat, lng coordinates along route
  stops: [Location] // lat, lng coordinates of stops
});

module.exports = {
  Location: mongoose.model('Location', Location),
  Route: mongoose.model('Route', Route),
  Coach: mongoose.model('Coach', Coach)
}
