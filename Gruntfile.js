module.exports = function(grunt) {
	grunt.registerMultiTask('compare_css', 'Checks if different CSS-files are equal by content.', function() {
		var pathApi = require('path'),
			fileApi = grunt.file,
			log = grunt.log.writeln,
			src = this.data.src,
			expected = this.data.dest,
			files,
			errors = 0,
			warnings = 0,
			total;

		function compareFiles(srcFilePath, expectedFilePath) {
			var srcFileContent,
				expectedFileContent;

			if (fileApi.exists(expectedFilePath)) {
				srcFileContent = fileApi.read(srcFilePath).replace(/[\r\n\t\s]*/g, '');
				expectedFileContent = fileApi.read(expectedFilePath).replace(/[\r\n\t\s]*/g, '');

				if (srcFileContent === expectedFileContent) {
					log('File ' + srcFilePath.green + ' passed.');
				} else {
					errors += 1;
					log('File ' + expectedFilePath.red + ' failed.');
				}
			} else {
				warnings += 1;
				log('File ' + expectedFilePath.yellow + ' does not exist.');
			}
		}

		function messageInfo(x) {
			return ' ' + x + ' of ' + total + ' compare_css files ';
		}

		if (src && expected) {
			if (fileApi.isFile(src)) {

				total = 1;
				compareFiles(src, expected);

			} else if (fileApi.isDir(src)) {

				files = fileApi.expand({
					cwd: src
				}, '*.css');

				total = files.length;

				files.forEach(function(file) {
					compareFiles(pathApi.join(src, file), pathApi.join(expected, file));
				});

			}

			if (warnings > 0) {
				log(('Warning:' + messageInfo(warnings) + grunt.util.pluralize(warnings, 'is/are') + ' missing.').yellow);
			}

			if (errors > 0) {
				grunt.fail.fatal(messageInfo(errors) + 'failed.');
			}
		}
	});

	grunt.initConfig({
		clean: {
			test: {
				src: ['test/result']
			}
		},
		stylus: {
			options: {
				compress: false,
				paths: ['src/']
			},
			test: {
				files: {
					'test/result/display.css': 'test/cases/display.styl',
					'test/result/font-size.css': 'test/cases/font-size.styl',
					'test/result/positions.css': 'test/cases/positions.styl',
					'test/result/background-image.css': 'test/cases/background-image.styl',
					'test/result/ps-shadows.css': 'test/cases/ps-shadows.styl'
				}
			}
		},
		compare_css: {
			test: {
				src: 'test/result',
				dest: 'test/expected'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('test', ['clean:test', 'stylus:test', 'compare_css:test']);
	grunt.registerTask('default', ['test']);
};