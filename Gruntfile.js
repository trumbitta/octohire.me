module.exports = function(grunt) {

  'use strict';

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    exec: {
      bower_install: 'bower cache clean --config.interactive=false && bower install --config.interactive=false'
    },

    wiredep: {
      app: {
        src: ['<%= pkg.appPath %>/index.html'],
        ignorePath:  /\.\.\//,
        exclude: [
          'bower_components/bootstrap/dist/css/bootstrap.css',
          'bower_components/bootstrap/dist/js/bootstrap.js'
        ]
      }
    },

    'customize-bootstrap': {
      app: {
        options: {
          bootstrapPath: 'bower_components/bootstrap',
          src: '<%= pkg.appPath %>/assets/less/bootstrap/overrides',
          dest: '<%= pkg.buildPathDev %>/less/bootstrap/custom'
        }
      }
    },

    less: {
      app: {
        files: {
          '<%= pkg.buildPathDev %>/css/app-custom.css': '<%= pkg.appPath %>/assets/less/app-custom.less'
        }
      },
      bootstrap: {
        files: {
          '<%= pkg.buildPathDev %>/css/bootstrap.css': '<%= pkg.buildPathDev %>/less/bootstrap/custom/bootstrap.less'
        }
      }
    },

    clean: {
      build: {
        src: [
          '<%= pkg.buildPathDev %>/**/*',
          '<%= pkg.buildPathDist %>/**/*'
        ]
      },
      dist: {
        src: [
        '<%= pkg.distPath %>/**/*'
        ]
      }
    },

    copy: {
      dev_index: {
        src: '<%= pkg.appPath %>/index.html',
        dest: '<%= pkg.buildPathDev %>/index.html'
      },
      dev_glyphicons: {
        expand: true,
        cwd: 'bower_components/bootstrap',
        src: 'fonts/**',
        dest: '<%= pkg.buildPathDev %>/'
      },
      dev_images: {
        expand: true,
        cwd: '<%= pkg.appPath %>/assets',
        src: 'images/**',
        dest: '<%= pkg.buildPathDev %>/'
      },
      dist_prepare: {
        expand: true,
        cwd: '<%= pkg.buildPathDev %>',
        src: '**',
        dest: '<%= pkg.buildPathDist %>/'
      },
      dist_update_html: {
        expand: true,
        cwd: '<%= pkg.buildPathDev %>',
        src: 'index.html',
        dest: '<%= pkg.distPath %>/'
      },
      dist_update_fonts: {
        expand: true,
        cwd: '<%= pkg.buildPathDev %>',
        src: 'fonts/**',
        dest: '<%= pkg.distPath %>/'
      },
      dist_update_images: {
        expand: true,
        cwd: '<%= pkg.buildPathDev %>',
        src: 'images/**',
        dest: '<%= pkg.distPath %>/'
      },
      dist_update_fontawesome: {
        expand: true,
        cwd: '<%= pkg.appPath %>/bower_components/fontawesome',
        src: 'fonts/**',
        dest: '<%= pkg.distPath %>/'
      }
    },

    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      index: {
        files: ['index.html'],
        tasks: ['copy:dev_index'],
        options: {
          livereload: true
        }
      },
      lessApp: {
        files: ['<%= pkg.appPath %>/assets/less/*.less'],
        tasks: ['less:app'],
        options: {
          livereload: true
        }
      },
      lessBootstrap: {
        files: ['<%= pkg.appPath %>/assets/less/bootstrap/**/*.less'],
        tasks: ['less'], // my own app-custom.less includes bootstrap variables
        options: {
          livereload: true
        }
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          '<%= pkg.appPath %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    connect: {
      dev: {
        options: {
          port: 9001,
          base: ['<%= pkg.buildPathDev %>', '<%= pkg.appPath %>']
        }
      }
    },

    useminPrepare: {
      build: {
        src: ['<%= pkg.buildPathDist %>/index.html'],
        dest: '<%= pkg.buildPathDist %>'
      },
      options: {
        flow: {
          steps: { css: ['concat', 'cssmin'] },
          post: {
            css: [{
              name: 'concat',
              createConfig: function(context) {
                var generated = context.options.generated;
                generated.options = {
                  stripBanners: { block: true },
                  separator: '\n'
                };
              }
            }]
          }
        }
      }
    },

    filerev: {
      css: {
        src: '<%= pkg.distPath %>/styles/**/*.css'
      }
    },

    usemin: {
      html: ['<%= pkg.distPath %>/index.html']
    }

  });

  grunt.registerTask('build', [
    'exec',
    'clean:build',
    'wiredep',
    'customize-bootstrap:app',
    'less',
    'copy:dev_index',
    'copy:dev_glyphicons',
    'copy:dev_images'
  ]);

  grunt.registerTask('dist', [
    'clean:dist',
    'build',
    'copy:dist_prepare',
    'useminPrepare',
    'cssmin:generated',
    'filerev',
    'copy:dist_update_html',
    'copy:dist_update_fonts',
    'copy:dist_update_fontawesome',
    'copy:dist_update_images',
    'usemin'
  ]);

  grunt.registerTask('dev', [
    'build',
    'connect:dev',
    'watch'
  ]);

  grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
    if (target === 'dist') {
      return grunt.log.warn('The `serve:dist` target is currently unavailable.\nUse `grunt dist` to build a new dist into the `dist` folder, then serve it as you prefer.');
      // return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'dev'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

};
