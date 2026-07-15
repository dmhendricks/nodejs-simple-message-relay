/*! Node.js Simple Message Relay */

const url = 'http://127.0.0.1:3000';
const socket = io.connect( url, { reconnection: true } ); // Set reconnection to false to disable automatic reconnection

(function($) {

    // Initialize Socket.IO
    var socket_name = 'my-socket-name'; // Name as you wish
    var status = $( '#status' ), submit_button = $( 'button.submit' );
    var notification_message = $( '#notification_message' );

    // Default message text shown per notification type
    var defaultMessages = {
        simple: 'Hello world',
        advanced: 'Someone in Chicago, USA just bought a <strong>Toolbox Widget/Modular Toolbox Wrench Organizer!</strong>'
    };

    // Named colors map to background colors for simple notifications
    var notifyColors = {
        white: '#fff',
        success: '#9CCC65',
        info: '#4FC3F7',
        warning: '#FFC107',
        error: '#E57373'
    };

    var currentAdvancedToast = null; // Only one advanced notification at a time

    function showSimpleNotification( message, color ) {
        Toastify({
            text: message,
            gravity: 'bottom',
            position: 'left',
            duration: 6000,
            close: true,
            style: { background: notifyColors[ color ] || '#757575' }
        }).showToast();
    }

    function showAdvancedNotification( message, link, image ) {
        if( currentAdvancedToast ) currentAdvancedToast.hideToast();

        var node = document.createElement( 'div' );
        node.className = 'notify-advanced';
        node.innerHTML = '<span class="notify-content"><span class="notify-image" style="background-image: url(\'' + image + '\'); display: none;"></span><span class="notify-content">' + message + '</span></span><div style="clear: left;"></div>';
        if( typeof image !== 'undefined' && image ) $( node ).find( '.notify-image' ).show();

        currentAdvancedToast = Toastify({
            node: node,
            gravity: 'bottom',
            position: 'left',
            duration: 7000,
            close: true,
            style: { background: '#fff' },
            destination: link || undefined,
            callback: function() { currentAdvancedToast = null; }
        });
        currentAdvancedToast.showToast();
    }

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

            // Display advanced notification with image and link
            showAdvancedNotification( response.message, response.link, response.image );

        } else {

            // Display simple, Growl-style notification
            showSimpleNotification( response.message, response.color );

        }

    });

    // Send button event handler
    submit_button.on( 'click', function( event ) {

        event.preventDefault();

        // Disallow submitting empty messages
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

                notification_message.val( defaultMessages[ $( '#notification_type' ).val() ] || '' );
                console.log( 'Message sent: ', response );

            }
        });

    });

    // Modify form when type is selected
    $( '#notification_type' ).on( 'change', function( event ) {
        var type = $( this ).val();

        if( type == 'simple' ) {

            $( '.notification-row-advanced' ).hide();
            $( '.notification-row-simple' ).show();

        } else {

            $( '.notification-row-advanced' ).show();
            $( '.notification-row-simple' ).hide();

        }

        notification_message.val( defaultMessages[ type ] || '' );

    }).trigger( 'change' );

})( window.jQuery );
