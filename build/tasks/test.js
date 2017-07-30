var gulp = require('gulp');
var debug = require('gulp-debug');
var ts = require('gulp-typescript');
var debug =  require('debug');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var mapSources = require('@gulp-sourcemaps/map-sources');
var paths = require('../paths');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
  return gulp.src([paths.output + '**/*.spec.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec',
      timeout: 90000,
    }));
});