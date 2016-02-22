var path = require('path');
var fs = require('fs');

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var swig = require('gulp-swig');
var data = require('gulp-data');
var tap = require('gulp-tap');
var rename = require('gulp-rename');
var yaml = require('js-yaml');
var svgstore = require('gulp-svgstore');

gulp.task('svg', function () {
    return gulp
        .src('svg/*.svg')
        .pipe(svgstore())
        .pipe(rename(function (path) {
            path.basename = 'icons'
        }))
        .pipe(gulp.dest('public/svg'));
});

gulp.task('sass', function() {

    gulp.src([
        './styles/colors.scss',
        './styles/variables.scss',
        './node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss',
        './components/**/*.scss',
        './layouts/*.scss',
    ])
    .pipe(concat('styles.scss'))
    .pipe(sass({
        includePaths: ['./node_modules/bootstrap-sass/assets/stylesheets']
    }))
    .pipe(gulp.dest('./public/css'));

});

var getComponentData = function(file) {

  data = yaml.safeLoad(fs.readFileSync(file.path.replace('.html', '.yaml'), 'utf8'))
  name = path.basename(file.path, '.html')
  
  sample = {}
  sample[name] = data.data ? data.data : {}
  
  return {
    name: name,
    title: data.title ? data.title : '',
    desc: data.desc ? data.desc : '',
    data: data.data ? data.data : {},
    sample: data.data ? yaml.safeDump(sample) : ''
  }

};


getPageData = function(file) {

  return yaml.safeLoad(fs.readFileSync(file.path.replace('.html', '.yaml'), 'utf8'))

};

gulp.task('components', function() {
  files = []
  return gulp.src('./components/**/*.html')
    .pipe(data(getComponentData))
    .pipe(tap(function(file) {
      file.data.path = '../components/' + path.basename(file.path, '.html') + '/' + path.basename(file.path),
      files.push(file.data)  
     }))
    .on('end', function() {  
      fs.writeFileSync('./pages/index.yaml', yaml.safeDump({files: files}));
    })
});

gulp.task('pages', function() {
  return gulp.src('./pages/*.html')
    .pipe(data(getPageData))
    .pipe(swig())
    .pipe(gulp.dest('public'));
});

gulp.task('default', ['sass', 'svg', 'components', 'pages']);

