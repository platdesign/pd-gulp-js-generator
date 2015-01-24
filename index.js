'use strict';

var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

var async = require('async');
var glob = require('glob');

var header = require('gulp-header');

var pdGulpBaseTask = require('pd-gulp-base-task');

var path = require('path');

var fs = require('fs');

var gulp = require('gulp');

function addBanner(template) {

	return header(template, {
		pkg: JSON.parse( fs.readFileSync('package.json', 'utf8') ),
		date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	});
}









module.exports = function pdGulpTaskJS(options) {
	var task = pdGulpBaseTask(options);

	task.worker(function(config, callback) {


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
							if(options.use) {
								stream = task.helper.useOnStream(options.use, stream);
							}

							if(task.options.banner) {
								stream = stream.pipe( task.helper.banner(task.options.banner) );
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


		compileJS(config, task.options, callback);
	});

	return task.gulpHandler();
};
