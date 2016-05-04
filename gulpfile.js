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

// Iterate over components, extract their sample data
// and write everything to the YAML index file

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

gulp.task('sass', function() {

    gulp.src([
        './styles/colors.scss',
        './styles/variables.scss',
        './node_modules/bootstrap/scss/_variables.scss',
        './node_modules/bootstrap/scss/bootstrap.scss',
        './styles/styles.scss',
        './components/**/*.scss',
        './layouts/*.scss',
        './pages/*.scss',
    ])
    .pipe(concat('styles.scss'))
    .pipe(sass({
        includePaths: ['./node_modules/bootstrap/scss']
    }))
    .pipe(gulp.dest('./public/css'));

});

gulp.task('svg', function () {
    return gulp
        .src([
          './node_modules/material-design-icons/**/production/*_24px.svg',
          '!./node_modules/material-design-icons/**/production/ic_rv_hookup_24px.svg'
        ])
        .pipe(svgstore())
        .pipe(rename(function (path) {
            path.basename = 'icons'
        }))
        .pipe(gulp.dest('public/svg'));
});

gulp.task('default', ['components', 'pages', 'sass']);

