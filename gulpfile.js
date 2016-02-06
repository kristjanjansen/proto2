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

gulp.task('sass', function() {

    gulp.src([
        './styles/*.scss',
        './components/*.scss',
        './pages/*.scss',
    ])
    .pipe(concat('styles.scss'))
    .pipe(sass({
        includePaths: []
    }))
    .pipe(gulp.dest('./public/css'));

});

var getYamlData = function(file) {
  name = path.basename(file.path, '.html')
  filepath = path.dirname(file.path).split('/').slice(-1)[0] + '/' +  name + '.yaml'
  data = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
  
  if (data.data) {
    sample = {}
    sample[name] = data.data ? data.data : {}
    return {
      name: name,
      title: data.title ? data.title : '',
      desc: data.desc ? data.desc : '',
      data: data.data ? data.data : {},
      sample: data.data ? yaml.safeDump(sample) : ''
    }
  } 

  return data
};
 
gulp.task('pages', function() {
  return gulp.src('./pages/*.html')
    .pipe(data(getYamlData))
    .pipe(swig())
    .pipe(gulp.dest('public'));
});

gulp.task('components', function() {
  files = []
  return gulp.src('./components/*.html')
    .pipe(data(getYamlData))
    .pipe(tap(function(file) {
      file.data.path = '../components/' + path.basename(file.path),
      files.push(file.data)  
     }))
    .on('end', function() {  
      fs.writeFileSync('./pages/index.yaml', yaml.safeDump({files: files}));
    })
});

