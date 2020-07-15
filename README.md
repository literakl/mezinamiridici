![CI](https://github.com/literakl/mezinamiridici/workflows/CI/badge.svg?branch=master)

# Between us Drivers

This is a monorepo for mezinamiridici.cz

## Repository contents

* `/spa` is the single page Vue.js application that delivers the website experience
* `/infrastructure` is the NodeJS backend

## Database

Install the latest Mongodb and then import the data:

```
cd mongo
mongo bud < mongo_setup.js
cd samples
mongoimport --db=bud --collection=users --jsonArray users.json
mongoimport --db=bud --collection=items --jsonArray items.json
mongoimport --db=bud --collection=poll_votes --jsonArray poll_votes.json
mongoimport --db=bud --collection=comments --jsonArray comments.json
mongoimport --db=bud --collection=comment_votes --jsonArray comment_votes.json
```

### Note 

Before running testcases make sure you create all the indexes mentioned at mongo_setup.js.

## Configuration

### infrastructure/.env

```
MONGODB_URI=mongodb://localhost:27017/bud?retryWrites=true&w=majority
JWT_SECRET=STUPIDSECRET
TIME_ID_CHARS=1
PAGE_SIZE_COMMENTS=10
MAXIMUM_PAGE_SIZE=50
```

### spa/.env

```
VUE_APP_I18N_LOCALE=en
VUE_APP_I18N_FALLBACK_LOCALE=en
VUE_APP_API_ENDPOINT=http://127.0.0.1:3000/v1
VUE_APP_BFF_ENDPOINT=http://127.0.0.1:3000/bff
VUE_APP_REPLY_LIMIT=2
```

## Local run

```
$ cd infrastructure
$ npm install
$ npm run dev
$ cd spa
$ npm install
$ npm run dev
```
