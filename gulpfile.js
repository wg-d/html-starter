var gulp = require('gulp');
var pluginRunSequence = require('run-sequence');
var pluginYargs = require('yargs').argv;

var _packagesPath = './src/packages/'; //note the ending /
var _dependenciesPath = './dependencies/';

//NOTE: order matters in these arrays!
var _dependencies = ['cmf.core.multicast.client', 'cmf.style', 'cmf.style.dark.blue', 'cmf.style.light.blue', 'cmf.style.blue', 'cmf.style.blue.grey'];
var _packages = ["cmf.core.controls","cmf.core.business.controls","cmf.core.dashboards","cmf.core.admin.host","cmf.core.shell","cmf.core.checklist","cmf.core.documents","cmf.core.fablive","cmf.core.examples"];
var _web = './apps/cmf.core.web';
var _framework = 'cmf.core';

if (typeof _framework === "string" && _framework !== "") {
  var tasks = require("./src/cmf.core/gulpfile.js")(gulp, "cmf.core");
}

_dependencies.forEach(function (dep) {
  require(_dependenciesPath + dep + "/gulpfile.js")(gulp, dep);
});
_packages.forEach(function (pkg) {
  require(_packagesPath + pkg + "/gulpfile.js")(gulp, pkg);
});
require(_web + '/gulpfile.js')(gulp, "cmf.core.web");

var applyOps = function (actions) {
  if (!Array.isArray(actions)) { actions = [actions]; }
  var operations = [];
  var dependencyOperations = [];
  var packageOperations = [];
  _dependencies.forEach(function (dep) {
    actions.forEach(function (action) {
      operations.push(dep + ">" + action);
    });
  });


  actions.forEach(function (action) {
    if (typeof _framework === "string" && _framework !== "") {
      operations.push(_framework+ '>' + action);
    }
    
  })

  _packages.forEach(function (mod) {
    actions.forEach(function (action) {
      operations.push(mod + ">" + action)
    });
  });
  
  return operations;
};

/*
 * Build all
 */
gulp.task('build', function(callback) { 
  
  var ops = applyOps('build');

  // On customized projects we would only require to compile the web if the project defined a framework on their own
  var isWebAppCompilable = true;
  if (isWebAppCompilable === true) {
    ops = ops.concat('cmf.core.web>build');
  }

  ops = ops.concat(callback);
  pluginRunSequence.apply(this, ops);
  
});

/*
 * Install all
 */
gulp.task('install', function (callback) {

  var ops = applyOps(['install']);

  ops = ops.concat('cmf.core.web>install');

  ops = ops.concat(callback);
  pluginRunSequence.apply(this, ops);
});

/*
 * Install and build apps
 */
gulp.task('apps', function (callback) { pluginRunSequence.apply(this, ['build', 'cmf.core.web>build', callback]); });

/*
 * start serving the web app
 */
gulp.task('start', function (callback) { pluginRunSequence('cmf.core.web>start'); });

/*
 * start running the tests
 */
gulp.task('test', function (callback) { pluginRunSequence('cmf.core.web>test'); });

/*
 * clean the workspace
 */
gulp.task('clean', function (callback) { pluginRunSequence.apply(this, applyOps('clean').concat(callback)); })

gulp.task('clean-cmflibs', function (callback) { pluginRunSequence.apply(this, applyOps('clean-cmflibs').concat(callback)); })

gulp.task('purge', function (callback) { pluginRunSequence.apply(this, applyOps('purge').concat(callback)); })

gulp.task('watch', function (callback) { pluginRunSequence.apply(this, applyOps('watch').concat(callback)); });