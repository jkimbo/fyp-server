/*
 * FYP server
 */
var express = require('express')
    , app = express.createServer()
    , io = require('socket.io').listen(app)
    , gm = require('googlemaps')
    , logme = require('logme')
    , port = 1337;

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.get('/', function(req, res) {
    gm.distance('51.51957887606202,-0.16791701316833496', '51.498437793589694,-0.17423629760742188|51.50099581189912, -0.1252269744873047', function(err, data) {
        logme.inspect(data);
    });
    res.send(req.params);
});

app.post('/location/:id', function(req, res) {
    res.json({hello:'world'});
});

app.listen(port);
console.log("Express server listening on port %d", app.address().port);

io.sockets.on('connection', function(socket) {
    socket.emit('data', { hello: 'world' });
    socket.on('location', function(data) {
        console.log(data);
    });
});

