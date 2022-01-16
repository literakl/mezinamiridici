![CI](https://github.com/literakl/mezinamiridici/workflows/CI/badge.svg?branch=master)
[![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)](https://github.com/literakl/mezinamiridici/)

# Between us drivers

This is a monorepo for portal [www.mezinamiridici.cz]((https://www.mezinamiridici.cz))

## Repository contents

* `spa` is the single page Vue.js application that delivers the website experience
* `backend` is the NodeJS backend
* `deploy` is a configuration for the deployment

## Prerequisities

* Download and install [NodeJS 16](https://nodejs.org/en/download/). It needs to be on your path so you can start it from any directory.

If you intend to develop the backend tasks:

* Download and install [MongoDB 5](https://www.mongodb.com/try/download/community) or newer.

You might need to unblock the ports 8080 (web), 3000 (backend) and 27017 (mongo) in your firewall.

## Database

Import the data:

```
cd backend/doc/database
# install indexes and constrains
mongo bud mongo_setup.js
cd ../..
# generate demo database (backend server must not be running!)
node test/generate_sample_data.js
```

If you need to recreate the database, clear Mongo with:

```
mongo bud --eval db.dropDatabase()
```

and repeat the import procedure. 

## Vue frontend

Create file [spa/.env.development.local](https://cli.vuejs.org/guide/mode-and-env.html#environment-variables)
and update as needed. If you want to access the site from 
other devices (e.g. mobile phone), you should point the endpoint 
URL properties to your real IP address (not localhost or 127.0.0.1).

Default values are pointing to a staging endpoint so you can just start
your development out of box without installing and running local backend.

```
$ cd spa
$ npm install
$ npm run dev
```

## NodeJS backend

Copy `backend/.env.template` to `backend/.env` and update as needed. 
You may need to set  your local IP address in CORS_ORIGINS property.

```
$ cd backend
$ npm install
$ npm run dev
```

To log into backend API, use the users defined in `backend/test/prepareUsers.js` 
and the password `BadPassword`.
