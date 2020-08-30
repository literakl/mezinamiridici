![CI](https://github.com/literakl/mezinamiridici/workflows/CI/badge.svg?branch=master)
[![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)](https://github.com/literakl/mezinamiridici/)

# Between us Drivers

This is a monorepo for portal mezinamiridici.cz

## Repository contents

* `spa` is the single page Vue.js application that delivers the website experience
* `infrastructure` is the NodeJS backend
* `nginx` is a configuration for Nginx server

## Database

Install the latest Mongodb and then import the data:

```
cd mongo
# install indexes and constrains
mongo bud < mongo_setup.js
# use your favorite command to unzip the database dump
unzip demo_data.zip  
mongoimport --db=bud --collection=users --jsonArray users.json
mongoimport --db=bud --collection=items --jsonArray items.json
mongoimport --db=bud --collection=poll_votes --jsonArray poll_votes.json
mongoimport --db=bud --collection=comments --jsonArray comments.json
mongoimport --db=bud --collection=comment_votes --jsonArray comment_votes.json
```

## Configuration

### infrastructure/.env

Copy `.env.template` to `.env` and update as needed. You may need to set your local IP address in CORS_ORIGINS property.

### spa/.env

Copy `.env.template` to `.env` and update as needed. If you want to access the web 
from other devices (e.g. mobile phone), you should point the endpoint properties
to the real IP address (not localhost or 127.0.0.1).

## Local run

You might need to unblock the ports 8080 (web), 3000 (backend) and 27017 (mongo) in your firewall.

The first terminal: 
```
$ cd infrastructure
$ npm install
$ npm run dev
```
The second terminal:
```
$ cd spa
$ npm install
$ npm run dev
```

To log in, use the users defined in `infrastructure/test/prepareUsers.js` and password `BadPassword`.

## Nginx

This set up is neccessary for testing OAuth login (Facebook).

Install Nginx and copy `nginx/dev/nginx.conf` to its `conf` directory. Fix the path in `root` directive.

The first terminal: 
```
$ cd infrastructure
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
