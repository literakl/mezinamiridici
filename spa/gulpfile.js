const { src, dest, series } = require('gulp');
const del = require('del');
const fs = require('fs');
const merge2 = require('merge2');
const zip = require('gulp-zip');
const { exec } = require('child_process');

const packageDirectory = '../deploy/transfer';

function clean() {
  console.log('removing the old files in the directory');
  return del(packageDirectory, { force: true });
}

function createProdBuildFolder() {
  const dir = packageDirectory;
  console.log(`Creating the folder if not exist  ${dir}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log('Folder created:', dir);
  }

  return Promise.resolve('the value is ignored');
}

function createVueDEVBuild(cb) {
  console.log('Building Vue DEV build');
  del('dist/**', { force: true });
  return exec('npm run buildDev', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function copyVueDEVTask() {
  console.log('Copying Vue DEV code');
  return src(['dist/**', '!dist/runtimeConfig.js', '!dist/images/uploads/**'])
    .pipe(dest(`${packageDirectory}/html/dev`));
}

function createVuePRODBuild(cb) {
  console.log('Building Vue PROD build');
  del('dist/**', { force: true });
  return exec('npm run buildProd', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function copyVuePRODTask() {
  console.log('Copying Vue PROD code');
  return src(['dist/**', '!dist/runtimeConfig.js', '!dist/images/uploads/**'])
    .pipe(dest(`${packageDirectory}/html/prod`));
}

function zippingVueTask() {
  console.log('Zipping the Vue code');
  return src(`${packageDirectory}/html/**`)
    .pipe(zip('bud-frontend.zip'))
    .pipe(dest(`${packageDirectory}`));
}

function copyNodeJSCodeTask() {
  console.log('Copying NodeJS code into the directory');
  return merge2(src('../backend/src/**').pipe(dest(`${packageDirectory}/backend/src`)),
    src('../backend/templates/**').pipe(dest(`${packageDirectory}/backend/templates`)),
    src('../backend/config/**').pipe(dest(`${packageDirectory}/backend/config`)),
    src('../backend/package*json').pipe(dest(`${packageDirectory}/backend/`)));
}

function zippingBackendTask() {
  console.log('Zipping the backend code');
  return src(`${packageDirectory}/backend/**`)
    .pipe(zip('bud-backend.zip'))
    .pipe(dest(`${packageDirectory}`));
}

exports.default = series(
  clean,
  createProdBuildFolder,
  createVueDEVBuild,
  copyVueDEVTask,
  createVuePRODBuild,
  copyVuePRODTask,
  zippingVueTask,
  copyNodeJSCodeTask,
  zippingBackendTask,
);
