'use strict';

// Include required modules
const gulp = require('gulp');
// const inject = require('gulp-inject');
const babelify = require('babelify');
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
// const mocha = require('gulp-mocha');
const mochaPhantomJS = require('gulp-mocha-phantomjs');
// const istanbulReport = require('gulp-istanbul-report');
// const istanbul = require('gulp-istanbul');
// const isparta = require('isparta');

// paths
const NAME = require('./package.json').name;
const DOC_PATH = './src/**/*.js';
const LINT_PATH = DOC_PATH;
const BUILD_OUTPUT = './dist';
const DEMOS_OUTPUT = BUILD_OUTPUT + '/demos';
const THEME_PATH = './themes';
// const COVERAGE_FILE = './test/coverage/coverage.json';
// const TEST_PATH = './test/**/*.js';

// Default task. This will be run when no task is passed in arguments to gulp
gulp.task('default', ['uglify', 'doc']);

// gulp.task('test', ['uglify'], ()=>
//   gulp.src(['./test/**/*.js'], {read: false})
//   .pipe(mocha({reporter: 'spec', compilers: 'js:babel-core/register'}))
// );
//

// let paths = {
// 	javascript: ['./test/coverage/**/*.js'],
// 	tests: ['./test/**/*.js'],
// };

// gulp.task('inject', ['instrument'], function(cb) {
// 	return gulp.src('./test/runner.html')
// 		// .pipe(inject(
// 		// 	gulp.src(paths.javascript, {read: false}), {
// 		// 		relative: true,
//     //             starttag: '<!-- inject:js -->',
// 		// 	}))
// 		.pipe(inject(
// 			gulp.src(paths.tests, {read: false}), {
// 				relative: true,
// 				starttag: '<!-- inject:tests:js -->',
// 			}))
// 		.pipe(gulp.dest('./test/coverage/'));
// });

// gulp.task('instrument', ['buildTest'], function() {
// 	return gulp.src(['./src/**/*.js'])
// 	// Covering files
// 		.pipe(istanbul({
//             instrumenter: isparta.Instrumenter,
//             includeUntested: true,
// 			coverageVariable: '__coverage__',
// 		}))
//         // .pipe(istanbul.hookRequire());
// 		// instrumented files will go here
// 		.pipe(gulp.dest('./test/coverage/'));
// });

// test
gulp.task('test', ['buildTest'], function() {
    return gulp
    .src('test/runner.html')
    .pipe(mochaPhantomJS({reporter: 'spec', /* dump: './test/test.log',*/
      phantomjs: {
        useColors: true,
        hooks: 'mocha-phantomjs-istanbul',
        coverageFile: ' ./test/coverage/coverage.json',
    }}));
    //   .on('finish', function() {
    //   gulp.src('./test/coverage/coverage.json')
    //     .pipe(istanbulReport({
    //         reporterOpts: {
    //           dir: './test/coverage',
    //         },
    //         reporters: [
    //           'text',
    //           'text-summary',
    //           'html',
    //         ],
    //     }));
    //   });
});

// clean
gulp.task('clean', function(cb) {
  return del(['dist', 'doc'], cb);
});

// lint with eslint
gulp.task('lint', () => {
    return gulp.src([LINT_PATH, '!node_modules/**'])
    .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
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

// gulp.task('buildTestCoverage', ()=>{
//     return browserify({
//         entries: ['./test/index.js'],
//         debug: true, /* !gulp.env.production,*/
//         insertGlobals: true,
//     })
//     .transform(babelify.configure({presets: ['es2015']}))
//     .transform(istanbul)
//     .bundle()
//     .pipe(source('test.js'))
//     .pipe(gulp.dest('./test'))
//     ;
// });

// Convert ES6 code in all js files in src/js folder and copy to
// dist folder as bundle.js
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

// uglify
gulp.task('uglify', ['build'], ()=> {
  return gulp.src([BUILD_OUTPUT + '/' + NAME + '.js'])
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .pipe(sourcemaps.write(BUILD_OUTPUT))
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
