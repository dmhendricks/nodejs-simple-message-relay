/**
 * NodePop - Simple Node.js server to send and receive messages using Restify and Socket.IO
 *
 * @author Daniel M. Hendricks
 */

const
    config = require( 'config' ),
    corsMiddleware = require( 'restify-cors-middleware' ),
    errors = require( 'restify-errors' ),
    restify = require( 'restify' ),
    socketio = require( 'socket.io' );

const
    server = restify.createServer(),
    io = socketio.listen( server.server ),
    cors = corsMiddleware( config.get( 'cors' ) );

server.use( restify.plugins.queryParser() );
server.use( restify.plugins.bodyParser() );
server.pre( cors.preflight );
server.use( cors.actual );

// Serve static files under ./public
if( config.get( 'demo_page' ) ) {

    server.get( '/*', restify.plugins.serveStatic({
        directory: __dirname + '/public',
        default: 'index.html',
    }));

}

// Relay messages to connected clients
server.post( '/send/:socket', function( req, res, next ) {

    if( config.get( 'api_keys' ).length && ( typeof req.query.api_key === 'undefined' || !config.get( 'api_keys' ).includes( req.query.api_key ) ) ) {
        next( new errors.BadRequestError( 'Invalid API key' ) );
    } else if( config.get( 'sockets' ).length && !config.get( 'sockets' ).includes( req.params.socket ) ) {
        next( new errors.BadRequestError( 'Invalid socket name' ) );
    } else {
        io.emit( req.params.socket, req.body );
        res.send( req.body );
        next();
    }

});

server.listen( config.get( 'server.port' ), config.get( 'server.address' ), () => console.log( `Listening at ${server.url}` ) );
