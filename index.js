'use strict';
var through = require('through2'),
  uglify = require('uglify-js'),
  gutil = require('gulp-util'),
  minimatch = require('minimatch'),
  path = require('path'),
  PluginError = gutil.PluginError,
  reSourceMapComment = /\n\/\/# sourceMappingURL=.+?$/,
  pathSeparatorRe = /[\/\\]/g;


function parseExt(ext) {
  var _ext = {};

  if (!ext) {
    _ext = {
      min: "-min.js",
      src: ".js"
    }
  } else if (typeof ext == "string") {
    _ext = {
      min: ext,
      src: ".js"
    }
  } else {
    _ext = {
      min: ext.min || "-min.js",
      src: ext.src || ".js"
    }
  }
  return _ext;
}

module.exports = function(opt) {
  var options = opt || {},
    ext = parseExt(options.ext);

  options.output =  options.output ||  {};  
  function minify(file, encoding, callback) {

    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      return new PluginError('gulp-minify', 'Streaming not supported:' + file.path);
    }

    var ignore = false;

    if (options.exclude) {
      ignore = options.exclude.some(function(item) {
        return path.dirname(file.path).split(pathSeparatorRe).some(function(pathName) {
          return minimatch(pathName, item);
        });
      });
    }

    if (!ignore && options.ignoreFiles) {
      ignore = options.ignoreFiles.some(function(item) {
        return minimatch(path.basename(file.path), item);
      });
    }

    if (ignore || path.extname(file.path) != '.js') {
      this.push(file);
      return;
    }

    var mangled,
      originalSourceMap;

    if (file.sourceMap) {
      options.outSourceMap = file.relative;
      if (file.sourceMap.mappings !== '') {
        options.inSourceMap = file.sourceMap;
      }
      originalSourceMap = file.sourceMap;
    }

    if (options.preserveComments === 'all') {
      options.output.comments = true;
    } else if (options.preserveComments === 'some') {

      options.output.comments = /^!|@preserve|@license|@cc_on/i;
    } else if (typeof options.preserveComments === 'function') {
      options.output.comments = options.preserveComments;
    }
    options.fromString = options.hasOwnProperty("fromString") ? options.fromString : true;

    var min_file = new gutil.File({
      path: file.path.replace(/\.js$/, ext.min),
      base: file.base
    });

    try {
      mangled = uglify.minify(String(file.contents), options);
      min_file.contents = new Buffer(mangled.code.replace(reSourceMapComment, ''));
    } catch (e) {
      return new PluginError('gulp-minify', e.toString());
    }

    if (file.sourceMap) {
      file.sourceMap = JSON.parse(mangled.map);
      file.sourceMap.sourcesContent = originalSourceMap.sourcesContent;
      file.sourceMap.sources = originalSourceMap.sources;
    }

    this.push(min_file);

    if (!options.noSource) {
      file.path = file.path.replace(/\.js$/, ext.src);
      this.push(file);
    }
    callback();
  }

  return through.obj(minify);
};
