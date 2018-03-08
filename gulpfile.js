var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var sequence = require('run-sequence');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var rev = require('gulp-rev');

var browserify = require('browserify');
var uglify = require('gulp-uglify');

function errorHandler(err) {
  gutil.log(gutil.colors.red(err.message));
  this.emit('end');
}

// --------------------------
// config
// --------------------------
var config = {
  dirs: {
    tmp: '.tmp',
    release: 'dist'
  },
  app: {
    assets: {
      files: [
        '**/*'
      ],
      opts: {
        cwd: 'src/assets',
        base: 'src/assets'
      }
    }
  },
  vendor: {
    js: [
      'store',
      'crosstab',
      'reqwest',
      'reflux',
      'vue',
      'iscroll'
    ],
    css: {
      files: [
        'fontawesome/css/font-awesome.css'
      ],
      opts: {
        cwd: 'vendor',
        base: 'vendor'
      }
    },
    assets: {
      files: [
        'fontawesome/fonts/**/*'
      ],
      opts: {
        cwd: 'vendor',
        base: 'vendor'
      }
    }
  }
};

// --------------------------
// urls
// --------------------------
var map = require('gulp-map');

var urls = {
  app: {
    js: {
      files: [],
      opts: {}
    },
    css: {
      files: [],
      opts: {}
    }
  },
  vendor: {
    js: {
      files: [],
      opts: {}
    },
    css: {
      files: [],
      opts: {}
    }
  },
  demo: {
    js: {
      files: [],
      opts: {}
    },
    css: {
      files: [],
      opts: {}
    }
  }
};

function storeUrls(obj, cwd, base) {
  obj.files = [];
  obj.opts = {
    cwd: cwd,
    base: base,
    read: false
  };

  return map(function(file) {
    obj.files.push(base + '/' + file.relative);
    return file;
  });
}

// --------------------------
// app / js
// --------------------------
function appBundler() {
  var bundler = browserify({
    entries: [
      './src/app/app.js'
    ],
    transform: [],
    debug: true,
    cache: {},
    packageCache: {},
    standalone: 'ml'
  });

  bundler.external(config.vendor.js);

  return bundler;
}

function makeAppJs(bundler, useRev) {
  useRev = !!useRev;

  var stream = bundler.bundle()
    .pipe(source('app.js'))
    .pipe(buffer());

  if (useRev) {
    stream = stream.pipe(rev());
  }

  return stream
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'));
}

gulp.task('app:js:dev', function() {
  var cwd = config.dirs.tmp;
  var base = 'app/js';
  var dest = cwd + '/' + base;

  del.sync(dest);

  return makeAppJs(appBundler(true))
    .pipe(gulp.dest(dest))
    .pipe(filter('*.js'))
    .pipe(storeUrls(urls.app.js, cwd, base));
});

gulp.task('app:js:release', function() {
  var cwd = config.dirs.release;
  var base = 'app/js';
  var dest = cwd + '/' + base;

  del.sync(dest);

  return makeAppJs(appBundler(false), true)
    .pipe(gulp.dest(dest))
    .pipe(filter('*.js'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dest))
    .pipe(storeUrls(urls.app.js, cwd, base));
});

// --------------------------
// app / css
// --------------------------
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

function makeAppCss(useRev) {
  useRev = !!useRev;

  var files = [
    './src/styles/app.less'
  ];

  var stream = gulp.src(files)
    .pipe(sourcemaps.init())
    .pipe(less())
    .on('error', errorHandler)
    .pipe(autoprefixer());

  if (useRev) {
    stream = stream.pipe(rev());
  }

  return stream.pipe(sourcemaps.write('./'));
}

gulp.task('app:css:dev', function() {
  var cwd = config.dirs.tmp;
  var base = 'app/css';
  var dest = cwd + '/' + base;

  del.sync(dest);

  return makeAppCss(false)
    .pipe(gulp.dest(dest))
    .pipe(filter('*.css'))
    .pipe(storeUrls(urls.app.css, cwd, base));
});

gulp.task('app:css:release', function() {
  var cwd = config.dirs.release;
  var base = 'app/css';
  var dest = cwd + '/' + base;

  del.sync(dest);

  return makeAppCss(true)
    .pipe(gulp.dest(dest))
    .pipe(filter('*.css'))
    .pipe(minifyCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dest))
    .pipe(storeUrls(urls.app.css, cwd, base));
});

// --------------------------
// app / assets
// --------------------------
function appAssets(cwd) {
  var dest = cwd + '/app/assets';

  del.sync(dest);

  return gulp.src(config.app.assets.files, config.app.assets.opts)
    .pipe(gulp.dest(dest));
}

gulp.task('app:assets:dev', function() {
  return appAssets(config.dirs.tmp);
});

gulp.task('app:assets:release', function() {
  return appAssets(config.dirs.release);
});

// --------------------------
// vendor / js
// --------------------------
function vendorBundler() {
  return browserify({
    require: config.vendor.js,
    cache: {},
    packageCache: {}
  });
}

function makeVendorJs(bundler, useRev) {
  useRev = !!useRev;

  var stream = bundler.bundle()
    .pipe(source('vendor.js'))
    .pipe(buffer());

  if (useRev) {
    stream = stream.pipe(rev());
  }

  return stream
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'));
}

gulp.task('vendor:js:dev', function() {
  var cwd = config.dirs.tmp;
  var base = 'vendor/js';
  var dest = cwd + '/' + base;

  del.sync(dest);

  return makeVendorJs(vendorBundler(true))
    .pipe(gulp.dest(dest))
    .pipe(storeUrls(urls.vendor.js, cwd, base));
});

gulp.task('vendor:js:release', function() {
  var cwd = config.dirs.release;
  var base = 'vendor/js';
  var dest = cwd + '/' + base;

  del.sync(dest);

  return makeVendorJs(vendorBundler(false), true)
    .pipe(gulp.dest(dest))
    .pipe(filter('*.js'))
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dest))
    .pipe(storeUrls(urls.vendor.js, cwd, base));
});

// --------------------------
// vendor / css
// --------------------------
var rebaseUrls = require('gulp-css-rebase-urls');
var flatten = require('gulp-flatten');
var urlAdjuster = require('gulp-css-url-adjuster');
var concat = require('gulp-concat');

function makeVendorCss(dest, useRev) {
  useRev = !!useRev;

  del.sync(dest);

  var stream = gulp.src(config.vendor.css.files, config.vendor.css.opts)
    .pipe(rebaseUrls())
    .pipe(flatten())
    .pipe(urlAdjuster({
      prependRelative: '../assets/'
    }))
    .pipe(concat('vendor.css'));

  if (useRev) {
    return stream.pipe(rev());
  }

  return stream;
}

gulp.task('vendor:css:dev', function() {
  var cwd = config.dirs.tmp;
  var base = 'vendor/css';
  var dest = cwd + '/' + base;

  return makeVendorCss(dest)
    .pipe(gulp.dest(dest))
    .pipe(storeUrls(urls.vendor.css, cwd, base));
});

gulp.task('vendor:css:release', function() {
  var cwd = config.dirs.release;
  var base = 'vendor/css';
  var dest = cwd + '/' + base;

  return makeVendorCss(dest, true)
    .pipe(gulp.dest(dest))
    .pipe(filter('*.css'))
    .pipe(minifyCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(dest))
    .pipe(storeUrls(urls.vendor.css, cwd, base));
});

// --------------------------
// vendor / assets
// --------------------------
function vendorAssets(cwd) {
  var dest = cwd + '/vendor/assets';

  del.sync(dest);

  return gulp.src(config.vendor.assets.files, config.vendor.assets.opts)
    .pipe(gulp.dest(dest));
}

gulp.task('vendor:assets:dev', function() {
  return vendorAssets(config.dirs.tmp);
});

gulp.task('vendor:assets:release', function() {
  return vendorAssets(config.dirs.release);
});

// --------------------------
// demo / js
// --------------------------
function demoJsFiles(cwd) {
  var base = 'demo/js';
  var dest = cwd + '/' + base;

  del.sync(dest);

  return gulp.src('src/demo/**/*.js')
    .pipe(gulp.dest(dest))
    .pipe(storeUrls(urls.demo.js, cwd, base));
}

gulp.task('demo:js:dev', function() {
  return demoJsFiles(config.dirs.tmp);
});

gulp.task('demo:js:release', function() {
  return demoJsFiles(config.dirs.release);
});

// --------------------------
// demo / css
// --------------------------
function demoCssFiles(cwd) {
  var base = 'demo/css';
  var dest = cwd + '/' + base;

  del.sync(dest);

  return gulp.src('src/demo/demo.less')
    .pipe(less())
    .on('error', errorHandler)
    .pipe(autoprefixer())
    .pipe(gulp.dest(dest))
    .pipe(storeUrls(urls.demo.css, cwd, base));
}

gulp.task('demo:css:dev', function() {
  return demoCssFiles(config.dirs.tmp);
});

gulp.task('demo:css:release', function() {
  return demoCssFiles(config.dirs.release);
});

// --------------------------
// demo / assets
// --------------------------
function demoAssets(dest) {
  var files = [
    'playlists/**/*',
    'sounds/**/*'
  ];

  return gulp.src(files, {
    cwd: 'src/demo',
    base: 'src/demo'
  }).pipe(gulp.dest(dest + '/demo'));
}

function demoWaveForms(dest) {
  return gulp.src('src/demo/wave-forms/**/*', {base: 'src/demo/wave-forms/'})
    .pipe(gulp.dest(dest));
}

gulp.task('demo:assets:dev', function() {
  return demoAssets(config.dirs.tmp);
});

gulp.task('demo:assets:release', function() {
  return demoAssets(config.dirs.release);
});

gulp.task('demo:wave-forms:dev', function() {
  return demoWaveForms(config.dirs.tmp + '/i/wav');
});

gulp.task('demo:wave-forms:release', function() {
  return demoWaveForms(config.dirs.release + '/i/wav');
});

// --------------------------
// html and assets.json
// --------------------------
var inject = require('gulp-inject');
var file = require('gulp-file');
var htmlmin = require('gulp-htmlmin');
var prettify = require('gulp-jsbeautifier');

function buildHtml(dest, addRootSlash) {
  del.sync(dest + '**/*.html');

  var vendorJs = gulp.src(urls.vendor.js.files, urls.vendor.js.opts);
  var vendorCss = gulp.src(urls.vendor.css.files, urls.vendor.css.opts);

  var appJs = gulp.src(urls.app.js.files, urls.app.js.opts);
  var appCss = gulp.src(urls.app.css.files, urls.app.css.opts);

  var demoJs = gulp.src(urls.demo.js.files, urls.demo.js.opts);
  var demoCss = gulp.src(urls.demo.css.files, urls.demo.css.opts);

  addRootSlash = !!addRootSlash;

  var files = [
    './src/*.html',
    './src/demo/*.html'
  ];

  return gulp.src(files, {base: 'src'})
    .pipe(inject(vendorJs, {
      name: 'vendor',
      addRootSlash: addRootSlash
    }))
    .pipe(inject(appJs, {
      name: 'app',
      addRootSlash: addRootSlash
    }))
    .pipe(inject(vendorCss, {
      name: 'vendor',
      addRootSlash: addRootSlash
    }))
    .pipe(inject(appCss, {
      name: 'app',
      addRootSlash: addRootSlash
    }))
    .pipe(inject(demoJs, {
      name: 'demo',
      addRootSlash: addRootSlash
    }))
    .pipe(inject(demoCss, {
      name: 'demo',
      addRootSlash: addRootSlash
    }))
    .pipe(gulp.dest(dest));
}

gulp.task('html:dev', function() {
  return buildHtml(config.dirs.tmp, true);
});

gulp.task('html:release', function() {
  var dest = config.dirs.release;

  return buildHtml(dest, true)
    .pipe(htmlmin({
      removeComments: true
    }))
    .pipe(prettify({
      html: {
        indentSize: 2,
        preserveNewlines: true,
        maxPreserveNewlines: 0,
        indentChar: ' '
      }
    }))
    .pipe(gulp.dest(dest));
});

function buildJson(dest) {
  var fileName = 'assets.json';

  del.sync(dest + '/' + fileName);

  var json = {
    'app-js': [],
    'app-css': [],
    'vendor-js': [],
    'vendor-css': []
  };

  function transform(filepath, file, i, length) {
    return '"' + filepath + '"' + (i + 1 < length ? ',' : '');
  }

  var vendorJs = gulp.src(urls.vendor.js.files, urls.vendor.js.opts);
  var vendorCss = gulp.src(urls.vendor.css.files, urls.vendor.css.opts);

  var appJs = gulp.src(urls.app.js.files, urls.app.js.opts);
  var appCss = gulp.src(urls.app.css.files, urls.app.css.opts);

  var src = file(fileName, JSON.stringify(json), {
    src: true
  });

  return src
    .pipe(inject(vendorJs, {
      starttag: '"vendor-{{ext}}": [',
      endtag: ']',
      transform: transform
    }))
    .pipe(inject(appJs, {
      starttag: '"app-{{ext}}": [',
      endtag: ']',
      transform: transform
    }))
    .pipe(inject(vendorCss, {
      starttag: '"vendor-{{ext}}": [',
      endtag: ']',
      transform: transform
    }))
    .pipe(inject(appCss, {
      starttag: '"app-{{ext}}": [',
      endtag: ']',
      transform: transform
    }))
    .pipe(gulp.dest(dest));
}

gulp.task('assets-json:release', function() {
  var dest = config.dirs.release;

  return buildJson(dest)
    .pipe(prettify({
      indentSize: 2,
      indentChar: ' '
    }))
    .pipe(gulp.dest(dest));
});

// --------------------------
// JS tests
// --------------------------
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var stylish = require('jshint-stylish');

function lintJsFiles(src) {
  return src
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs());
}

gulp.task('lint:app', function() {
  var files = [
    './src/**/*.js'
  ];

  return lintJsFiles(gulp.src(files));
});

gulp.task('lint:system', function() {
  var files = [
    'gulpfile.js'
  ];

  return lintJsFiles(gulp.src(files));
});

gulp.task('test:app', [
  'lint:app'
]);

gulp.task('test:system', [
  'lint:system'
]);

// --------------------------
// builds
// --------------------------
gulp.task('build:dev', function(cb) {
  var pre = [
    'test'
  ];

  var builds = [
    'app:js:dev',
    'app:css:dev',
    'app:assets:dev',

    'vendor:js:dev',
    'vendor:css:dev',
    'vendor:assets:dev',

    'demo:js:dev',
    'demo:css:dev',
    'demo:assets:dev',
    'demo:wave-forms:dev'
  ];

  var post = [
    'html:dev'
  ];

  sequence(pre, builds, post, cb);
});

gulp.task('build:release', function(cb) {
  var pre = [
    'test'
  ];

  var builds = [
    'app:js:release',
    'app:css:release',
    'app:assets:release',

    'vendor:js:release',
    'vendor:css:release',
    'vendor:assets:release',

    'demo:js:release',
    'demo:css:release',
    'demo:assets:release',
    'demo:wave-forms:release'
  ];

  var post = [
    'html:release',
    'assets-json:release'
  ];

  sequence(pre, builds, post, cb);
});

// --------------------------
// dev server
// --------------------------
var browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
  var favoriteCounter = 0;

  return browserSync({
    files: [
      config.dirs.tmp + '/**/*'
    ],
    server: {
      baseDir: config.dirs.tmp,
      middleware: [
        function(req, res, next) {
          if (/\/get\/favorites\//gi.test(req.url)) {
            favoriteCounter++;
            res.end(favoriteCounter.toString());
          } else if (/saveplayeraction\.php/gi.test(req.url)) {
            res.end('');
          } else {
            next();
          }
        }
      ]
    },
    reloadDelay: 1000,
    port: 3000,
    open: false,
    notify: false,
    minify: false,
    ghostMode: false
  });
});

gulp.task('watch:server', function() {
  var htmlFiles = [
    './src/*.html',
    './src/demo/*.html'
  ];
  gulp.watch(htmlFiles, function() {
    sequence('html:dev');
  });

  gulp.watch('./src/app/**/*.js', function() {
    sequence('test:app', 'app:js:dev');
  });

  gulp.watch('./src/app/**/*.tpl.html', function() {
    sequence('app:js:dev');
  });

  gulp.watch('./src/styles/**/*.less', function() {
    sequence('app:css:dev');
  });

  gulp.watch('./src/demo/**/*.js', function() {
    sequence('demo:js:dev');
  });

  gulp.watch('./src/demo/**/*.less', function() {
    sequence('demo:css:dev');
  });
});

// --------------------------
// public tasks
// --------------------------
gulp.task('test', [
  'test:system',
  'test:app'
]);

gulp.task('server', function(cb) {
  sequence('build:dev', 'watch:server', 'browser-sync', cb);
});

gulp.task('build', [
  'build:release'
]);
