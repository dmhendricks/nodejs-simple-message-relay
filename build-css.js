/**
 * CSS build script for Node.js Simple Message Relay demo assets
 *
 * Compiles SCSS, concatenates the vendor bundle, autoprefixes,
 * and outputs both the expanded site stylesheet and minified vendor bundle.
 *
 * Usage:
 *   node build-css.js --prod   (production build)
 *   node build-css.js --watch  (development watch mode)
 */

import fs from 'fs';
import path from 'path';
import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const args = process.argv.slice( 2 );
const isWatch = args.includes( '--watch' );

const SRC = './public/src';
const DEST = './public/assets/css';

const vendorFiles = [
    './node_modules/@picocss/pico/css/pico.min.css',
    './node_modules/toastify-js/src/toastify.css',
];

async function buildCSS() {
    try {
        fs.mkdirSync( DEST, { recursive: true } );

        // Vendor bundle: concatenate and minify
        const combinedVendor = vendorFiles
            .map( f => fs.readFileSync( f, 'utf8' ) )
            .join( '\n' );

        const minifiedVendor = await postcss( [autoprefixer, cssnano] )
            .process( combinedVendor, { from: undefined } );
        fs.writeFileSync( path.join( DEST, 'vendor.min.css' ), minifiedVendor.css );

        // Site stylesheet: compile SCSS, autoprefix, expanded output
        const compiled = sass.compile( `${SRC}/scss/style.scss`, { style: 'expanded' } );
        const expanded = await postcss( [autoprefixer] )
            .process( compiled.css, { from: undefined } );
        fs.writeFileSync( path.join( DEST, 'style.css' ), expanded.css );

        console.log( 'CSS build complete!' );
    } catch ( error ) {
        console.error( 'CSS build failed:', error );
        if ( ! isWatch ) {
            process.exit( 1 );
        }
    }
}

if ( isWatch ) {
    let debounceTimer;
    const rebuild = () => {
        clearTimeout( debounceTimer );
        debounceTimer = setTimeout( () => buildCSS(), 100 );
    };

    fs.watch( `${SRC}/scss`, { recursive: true }, ( _event, filename ) => {
        if ( filename && filename.endsWith( '.scss' ) ) rebuild();
    });

    buildCSS(); // Initial build
    console.log( 'Watching for CSS/SCSS changes...' );
} else {
    buildCSS();
}
