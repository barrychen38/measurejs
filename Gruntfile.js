module.exports = function(grunt) {
	
	require('load-grunt-tasks')(grunt);

	require('time-grunt')(grunt);

	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),
		
		copy: {
			main: {
				expand: true,
				cwd: 'test',
				src: ['**'],
				dest: 'dist/',
				filter: 'isFile'
			}
		},
		uglify: {
			build: {
				src: 'test/measure.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			},
			options: {
				banner: '/*! <%= pkg.name %>.min.js v<%= pkg.version %> | <%= pkg.author %> */\n'
			}
		},
		jshint: {
			build: ['test/measure.js'],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		watch: {
			scripts: {
				files: ['test/measure.js'],
				tasks: ['jshint', 'uglify'],
				options: {
					spawn: false
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	grunt.registerTask('default', ['watch', 'copy', 'uglify', 'jshint']);
};
