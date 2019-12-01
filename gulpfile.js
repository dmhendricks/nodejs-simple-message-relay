/**
 * Gulpfile for Node.js Simple Message Relay
 *    Usage: npx gulp
 */

let pkg = require( './package.json' ),
    gulp = require( 'gulp' ),
    autoprefixer = require( 'gulp-autoprefixer' ),
    concat = require( 'gulp-concat' ),
    lineec = require( 'gulp-line-ending-corrector' ),
    notify = require( 'gulp-notify' ),
    sass = require( 'gulp-sass' );

// Set default source/destination paths
let src = { sass: './public/src/scss', js: './public/src/js' },
    dest = { css: './public/assets/css', js: './public/assets/js' };

// Set terser options
let terser_options = { output: { comments: /^!/ } },
    sass_options = { sourceComments: 'map', errLogToConsole: true, outputStyle: 'expanded', precision: 10 };

/**
 * Browser list to add vendor prefixes
 * @see https://github.com/browserslist/browserslist
 */
const BROWSERS_LIST = [ 'last 2 version', '> 1%', 'ie >= 11', 'last 2 Android versions', 'last 2 ChromeAndroid versions', 'last 4 Chrome versions', 'last 4 Firefox versions', 'last 4 Safari versions', 'last 4 iOS versions', 'last 4 Edge versions', 'last 2 Opera versions' ];

/**
 * Gulp Tasks
 */

// Watch files
function watchFiles() {
  gulp.watch( `${src.js}/**/*.js`, gulp.series( 'taskJS' ) );
  gulp.watch( `${src.sass}/**/*.scss`, gulp.series( 'taskCSS' ) );
}

// JavaScript assets
gulp.task( 'taskJS', (done) => {

    gulp.src( `${src.js}/main.js` )
        .on( 'error', console.error.bind( console ) )
        .pipe( concat( 'main.js' ) )
        .pipe( lineec() )
        .pipe( gulp.dest( dest.js ) )
        .pipe( notify( { message: 'JS: Tasks completed', onLast: true } ) );

    done();

});

// CSS & SASS assets
gulp.task( 'taskCSS', (done) => {

    gulp.src( `${src.sass}/style.scss` )
        .on( 'error', console.error.bind( console ) )
        .pipe( sass( sass_options ) )
        .pipe( autoprefixer( BROWSERS_LIST ) )
        .pipe( lineec() )
        .pipe( gulp.dest( dest.css ) )
        .pipe( notify( { message: 'CSS: Tasks completed', onLast: true } ) );

  done();

});

/**
 * Default task
 */
gulp.task( 'default', gulp.series( gulp.parallel( 'taskCSS', 'taskJS' ), watchFiles ) );
