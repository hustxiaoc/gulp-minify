'use strict';
const assert = require('assert');
const fs = require('fs');
const gulp = require('gulp');
const path = require('path');
const minify = require('../');
const rimraf = require('rimraf');
const fixtures = path.join(__dirname, 'fixtures');
const build = path.join(__dirname, 'build');

function run(project, options) {
  return gulp.src(`${fixtures}/${project}/**/*js`).pipe(minify(options)).pipe(gulp.dest(`${build}/${project}`));
}
describe('test/minifier.test.js', () => {
  before(() => {
    rimraf.sync(build);
  });

  after(() => {
    rimraf.sync(build);
  });

  it('should minify ok', (done) => {
    const project = 'demo1';
    run(project).on('end', () => {
      const buildPath = `${build}/${project}`;
      assert(fs.existsSync(path.join(buildPath, 'index.js')));
      assert(fs.existsSync(path.join(buildPath, 'index-min.js')));
      done();
    });
  });

  it('should noSource work ok', (done) => {
    const project = 'demo2';
    run(project, {noSource: true}).on('end', () => {
      const buildPath = `${build}/${project}`;
      assert(fs.existsSync(path.join(buildPath, 'index.js')) === false);
      assert(fs.existsSync(path.join(buildPath, 'index-min.js')));
      done();
    });
  });

  it('should ext work ok', (done) => {
    const project = 'demo3';
    run(project, {
      ext:{
        src:'-debug.js',
        min:'-min.js'
      },
    }).on('end', () => {
      const buildPath = `${build}/${project}`;
      assert(fs.existsSync(path.join(buildPath, 'index-debug.js')));
      assert(fs.existsSync(path.join(buildPath, 'index-min.js')));
      done();
    });
  });

  it('should exclude work ok', (done) => {
    const project = 'demo4';
    run(project, {
      exclude: ['exclude']
    }).on('end', () => {
      const buildPath = `${build}/${project}`;
      assert(fs.existsSync(path.join(buildPath, 'exclude/test.js')));
      assert(fs.existsSync(path.join(buildPath, 'exclude/test-min.js')) === false);
      assert(fs.existsSync(path.join(buildPath, 'index.js')));
      assert(fs.existsSync(path.join(buildPath, 'index-min.js')));
      assert(fs.existsSync(path.join(buildPath, 'ignore.js')));
      assert(fs.existsSync(path.join(buildPath, 'ignore-min.js')));
      done();
    });
  });

  it('should ignoreFiles work ok', (done) => {
    const project = 'demo5';
    run(project, {
      ignoreFiles: ['ignore.js'],
    }).on('end', () => {
      const buildPath = `${build}/${project}`;
      assert(fs.existsSync(path.join(buildPath, 'exclude/test.js')));
      assert(fs.existsSync(path.join(buildPath, 'exclude/test-min.js')));
      assert(fs.existsSync(path.join(buildPath, 'index.js')));
      assert(fs.existsSync(path.join(buildPath, 'index-min.js')));
      assert(fs.existsSync(path.join(buildPath, 'ignore.js')));
      assert(fs.existsSync(path.join(buildPath, 'ignore-min.js')) === false);
      done();
    });
  });

  it('should minify .mjs files alongside .js files', (done) => {
    const project = 'demo6';
    run(project).on('end', () => {
      const buildPath = `${build}/${project}`;
      assert(fs.existsSync(path.join(buildPath, 'index.js')));
      assert(fs.existsSync(path.join(buildPath, 'index-min.js')));
      assert(fs.existsSync(path.join(buildPath, 'index.mjs')));
      assert(fs.existsSync(path.join(buildPath, 'index-min.mjs')));
      done();
    });
  });

});
