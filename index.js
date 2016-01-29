'use strict';

var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var async = require('async');
var glob = require('glob');
var path = require('path');
var gutil = require('gulp-util');
var resolutions = require('browserify-resolutions');
var collapse = require('bundle-collapser/plugin');



var plainJade = require('./lib/transform-plain-jade.js');

var createGenerator = require('pd-gulp-task-generator-generator');

module.exports = createGenerator('Javascript', function() {

	this.init(function(job, compile) {

		glob.sync(job.config.src).forEach(function(filename) {

			filename = path.resolve(process.cwd(), filename);

			var bundler = browserify(job.config.browserify);

			if(job.config.external) {
				bundler.external(job.config.external);
			}

			if(job.config.require) {
				bundler.require(job.config.require);
			}

			// replace douplex modules
			bundler.plugin(resolutions, job.config.resolutions || ['*']);

			// replace relative paths to numbers
			bundler.plugin(collapse);

			// transform jade files to plain jade
			bundler.transform(plainJade);


			bundler.add(filename, { entry: filename });

			if(job.config.watch) {
				bundler = watchify(bundler);

				bundler.on('update', function() {
					compile(job, filename, bundler);
				});
			}

			compile(job, filename, bundler);

		});

	});

	this.compile(function(job, filename, bundler, cb) {
		return bundler
			.bundle()
			.on('error', cb)
			.pipe( source( path.basename(job.config.rename || filename)) )
			.pipe( buffer() )
			.pipe( job.config.uglify ? uglify(job.config.uglify) : gutil.noop() )
			.pipe( this.plugin('banner', job.options) )
			.pipe( this.gulp.dest( job.config.dest ) )

			.on('end', function(err) {
				cb(err);
			});
	});


	this.appendTask('default', {

	});

	this.appendTask('build', {
		uglify: true,
		intreq: true,
		browserify: {

		}
	});

	this.appendTask('watch', {
		watch:true
	});

});



