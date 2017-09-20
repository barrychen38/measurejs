const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const pump = require('pump');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

// Dev tasks
gulp.task('browserify', () => {
	pump([
		browserify({
			entries: './src/index.js',
			debug: false
		}).bundle(),
		source('measure.js'),
		buffer(),
		gulp.dest('./tmp'),
		browserSync.stream()
	]);
});

gulp.task('refresh', () => {
	browserSync.init({
		// You can change the PORT in your local
		'proxy': 'http://127.0.0.1:3838/',
		'notify': false,
		'port': 5386
	});
	gulp.watch(['./src/**/*.js', './src/*.js'], ['browserify']);
	gulp.watch('demo/index.html').on('change', reload);
});

gulp.task('dev', ['browserify', 'refresh']);

// Build tasks
gulp.task('copy', () => {
	pump([
		gulp.src('./tmp/measure.js'),
		gulp.dest('./dist')
	]);
});

gulp.task('uglify', () => {
	pump([
		gulp.src('./tmp/measure.js'),
		$.uglify(),
		$.rename({
			suffix: '.min'
		}),
		gulp.dest('./dist')
	]);
});

gulp.task('build', ['copy', 'uglify']);
