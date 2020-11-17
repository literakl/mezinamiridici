![CI](https://github.com/literakl/mezinamiridici/workflows/CI/badge.svg?branch=master)
[![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)](https://github.com/literakl/mezinamiridici/)

# Between us Drivers

This is a monorepo for portal www.mezinamiridici.cz

## Repository contents

* `spa` is the single page Vue.js application that delivers the website experience
* `backend` is the NodeJS backend
* `nginx` is a configuration for Nginx server

##Prerequisities

* download and install [NodeJS 12](https://nodejs.org/en/download/). It needs to be on your path so you can start it from any directory.
* download and install [MongoDB 4.2](https://www.mongodb.com/try/download/community) or newer.
* You might need to unblock the ports 8080 (web), 3000 (backend) and 27017 (mongo) in your firewall.

## Database

Import the data:

```
cd backend/database/doc
# install indexes and constrains
mongo bud mongo_setup.js
cd ..
# generate demo database (backend server must not be running!)
node test/generate_sample_data.js
```

If you need to recreate the database:

```
mongo bud --eval db.dropDatabase()
```

and repeat the import procedure. 

## Configuration

### backend/.env

Copy `.env.template` to `.env` and update as needed. You may need to set your local IP address in CORS_ORIGINS property.

### spa/.env

Copy `.env.template` to `.env` and update as needed. If you want to access the web 
from other devices (e.g. mobile phone), you should point the endpoint properties
to your real IP address (not localhost or 127.0.0.1).

## Local run

The first terminal: 
```
$ cd backend
$ npm install
$ npm run dev
```
The second terminal:
```
$ cd spa
$ npm install
$ npm run dev
```

To log in, use the users defined in `backend/test/prepareUsers.js` and password `BadPassword`.

## Nginx

This set up is neccessary for testing OAuth login (Facebook).

Install Nginx and copy `nginx/dev/nginx.conf` to its `conf` directory. Fix the path in `root` directive.

The first terminal: 
```
$ cd backend
$ npm install
$ npm run dev
```
The second terminal:
```
$ cd spa
$ npm install
$ npm run buildDev
$ cd /path/to/nginx
$ nginx
```
