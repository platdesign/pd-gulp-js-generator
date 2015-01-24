'use strict';

var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var async = require('async');
var glob = require('glob');

var header = require('gulp-header');

var pdGulpBaseTask = require('../pd-gulp-base-task');

var path = require('path');

var fs = require('fs');

var gulp = require('gulp');

function addBanner(template) {

	return header(template, {
		pkg: JSON.parse( fs.readFileSync('package.json', 'utf8') ),
		date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	});
}




function compileJS(options, taskOptions, callback) {
	options = options || {};



	var files = glob.sync(options.src);


	var cbtrigger = [];

	files.forEach(function(filename) {

		cbtrigger.push(function(cb) {
			filename = path.resolve(process.cwd(), filename);

			var bundler = browserify(options.browserify);

			bundler.add(filename, { entry: filename });

			if(options.watch) {
				bundler = watchify(bundler);

				bundler.on('update', function() {
					bundle();
				});
			}


			function bundle() {
				console.log('Bundled: '+filename);

				var stream = bundler
					.bundle()
					.pipe( source( path.basename(filename)) )
					.pipe( buffer() );

					if(options.uglify) {
						stream = stream.pipe( uglify(options.uglify) );
					}
					if(taskOptions.banner) {
						stream = stream.pipe( addBanner(taskOptions.banner) );
					}
					if(options.use) {
						stream = options.use.apply(stream, [stream]);
					}

				return stream.pipe( gulp.dest( options.dest ) );
			}

			bundle().on('end', function() {
				cb();
			});
		});



	});
	async.series(cbtrigger, callback);
}




module.exports = function pdGulpTaskJS(options) {
	var task = pdGulpBaseTask(options);

	task.worker(function(config, callback) {
		compileJS(config, task.options, callback);
	});

	return task.gulpHandler();
};
