/**
 * NodePop - Simple Node.js server to send and receive messages using Express and Socket.IO
 *
 * @license Apache-2.0
 * @author Daniel M. Hendricks
 * @see {@link https://github.com/dmhendricks/nodejs-simple-message-relay}
 */

import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import config from 'config';
import cors from 'cors';
import createError from 'http-errors';
import express from 'express';
import http from 'http';
import path from 'path';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

const
    app = express(),
    server = http.createServer( app ),
    io = new SocketIOServer( server, { cors: config.get( 'cors' ) } );

app.use( cors( config.get( 'cors' ) ) );
app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

// Serve static files under ./public
if( config.get( 'demo_page' ) ) {

    app.use( express.static( path.join( __dirname, 'public' ) ) );

}

// Relay messages to connected clients
app.post( '/send/:socket', function( req, res, next ) {

    if( config.get( 'api_keys' ).length && ( typeof req.query.api_key === 'undefined' || !config.get( 'api_keys' ).includes( req.query.api_key ) ) ) {
        next( createError( 400, 'Invalid API key', { code: 'BadRequest' } ) );
    } else if( config.get( 'sockets' ).length && !config.get( 'sockets' ).includes( req.params.socket ) ) {
        next( createError( 400, 'Invalid socket name', { code: 'BadRequest' } ) );
    } else {
        io.emit( req.params.socket, req.body );
        res.send( req.body );
    }

});

app.use( function( err, req, res, next ) {
    res.status( err.status || 500 ).json({ code: err.code || 'InternalError', message: err.message });
});

server.listen( config.get( 'server.port' ), config.get( 'server.address' ), () => {
    const addr = server.address();
    console.log( `Listening at http://localhost:${addr.port}` );
});
