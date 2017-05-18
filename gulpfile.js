'use strict';

// Include required modules
const gulp = require('gulp');
const babelify = require('babelify');
const babel = require('gulp-babel');
const browserify = require('browserify');
const connect = require('gulp-connect');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const jsdoc = require('gulp-jsdoc3');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const del = require('del');
const mochaPhantomJS = require('gulp-mocha-phantomjs');

// paths
const NAME = require('./package.json').name;
const DOC_PATH = './src/**/*.js';
const SRC_FILES = DOC_PATH;
const LIB_PATH = './lib';
const LINT_PATH = DOC_PATH;
const BUILD_OUTPUT = './dist';
const DEMOS_OUTPUT = BUILD_OUTPUT + '/demos';
const THEME_PATH = './themes';

// Default task. This will be run when no task is passed in arguments to gulp
gulp.task('default', ['uglify', 'doc']);

// test
gulp.task('test', ['buildTest'], function() {
    return gulp
    .src('test/runner.html')
    .pipe(mochaPhantomJS({
        reporter: 'spec',
        phantomjs: {
            useColors: true,
        },
        }));
});

// clean
gulp.task('clean', function(cb) {
  return del(['dist', 'doc', 'lib'], cb);
});

// lint with eslint
gulp.task('lint', () => {
    return gulp.src([LINT_PATH, '!node_modules/**'])
    .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Copy static files from html folder to dist folder
gulp.task('copyDemos', ['clean', 'lint'], function() {
    return gulp.src('./src/demos/**/*')
    .pipe(gulp.dest(DEMOS_OUTPUT));
});

// Copy themes to dist
gulp.task('copyThemes', ['copyDemos'], function() {
    return gulp.src(THEME_PATH + '/**/*')
    .pipe(gulp.dest(BUILD_OUTPUT + '/themes'));
});

// jsdoc
gulp.task('doc', function(cb) {
    let config = require('./jsdoc.json');
    gulp.src(['README.md', DOC_PATH], {read: false})
        .pipe(jsdoc(config, cb));
});

gulp.task('buildTest', ()=>{
    return browserify({
        entries: ['./test/index.js'],
        debug: true, /* !gulp.env.production,*/
        insertGlobals: true,
    })
    .transform(babelify.configure({presets: ['es2015']}))
    .bundle()
    .pipe(source('test.js'))
    .pipe(gulp.dest('./test'))
    ;
});

// Convert ES6 code in all js files in src/js folder and copy to
// dist folder
gulp.task('build', ['copyThemes'], function() {
    return browserify({
        entries: ['./src/index.js'],
        debug: true, /* !gulp.env.production,*/
        insertGlobals: true,
    })
    .transform(babelify.configure({presets: ['es2015']}))
    .bundle()
    .pipe(source(NAME + '.js'))
    .pipe(gulp.dest(BUILD_OUTPUT))
    ;
});

// Convert ES6 code in all js files in src/js folder and copy to
// dist folder
gulp.task('npmbuild', ['copyThemes'], function() {
    return gulp.src(SRC_FILES)
      .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015'],
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(LIB_PATH));
});

// uglify
gulp.task('uglify', ['build'], ()=> {
  return gulp.src([BUILD_OUTPUT + '/' + NAME + '.js'])
  .pipe(buffer())
  // .pipe(sourcemaps.init())
  .pipe(uglify({
      compress: {
        passes: 10,
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true,
        unsafe: true,
        unsafe_proto: true,
        evaluate: true,
        loops: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        collapse_vars: true,
        reduce_vars: true,
    },
     output: {
       beautify: false,
       semicolons: false,
       quote_style: 1,
     },
     mangle: true}))
  // .pipe(sourcemaps.write(BUILD_OUTPUT))
  .pipe(rename(NAME + '.min.js'))
  .pipe(gulp.dest(BUILD_OUTPUT));
});

// Start a test server with doc root at dist folder and
// listening to 9001 port. Home page = http://localhost:9001
gulp.task('startServer', function() {
    connect.server({
        root: DEMOS_OUTPUT,
        livereload: true,
        port: 9001,
    });
});
