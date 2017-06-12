var gulp = require('gulp'),
  rootUtils = require("@criticalmanufacturing/dev-tasks/root.main"),
  pluginRunSequence = require('run-sequence'),
  pluginYargs = require('yargs').argv,
  _config = require('./.dev-tasks.json'),
  _packagesPath = './src/packages/', //note the ending /
  _dependenciesPath = './dependencies/',
  _framework = _config.framework,
  //NOTE: order matters in these arrays!
  _dependencies = _config.dependencies,
  _packages = _config.packages,
  _apps = [`${_config.webAppPrefix}.web`],  
  tasks = null,
  applyOps = null;

if (typeof _framework === "string" && _framework !== "") {
  tasks = require("./src/cmf.core/gulpfile.js")(gulp, "cmf.core");
}
_dependencies.forEach(function (dep) {
  require(_dependenciesPath + dep + "/gulpfile.js")(gulp, dep);
});
_packages.forEach(function (pkg) {
  require(_packagesPath + pkg + "/gulpfile.js")(gulp, pkg);
});
require(`./apps/${_config.webAppPrefix}.web/gulpfile.js`)(gulp, `${_config.webAppPrefix}.web`);

applyOps = function (actions) {
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
  
  if(pluginYargs.server) {
    var isWebAppCompilable = true;
    rootUtils.runOperation(__dirname, _dependencies, _framework, _packages, _apps, "build", callback, typeof _framework === "string" && _framework !== "", isWebAppCompilable);

  }else{
    var ops = applyOps('build');

    // On customized projects we would only require to compile the web if the project defined a framework on their own
    var isWebAppCompilable = _config.isWebAppCompilable;
    if (isWebAppCompilable === true) {
      ops = ops.concat(`${_config.webAppPrefix}.web>build`);
    }

    ops = ops.concat(callback);
    pluginRunSequence.apply(this, ops);
  }
  
});

/*
 * Install all
 */
gulp.task('install', function (callback) {

  if(pluginYargs.server) {
    rootUtils.runOperation(__dirname, _dependencies, _framework, _packages, _apps, "install", callback, typeof _framework === "string" && _framework !== "", true);

  }else{
    var ops = applyOps(['install']);

    ops = ops.concat(`${_config.webAppPrefix}.web>install`);

    ops = ops.concat(callback);
    pluginRunSequence.apply(this, ops);
  }
});

/*
 * Install and build apps
 */
gulp.task('apps', function (callback) { pluginRunSequence.apply(this, ['build', `${_config.webAppPrefix}.web>build`, callback]); });

/*
 * start serving the web app
 */
gulp.task('start', function (callback) { pluginRunSequence(`${_config.webAppPrefix}.web>start`); });

/*
 * start running the tests
 */
gulp.task('test', function (callback) { pluginRunSequence(`${_config.webAppPrefix}.web>test`); });

/*
 * clean the workspace
 */
gulp.task('clean', function (callback) { pluginRunSequence.apply(this, applyOps('clean').concat(callback)); })

gulp.task('clean-cmflibs', function (callback) { pluginRunSequence.apply(this, applyOps('clean-cmflibs').concat(callback)); })

gulp.task('purge', function (callback) { pluginRunSequence.apply(this, applyOps('purge').concat(callback)); })

gulp.task('watch', function (callback) { pluginRunSequence.apply(this, applyOps('watch').concat(callback)); });

gulp.task('create-missing-i18n', function (callback) { pluginRunSequence.apply(this, applyOps('create-missing-i18n').concat(callback)); });

gulp.task('ci:publish', function (callback) { pluginRunSequence.apply(this, applyOps('ci:publish').concat(callback)); });