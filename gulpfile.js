// set up gulp and packages
var gulp        = require('gulp'),
sass            = require('gulp-sass'),
notify          = require('gulp-notify');


// location constants
var ALL_SCSS      = 'sass/*.scss',
    DEST_CSS      = 'public/css/',

    ALL_JS_CORE   = 'public/js/*.js',
    DEST_JS_CORE  = './assets/js';

// convert sass to css
gulp.task('sass', function(){
  gulp.src(ALL_SCSS)
        .pipe(sass().on('error', sass.logError))
        .pipe(sass({errLogToConsole: true}))
        .pipe(gulp.dest(DEST_CSS))
        .pipe(notify({ message: 'sass complete' }));
});

// jshint js
gulp.task('jshint', function(){
    gulp.src([ALL_JS_CORE, '!./assets/js/plugins.js', '!./assets/js/audio.js']) // UNTIL AUDIO IS DONE
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(notify({ message: 'jshint complete' }));
});

// watch and compile sass
gulp.task('watch', function(){
    gulp.watch('sass/**/*.scss',['sass']);
});

// compile sass and minify js
gulp.task('build', ['sass', 'js']);

gulp.task('default', ['watch']);