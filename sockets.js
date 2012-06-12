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
  // for each route set up a channel
  models.Coach.find({}, function(err, coaches) {
    _.each(coaches, function(coach, index) {
      newChannel(coach.id, 'coach');
    });
  });
  /*
  db.channels.on('load', function() { // when db is ready
    db.channels.forEach(function(key, val) { // loop through each channel
      newChannel(key);
    });
  });
  */
}

var newChannel = function(channel, prefix) {
  var name = '/';
  if(prefix) name += prefix + '-';
  name += channel;
  channels[channel] = io.of(name).on('connection', function(socket) {
    socket.emit('message', { hello: 'Welcome to the '+channel+' channel' }); // welcome message
  });
}

exports.add = function(channel, key, callback) {
  var now = new Date();
  //db.channels.set(channel, { created: now.toJSON(), 'created_by': key }, function() {
    newChannel(channel);
    if(typeof(callback) == 'function') callback();
  //});
}

exports.channel = channels;

