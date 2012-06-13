/*
 * FYP server
 */
var express = require('express')
  , app = express.createServer()
  , gm = require('googlemaps')
  , logme = require('logme')
  , mongoose = require('mongoose')
  , models = require('./schema')
  , _ = require('underscore')
  , sockets = require('./sockets')
  , port = 1337;

/*
 * Connect to database
 */
mongoose.connect('mongodb://localhost:27017/coach');

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
});
app.enable("jsonp callback");

app.get('/', function(req, res) {
  //gm.distance(
    //'51.51957887606202,-0.16791701316833496',
    //'51.498437793589694,-0.17423629760742188|51.50099581189912, -0.1252269744873047',
    //function(err, data) {
      //logme.inspect(data);
    //}
  //);
  res.json({ hello: 'world' });
});

/*
 * Get list of coaches in network
 */
app.get('/coaches', function(req, res) {
  var coaches = [];
});

/*
 * Insert new coach location data
 */
app.post('/coach/:id', function(req, res) {
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

  location.save(function(err) {
    if(!err) {
      res.json('Success');
    } else {
      res.json({
        err: err
      });
    }
  });
});

app.get('/findcoach', function(req, res) {
  //console.log(req.param('position'));
  var time = new Date();
  time.setMinutes(time.getMinutes() - 5);
  var data = {
    coords: {
      speed: 'null',
      altitudeAccuracy: 'null',
      latitude: '51.500995',
      altitude: 'null',
      accuracy: '30',
      longitude: '-0.1252269',
      heading: 'null'
    },
    timestamp: time.getTime()
  }
  res.json(data);
});

app.get('/getcoaches', function(req, res) {
  //console.log(req.param('position'));
  var time = new Date();
  time.setMinutes(time.getMinutes() - 5);
  var data = {
    coaches: [
      {
        id: '2045',
        route: '69',
        direction: 'north',
        coords: {
          speed: 'null',
          altitudeAccuracy: 'null',
          latitude: '51.522522891558964',
          altitude: 'null',
          accuracy: '30',
          longitude: '-0.1739358901977539',
          heading: 'null'
        },
        route: [
          [51.606957031051756, -0.27500152587890625],
          [51.600719873948094, -0.26744842529296875],
          [51.59109591261406, -0.2559471130371094],
          [51.589256197557816, -0.25328636169433594],
          [51.584349926495904, -0.24839401245117188],
          [51.571121687057726, -0.23225784301757812],
          [51.56522641296103, -0.2247905731201172],
          [51.55676896112415, -0.2153491973876953],
          [51.55228614075181, -0.21007061004638672],
          [51.54889704878878, -0.20582199096679688],
          [51.541904581035986, -0.1980113983154297],
          [51.53611229604872, -0.19118785858154297],
          [51.53496442856057, -0.1892566680908203],
          [51.5257537462007, -0.1780986785888672],
          [51.522522891558964, -0.1739358901977539],
          [51.522522891558964, -0.1739358901977539],
          [51.52006622056997, -0.1700305938720703],
          [51.51336310722725, -0.16011714935302734],
          [51.513416522387836, -0.15852928161621094],
          [51.51023821132552, -0.1567697525024414],
          [51.50599121433247, -0.1514911651611328],
          [51.504014489537944, -0.15114784240722656],
          [51.503346657728606, -0.15089035034179688],
          [51.50246510475389, -0.15651226043701172],
          [51.50179725023783, -0.16097545623779297],
          [51.501877393296546, -0.1673269271850586],
          [51.50171710703818, -0.1746654510498047],
          [51.4987249934006, -0.17423629760742188],
          [51.495759401243255, -0.17359256744384766],
          [51.49522503979861, -0.18097400665283203],
          [51.4947173906239, -0.18809795379638672],
          [51.49466395353978, -0.19517898559570312],
          [51.49268673738915, -0.2002429962158203],
          [51.491030084857435, -0.2064228057861328]
        ],
        timestamp: time.getTime()
      },
      {
        id: '2046',
        route: '69',
        direction: 'south',
        coords: {
          speed: 'null',
          altitudeAccuracy: 'null',
          latitude: '51.51957',
          altitude: 'null',
          accuracy: '30',
          longitude: '-0.16791',
          heading: 'null'
        },
        timestamp: time.getTime()
      }
    ]
  }
  res.json(data);
});

/*
 * Find nearest coach stops to a particular location
 *
 * position: req.param('position')
 *  => coords: {
 *      latitude: ..
 *      longitude: ..
 *      accuracy: ..
 *  },
 *  timestamp: ...
 */
app.get('/findstop', function(req, res) {
  var pos = req.param('position');
  var time = new Date();
  time.setMinutes(time.getMinutes() - 5);

  var data = {};
  data.stops = [];

  var distance = 0.01;
  getStops({
    lat: {
      gte: pos.coords.latitude - distance,
      lte: parseFloat(pos.coords.latitude) + parseFloat(distance)
    },
    lng: {
      gte: pos.coords.longitude - distance,
      lte: parseFloat(pos.coords.longitude) + parseFloat(distance)
    }
  }, 3, 0.05, function(stops) {
    _.each(stops, function(stop, index) {
      data.stops.push(stop);
    });
    res.json(data);
  });
});

/*
 * Get stops around a position
 *
 * size: {
 *  lat: {
 *      gte:
 *      lte:
 *  },
 *  lng: {
 *      gte:
 *      lte:
 *  }
 * }
 */
var getStops = function(size, limit, step, callback) {
  // get stops near a position
  // recursively increase box size until enough stops are found

  models.Stop
  .where('lat').gte(size.lat.gte)
  .where('lat').lte(size.lat.lte)
  .where('lng').gte(size.lng.gte)
  .where('lng').lte(size.lng.lte)
  .run(function(err, stops) {
    if(stops.length < limit) { // if there aren't enough stops
      size.lat = {
        gte: size.lat.gte - step,
        lte: parseFloat(size.lat.lte) + parseFloat(step)
      };
      size.lng = {
        gte: size.lng.gte - step,
        lte: parseFloat(size.lng.lte) + parseFloat(step)
      }
      getStops(size, limit, callback);
    } else {
      if(typeof callback == 'function') {
        callback(stops);
        return false;
      }
    }
  });
};

sockets.run(app); // initialise socket connections

app.listen(port);
console.log("Express server listening on port %d", app.address().port);

