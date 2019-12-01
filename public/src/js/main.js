/*! Node.js Simple Message Relay */

const url = 'http://127.0.0.1:3000';
const socket = io.connect( url, { reconnection: true } ); // Set reconnection to false to disable automatic reconnection

(function($) {

    var socket_name = 'my-socket-name';
    var msg = $( '#messages' ), status = $( '#status' ), submit_buttom = $( 'button.submit' ), message_to_send = $( '#message_to_send' );

    // Set connection state
    socket.on( 'connect', function() {

        status.attr( 'data-connected', true ).html( 'Connected' );
        submit_buttom.removeAttr( 'disabled' );
        message_to_send.removeAttr( 'disabled' );
        console.info( 'Connected: ' + socket_name );

    }).on( 'disconnect', function( reason ) {

        status.removeAttr( 'data-connected' ).html( 'Disconnected' );
        submit_buttom.attr( 'disabled', 'disabled' );
        message_to_send.attr( 'disabled', 'disabled' );
        console.info( 'Connected: ' + socket_name );

    });

    // Listen for messages from Socket.IO
    socket.on( socket_name, function( payload ) {

        console.log( `Recevied [${socket_name}]`, payload );

        // Remove "Waiting..." element, if present
        $( '#waiting' ).remove();

        // Append incoming messages to element
        msg.append( '<p class="message">' + payload.content + '</p>' );
    });

    // Send button event handler
    submit_buttom.on( 'click', function( event ) {

        event.preventDefault();
        if( !message_to_send.val().trim() ) {
            message_to_send.addClass( 'empty' );
            return;
        }
        message_to_send.removeClass( 'empty' );

        // Send message to Socket.IO
        jQuery.ajax ({
            url: url + '/send/' + socket_name,
            type: 'POST',
            data: JSON.stringify({
                content: message_to_send.val()
            }),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function( response ){
                message_to_send.val( '' );
                console.log( 'Message sent: ', response );
            }
        });

    });

})( window.jQuery );
