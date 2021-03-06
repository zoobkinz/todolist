const autoprefixer = require('gulp-autoprefixer')
const gulp = require('gulp')
const named = require('vinyl-named')
const path = require('path')
const plumber = require('gulp-plumber')
const stylus = require('gulp-stylus')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack/webpack.config')

const DEBUG = process.env.NODE_ENV !== 'production'

function end(done, debug = DEBUG) {
    return function () {
        if (!done.called && debug) {
            done.called = true
            done.call()
        }
    }
}

gulp.task('app', done => {
    return gulp.src('src/index.js')
        .pipe(named())
        .pipe(plumber())
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest(path.join('dist', 'js')))
        .on('data', end(done, DEBUG))
})

gulp.task('assets', () => {
    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest('dist'))
})

gulp.task('stylus', () => {
    return gulp.src('src/stylus/base.styl')
        .pipe(plumber())
        .pipe(stylus({
            'include css': true,
            compress: !DEBUG,
            include: [
                path.resolve(__dirname, 'src/app/stylus'),
                path.resolve(__dirname, 'node_modules')
            ]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(path.join('dist', 'css')))
})

gulp.task('build', ['app', 'assets', 'stylus'], () => {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('dist'))
})

gulp.task('watch', () => {
    gulp.watch('src/assets/**/*', ['assets'])
    gulp.watch('src/**/*.styl', ['stylus'])
})

gulp.task('dev', ['build', 'watch'], () => {
    require('gulp-nodemon')({
        script: './index.js',
        ignore: [
            'dist/',
            'node_modules/',
            'src/'
        ]
    })
})
