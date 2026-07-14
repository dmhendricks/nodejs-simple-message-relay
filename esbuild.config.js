/**
 * esbuild configuration for Node.js Simple Message Relay demo assets
 *
 * Concatenates and minifies JS assets. These are legacy global scripts
 * (not ES modules), so we concatenate manually and use esbuild's
 * transform API for minification and sourcemaps.
 *
 * Usage:
 *   node esbuild.config.js --prod   (production build)
 *   node esbuild.config.js --watch  (development watch mode)
 */

const fs = require( 'fs' );
const path = require( 'path' );
const esbuild = require( 'esbuild' );

const args = process.argv.slice( 2 );
const isWatch = args.includes( '--watch' );

const SRC = './public/src';
const DEST = './public/assets/js';

/**
 * JS build definitions.
 *
 * "vendor" is concatenated and minified into vendor.min.js.
 * "main" is copied through as-is (unminified), matching prior behavior.
 */
const vendorFiles = [
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/sprintf-js/dist/sprintf.min.js',
    './node_modules/socket.io-client/dist/socket.io.min.js',
    `${SRC}/vendor/notify.min.js`,
];

async function buildJS() {
    try {
        fs.mkdirSync( DEST, { recursive: true } );

        // Vendor bundle: concatenate and minify
        const combined = vendorFiles
            .map( f => fs.readFileSync( f, 'utf8' ) )
            .join( '\n' );

        const result = await esbuild.transform( combined, {
            minify: true,
            sourcefile: 'vendor.js',
            target: ['es2015'],
            legalComments: 'none',
        });

        fs.writeFileSync( path.join( DEST, 'vendor.min.js' ), result.code );

        // Site script: pass through unminified
        fs.copyFileSync( `${SRC}/js/main.js`, path.join( DEST, 'main.js' ) );

        console.log( 'JavaScript build complete!' );
    } catch ( error ) {
        console.error( 'JavaScript build failed:', error );
        if ( ! isWatch ) {
            process.exit( 1 );
        }
    }
}

if ( isWatch ) {
    let debounceTimer;
    const rebuild = () => {
        clearTimeout( debounceTimer );
        debounceTimer = setTimeout( () => buildJS(), 100 );
    };

    fs.watch( `${SRC}/js`, { recursive: true }, ( _event, filename ) => {
        if ( filename && filename.endsWith( '.js' ) ) rebuild();
    });

    buildJS(); // Initial build
    console.log( 'Watching for JavaScript changes...' );
} else {
    buildJS();
}
