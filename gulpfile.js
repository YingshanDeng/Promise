const gulp = require('gulp')
const $ = require('gulp-load-plugins')()

gulp.task('dist', function () {
  return gulp.src(['src/promise.js', 'src/promise-adapter.js'])
    .pipe($.babel({
      presets: ['es2015'],
      plugins: ['add-module-exports', 'transform-es2015-modules-umd']
    }))
    .pipe($.uglify())
    .pipe(gulp.dest('dist/'))
})
