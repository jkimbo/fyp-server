/*
 * FYP server
 */
var express = require('express')
  , app = express.createServer()
  , io = require('socket.io').listen(app)
  , gm = require('googlemaps')
  , logme = require('logme')
  , redis = require('redis')
  , client = redis.createClient()
  , _ = require('underscore')
  , port = 1337;

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
});
app.enable("jsonp callback");

/*
 * Some redis playing
 */
client.on('error', function(err) {
  console.log("Error "+err);
});

client.hgetall("coaches", function (err, obj) {
  _.each(obj, function(coach, key) {
    console.log(coach, key);
    var data = JSON.parse(coach);
  });
  client.quit();
});

app.get('/', function(req, res) {
  //gm.distance(
    //'51.51957887606202,-0.16791701316833496',
    //'51.498437793589694,-0.17423629760742188|51.50099581189912, -0.1252269744873047',
    //function(err, data) {
      //logme.inspect(data);
    //}
  //);
  //res.send(req.params);
});

app.post('/location/:id', function(req, res) {
  res.json({ hello : 'world' });
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

app.get('/findstop', function(req, res) {
  //console.log(req.param('position'));
  var time = new Date();
  time.setMinutes(time.getMinutes() - 5);

  var data = {
    coords: {
      speed: 'null',
      altitudeAccuracy: 'null',
      latitude: '51.4984377',
      altitude: 'null',
      accuracy: '30',
      longitude: '-0.174236297',
      heading: 'null'
    },
    coaches: [
      {
        route: '69',
        direction: 'north',
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
      },
      {
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

app.listen(port);
console.log("Express server listening on port %d", app.address().port);

io.sockets.on('connection', function(socket) {
  socket.emit('data', { hello: 'world' });
  socket.on('location', function(data) {
    console.log(data);
  });
});

