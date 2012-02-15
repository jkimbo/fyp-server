/*
 * FYP server
 */
var express = require('express')
    , app = express.createServer()
    , socket = require('socket.io')
    , port = 1337;

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.get('/', function(req, res) {
    res.send(req.params);
});

app.post('/location/:id', function(req, res) {
    res.send(req.body);
});

app.listen(port);
console.log("Express server listening on port %d", app.address().port);

