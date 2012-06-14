var async = require('async')
  , _ = require('underscore')
  , models = require('../schema')
  , sockets = require('../sockets');

/*
 * Index page
 */
exports.index = function(req, res){
  res.json({ hello: 'world' });
};

/*
 * API
 */

/*
 * GET /stops
 * Get nearest stops from a particular location
 *
 * Params:
 *  position: geolocation of users position
 *      => coords: {
 *          latitude: ..
 *          longitude: ..
 *          accuracy: ..
 *      }
 *  route: route id to filter results by [optional]
 */
exports.stops = function(req, res) {
  var pos = req.param('position');
  var time = new Date();
  time.setMinutes(time.getMinutes() - 5);

  var data = {};
  data.stops = [];

  var size = 0.01; // initial distance
  var limit = 3; // minimum number of stops to find
  var step = 0.05; // step size
  models.Stop.findStops(size, pos, limit, step, function(stops) {
    _.each(stops, function(stop, index) {
      var st = stop.toJSON();
      st.distance = getDistance({
        lat: parseFloat(pos.coords.latitude),
        lng: parseFloat(pos.coords.longitude)
      }, {
        lat: parseFloat(stop.lat),
        lng: parseFloat(stop.lng)
      });
      data.stops.push(st);
    });
    res.json(data);
  });
};

/*
 * Get distance
 * Get distance between two points in km
 */
var getDistance = function(pointA, pointB) {
  var R = 6371; // Radius of the earth in km
  var dLat = (pointB.lat-pointA.lat).toRad();  // Javascript functions in radians
  var dLon = (pointB.lng-pointA.lng).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(pointA.lat.toRad()) * Math.cos(pointB.lat.toRad()) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}


/*
 * GET /coaches
 * Get coaches nearest a stop
 *
 * Params:
 *  stop: id of stop to centre search around
 *  route: route id to filter results by [optional]
 */
exports.coaches = function(req, res) {
  var data = {};
  data.coaches = [];
  if(req.param('stop')) { // if stop is defined
    // find all coaches with stop in their stop list
    // TODO filter by ones closet to user
    models.Coach
    .where('stops')
    .in([req.param('stop')])
    .run(function(err, coaches) {
      // loop through all coaches and find their most recent location
      async.forEachSeries(coaches, function(coach, callback) {
        var co = coach.toJSON();
        coach.getLocation(function(err, location) {
          co.location = location;
          data.coaches.push(co); // add to list of coaches
          callback();
        });
      }, function(err) {
        res.json(data);
      });
    });
  } else { // return all coaches
    res.json('success');
  }
};

/*
 * POST /coach/:id
 * Post new coach location data
 *
 * Data:
 *  lat: latitude
 *  lng: longitude
 *  timestamp: timestamp
 *
 */
exports.coachLocation = function(req, res) {
  var id = req.params.id;
  var data = req.body;
  // insert coach data into database
  var location = new models.Location({
    lat: data.lat,
    lng: data.lng,
    timestamp: data.timestamp,
    coach: id
  });

  // push location data to all clients that are connected to coach channel
  sockets.channels['/coach-'+id].emit('location', data);

  location.save(function(err) {
    if(!err) {
      res.json('Success');
    } else {
      res.json({
        err: err
      });
    }
  });
};
