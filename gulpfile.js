const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const pump = require('pump');
const bs = require('browser-sync').create();
const reload = bs.reload;

// Dev tasks
gulp.task('refresh', () => {
  bs.init({
    files: [ './demo/*.html' ],
    server: {
      baseDir: ['./demo', './src']
    },
    notify: false,
    open: false,
    port: 5386
  });

  gulp.watch('./src/measure.js').on('change', reload);
});

gulp.task('dev', ['refresh']);

// Build tasks
gulp.task('copy', () => {
  pump([
    gulp.src('./src/measure.js'),
    gulp.dest('./dist')
  ]);
});

gulp.task('uglify', () => {
  pump([
    gulp.src('./src/measure.js'),
    $.uglify(),
    $.rename({
      suffix: '.min'
    }),
    gulp.dest('./dist')
  ]);
});

gulp.task('build', ['copy', 'uglify']);

// Publish gh pages
gulp.task('ghPages', () => {
  pump([
    gulp.src('./dist/measure.min.js'),
    gulp.dest('./gh-pages')
  ]);
  pump([
    gulp.src('./demo/index.html'),
    gulp.dest('./gh-pages')
  ]);
});
