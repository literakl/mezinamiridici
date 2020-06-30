![CI](https://github.com/literakl/mezinamiridici/workflows/CI/badge.svg?branch=master)

# Between us Drivers

This is a monorepo for mezinamiridici.cz

### Repository contents

* `/spa` is the single page Vue.js application that delivers the website experience
* `/infrastructure` is the NodeJS backend

### Local run

```
$ cd infrastructure
$ npm install
$ npm run dev
$ cd spa
$ npm install
$ npm run dev
```

### Configuration

#### infrastructure/.env

```
MONGODB_URI=mongodb://localhost:27017/bud?retryWrites=true&w=majority
JWT_SECRET=STUPIDSECRET
```

#### spa/.env

```
VUE_APP_I18N_LOCALE=en
VUE_APP_I18N_FALLBACK_LOCALE=en
VUE_APP_API_ENDPOINT=http://127.0.0.1:3000/v1
VUE_APP_BFF_ENDPOINT=http://127.0.0.1:3000/bff
```

##### Note: before running testcases make sure you create all the index mentioned at mongo_setup.js
