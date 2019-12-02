/*! Node.js Simple Message Relay */

const url = 'http://127.0.0.1:3000';
const socket = io.connect( url, { reconnection: true } ); // Set reconnection to false to disable automatic reconnection

(function($) {

    // Initialize Socket.IO
    var socket_name = 'my-socket-name'; // Name as you wish
    var status = $( '#status' ), submit_button = $( 'button.submit' );

    // Configure notifications
    var notifySimple = $.noist( { position: 'bottom left', delay: 6000 } ),
        notifyAdvanced = $.noist( { position: 'bottom left', delay: 7000, limit: 1, stopOnLimit: true, limitEffect: 'hide' } ); // Only one at a time
    var advancedTemplate = '<a href="%s" class="notification"><span class="notify-content"><span class="notify-image" style="background-image: url(\'%s\'); display: none;"></span><span class="notify-content">%s</span></span><div style="clear: left;"></div></a>';

    // Display connection state
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

        // You can consume the response data as you desire and for your own needs.
        if( typeof response.type !== 'undefined' && response.type == 'advanced' ) {

            // Display advanced notification using a template
            notifyAdvanced.message( sprintf( advancedTemplate, response.link, response.image, response.message ), 'white' );
            $( '.notification' ).parent().parent().addClass( 'notify-advanced' );
            if( typeof response.image !== 'undefined' ) $( 'span.notify-image' ).show();

        } else {

            // Display simple, Growl-style notification
            notifySimple.message( response.message, response.color );

        }

    });

    // Send button event handler
    submit_button.on( 'click', function( event ) {

        event.preventDefault();

        // Disallow submitting empty messages
        var notification_message = $( '#notification_message' );
        if( !notification_message.val().trim() ) {
            notification_message.addClass( 'empty' );
            return;
        }
        notification_message.removeClass( 'empty' );

        // Send message to Socket.IO endpoint
        jQuery.ajax ({
            url: url + '/send/' + socket_name,
            type: 'POST',
            data: JSON.stringify({
                type: $( '#notification_type' ).val(),
                message: notification_message.val(),
                link: $( '#notification_link' ).val(),
                image: $( '#notification_image' ).val(),
                color: $( '#notification_color' ).val()
            }),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function( response ){

                $( 'input' ).val( '' );
                console.log( 'Message sent: ', response );

            }
        });

    });

    // Modify form when type is selected
    $( '#notification_type' ).on( 'change', function( event ) {
        if( $( this ).val() == 'simple' ) {

            $( '#notification_link' ).parent().parent().hide();
            $( '#notification_image' ).parent().parent().hide();
            $( '#notification_color' ).parent().parent().show();

        } else {

            $( '#notification_link' ).parent().parent().show();
            $( '#notification_image' ).parent().parent().show();
            $( '#notification_color' ).parent().parent().hide();

        }
    });

})( window.jQuery );
