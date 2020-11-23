const { src, dest, series, parallel } = require('gulp');
const del = require('del');
const fs = require('fs');
const merge2 = require('merge2');
const zip = require('gulp-zip');
const { exec } = require('child_process');

const packageDirectory = '../transfer';

function clean() {
  console.log('removing the old files in the directory');
  return del(packageDirectory, { force: true });
}

function createProdBuildFolder() {
  const dir = packageDirectory;
  console.log(`Creating the folder if not exist  ${dir}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log('folder created:', dir);
  }

  return Promise.resolve('the value is ignored');
}

function buildVueCodeTask(cb) {
  console.log('building Vue code');
  return exec('npm run buildStaging', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
  // return cb(null);
}

function copyVueCodeTask() {
  console.log('copying Vue code into the directory');
  return src('dist/**')
    .pipe(dest(`${packageDirectory}/html`));
}

function copyNodeJSCodeTask() {
  console.log('copying NodeJS code into the directory');
  return merge2(src('../backend/src/**').pipe(dest(`${packageDirectory}/backend/src`)),
    src('../backend/templates/**').pipe(dest(`${packageDirectory}/backend/templates`)),
    src('../backend/package*json').pipe(dest(`${packageDirectory}/backend/`)));
}

function zippingTask() {
  console.log('zipping the code ');
  return src(`${packageDirectory}/**`)
    .pipe(zip('bud.zip'))
    .pipe(dest(`${packageDirectory}`));
}

exports.default = series(
  clean,
  createProdBuildFolder,
  buildVueCodeTask,
  parallel(copyVueCodeTask, copyNodeJSCodeTask),
  zippingTask,
);
