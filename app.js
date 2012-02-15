/*
 * FYP server
 */
var restify = require('restify')
    , socket = require('socket.io')
    , port = 1337
    , url = '127.0.0.1';

var server = restify.createServer({
    name: 'fyp-server',
    version: '0.0.1'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/', function(req, res, next) {
    res.send("Hello world");
});

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

