/*! Node.js Simple Message Relay */

const url = 'http://127.0.0.1:3000';
const socket = io.connect( url, { reconnection: true } ); // Set reconnection to false to disable automatic reconnection

(function($) {

    var socket_name = 'my-socket-name';
    var status = $( '#status' ), submit_button = $( 'button.submit' ), simple_notification = $( '#simple_notification' ), simple_notification_color = $( '#simple_notification_color' );
    var notify = $.noist( { position: 'bottom left' } );
    notify.options.duration = 1500;

    // Set connection state
    socket.on( 'connect', function() {

        status.attr( 'data-connected', true ).html( 'Connected' );
        submit_button.removeAttr( 'disabled' );
        $( 'input, select' ).removeAttr( 'disabled' );
        console.info( 'Connected: ' + socket_name );

    }).on( 'disconnect', function( reason ) {

        status.removeAttr( 'data-connected' ).html( 'Disconnected' );
        submit_button.attr( 'disabled', 'disabled' );
        $( 'input, select' ).attr( 'disabled', 'disabled' );
        console.info( 'Connected: ' + socket_name );

    });

    // Listen for messages from Socket.IO
    socket.on( socket_name, function( response ) {

        console.log( `Recevied [${socket_name}]`, response );

        // Display notification
        notify.message( response.message, response.color );

    });

    // Send button event handler
    submit_button.on( 'click', function( event ) {

        event.preventDefault();
        if( !$( 'input' ).val().trim() ) {
            $( 'input' ).addClass( 'empty' );
            return;
        }
        simple_notification.removeClass( 'empty' );

        // Send message to Socket.IO
        jQuery.ajax ({
            url: url + '/send/' + socket_name,
            type: 'POST',
            data: JSON.stringify({
                message: simple_notification.val(),
                color: simple_notification_color.val()
            }),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function( response ){
                simple_notification.val( '' );
                console.log( 'Message sent: ', response );
            }
        });

    });

})( window.jQuery );
