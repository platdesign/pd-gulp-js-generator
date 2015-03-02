#pd-gulp-js

[pd-gulp](https://github.com/platdesign/pd-gulp) task generator for javascript tasks.

##Install

	npm install --save pd-gulp-js
	
##Example

	var gulp = require('gulp');
	var js = require('pd-gulp-js')(gulp);

	// Register default tasks (default, watch, build, etc.)
	js.register({
		myLib:{
			src: './src/js/*.js',
			dest: './dist/js'
		}
	});

	// Create custom gulp-task
	gulp.task('customJs', js({
		custom: {
			src: './src/js/*.js',
			dest: './dist/js'
		}
	}));


##Options

- `browserify` Configuration object for [browserify](https://github.com/substack/node-browserify)
- `uglify` Configuration object for [gulp-uglify](https://github.com/terinjokes/gulp-uglify)
- `watch` True or path which will be observed.


##Todo
- support hinting/linting