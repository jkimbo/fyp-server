/*
 * Web socket handling
 */
var socket = require('socket.io')
  , models = require('./schema')
  , _ = require('underscore')
  , channels = {}
  , io = {}

exports.run = function(app) {
  io = socket.listen(app);
  io.set('log level', 1); // reduce logging
  io.on('connection', function(socket) {
    socket.emit('message', { hello: 'Hello' });
  });
  // for each coach set up a channel
  models.Coach.find({}, function(err, coaches) {
    _.each(coaches, function(coach, index) {
      newChannel(coach.id, 'coach');
    });
  });
  // for each route set up a channel
  models.Route.find({}, function(err, routes) {
    _.each(routes, function(route, index) {
      newChannel(route.id, 'route');
    });
  });
}

var newChannel = function(channel, prefix) {
  var name = '/';
  if(prefix) name += prefix + '-';
  name += channel;
  channels[name] = io.of(name).on('connection', function(socket) {
    socket.emit('message', { hello: 'Welcome to the '+name+' channel' }); // welcome message
  });
}

exports.add = function(channel, key, callback) {
  var now = new Date();
  //db.channels.set(channel, { created: now.toJSON(), 'created_by': key }, function() {
    newChannel(channel);
    if(typeof(callback) == 'function') callback();
  //});
}

exports.channels = channels;

