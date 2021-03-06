/*
 * grunt-templates2js
 * https://github.com/jeanpylone/grunt-templates2js
 *
 * Copyright (c) 2014 Jean-Philippe Schneider
 * Licensed under the MIT license.
 *
 * Fork from:
 *
 * grunt-html-convert
 * https://github.com/soundstep/grunt-html-convert
 *
 * Copyright (c) 2013 Romuald Quantin
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var path = require('path');
  var minify = require('html-minifier');

  var escapeContent = function(content, quoteChar, indentString, indentGlobal) {
    var bsRegexp = new RegExp('\\\\', 'g');
    var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
    var nlReplace = '\\n' + quoteChar + ' +\n' + indentGlobal + indentString + quoteChar;
    return content.replace(bsRegexp, '\\\\').replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
  };

  // convert Windows file separator URL path separator
  var normalizePath = function(p) {
    if ( path.sep !== '/' ) {
      p = p.replace(/\\/g, '/');
    }
    return p;
  };

  // Warn on and remove invalid source files (if nonull was set).
  var existsFilter = function(filepath) {

    if (!grunt.file.exists(filepath)) {
      grunt.log.warn('Source file "' + filepath + '" not found.');
      return false;
    } else {
      return true;
    }
  };

var camelCased = function(str) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
};

  // compile a template to an angular module
  var compileTemplate = function(targetModule, moduleName, filepath, quoteChar, indentString, indentGlobal, options) {
    var content = grunt.file.read(filepath);
    
    // Process files as templates if requested.
    var process = options.process;
    if (typeof process === "function") {
      content = process(content, filepath);
    } else if (process) {
      if (process === true) {
        process = {};
      }
      content = grunt.template.process(content, process);
    }

    if (Object.keys(options.htmlmin).length) {
      try {
        content = minify(content, options.htmlmin);
      } catch (err) {
        grunt.warn(filepath + '\n' + err);
      }
    }
    content = escapeContent(content, quoteChar, indentString, indentGlobal);

    var module = indentGlobal + camelCased(targetModule) + '[' + quoteChar + moduleName +
      quoteChar + '] = ' + quoteChar +  content +
       quoteChar + ';\n';

    return module;
  };

  // compile a template to an angular module
  var compileCoffeeTemplate = function(targetModule, moduleName, filepath, quoteChar, indentString, indentGlobal) {
    var content = escapeContent(grunt.file.read(filepath), quoteChar, indentString);
    var doubleIndent = indentString + indentString;

    var module = indentGlobal + camelCased(targetModule) + '[' + quoteChar + moduleName +
      quoteChar + '] = ' + quoteChar + content +
      quoteChar + '\n';

    return module;
  };

  grunt.registerMultiTask('templates2js', 'Compiles html templates to JavaScript.', function() {

    var options = this.options({
      base: 'src',
      module: this.target,
      quoteChar: '"',
      fileHeaderString: '',
      indentString: '   ',
      indentGlobal: '',
      target: 'js',
      htmlmin: {},
      process: false,
      prefix: '',
      suffix: ''
    });

    // generate a separate module
    this.files.forEach(function(f) {

      // f.dest must be a string or write will fail

      var targetModule = f.module || options.module;
      var moduleNames = [];

      var modules = f.src.filter(existsFilter).map(function(filepath) {

        var moduleName = normalizePath(path.relative(options.base, filepath));
        if(grunt.util.kindOf(options.rename) === 'function') {
          moduleName = options.rename(moduleName);
        }
        moduleNames.push("'" + moduleName + "'");
        if (options.target === 'js') {
          return compileTemplate(targetModule, moduleName, filepath, options.quoteChar, options.indentString, options.indentGlobal, options);
        } else if (options.target === 'coffee') {
          return compileCoffeeTemplate(targetModule, moduleName, filepath, options.quoteChar, options.indentString, options.indentGlobal);
        } else {
          grunt.fail.fatal('Unknow target "' + options.target + '" specified');
        }

      }).join(grunt.util.normalizelf('\n'));

      var bundle = "";
      var fileHeader = options.fileHeaderString !== '' ? options.fileHeaderString + '\n' : '';
      //Allow a 'no targetModule if module is null' option
      if (targetModule) {
        bundle += options.indentGlobal;
        if (options.target === 'js') {
          bundle += 'var ';
        }
        bundle += camelCased(targetModule) + " = {}";
        if (options.target === 'js') {
          bundle += ';';
        }

        bundle += "\n\n";
      }
      var prefix = options.prefix || '';
      var suffix = options.suffix || '';

      grunt.file.write(f.dest, fileHeader + prefix + bundle + modules + suffix);
    });
    //Just have one output, so if we making thirty files it only does one line
    grunt.log.writeln("Successfully converted "+(""+this.files.length).green +
                      " html templates to " + options.target + ".");
  });
};
