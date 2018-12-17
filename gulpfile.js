'use strict'

const config = require('./config.json')

const gulp = require('gulp')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const cleanCSS = require('gulp-clean-css')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const browserSync = require('browser-sync').create();

sass.compiler = require('node-sass')

// ==============================================
// Compile sass to css
function compileSass() {
  return gulp.src(config.src.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.dist.css)) 
    .pipe(browserSync.stream());
}

// ==============================================
// Watch sass files for changes
function watchSass() {
  gulp.watch(config.src.sass, compileSass)
}

// ==============================================
// Minify and autoprefix css
function minifyCSS() {
  return gulp.src(config.dist.css + '/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(config.dist.css))
}

// ==============================================
// Transpile ES2015 
function transpileJS() {
  return gulp.src(config.src.js)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('index.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.dist.js))
    .pipe(browserSync.stream());
}

// ==============================================
// Watch js files for changes
function watchJS() {
  gulp.watch(config.src.js, transpileJS)
}

// ==============================================
// Minify js
function minifyJS() {
  return gulp.src(config.dist.js + '/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(config.dist.js))
}

// ==============================================
// Concat vendor js files
// Edit config.src.vendor in config.json file to start
function concatVendor() {
  return gulp.src(config.src.vendor)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(config.dist.vendor))
}

// ==============================================
// Minify js vendor files
function minifyVendor() {
  return gulp.src(config.dist.vendor + '/vendor.js')
    .pipe(uglify())
    .pipe(gulp.dest(config.dist.vendor))
}

// ==============================================
// Minify image files
function minifyImage() {
  return gulp.src('./dist/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/images'))
}

// ==============================================
// Browsersync configuration
function server() {
  browserSync.init({
      server: {
          baseDir: "./dist"
      }
  });

  gulp.watch("./dist/*.html").on('change', browserSync.reload);
}

// ==============================================
// Vendor - run these tasks if needed
exports.concatVendor = concatVendor
exports.minifyVendor = minifyVendor

// ==============================================
// Start development
exports.dev = gulp.parallel(server, watchSass, watchJS)

// ==============================================
// Start production
exports.production = gulp.parallel(gulp.series(compileSass, minifyCSS), gulp.series(transpileJS, minifyJS), minifyImage)
