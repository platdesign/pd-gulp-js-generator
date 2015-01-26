'use strict';

var gulp = require('gulp');



var js = require('../../')(gulp);


// Register default Tasks
js.register({
	options:{
		banner: '/* <%=pkg.name %> HUHU */\n',
	},
	lib: {
		src: './src/*.js',
		dest: './dist/js'
	},
	qwe: {
		src: './src/lib/*.js',
		dest: './dist/js'
	}
});


// Create custom task
gulp.task('custom', js({
	testingJade: {
		src: './src/*.js',
		dest: './dist/js/custom'
	}
}));


gulp.task('test', ['default', 'build', 'watch', 'custom']);
