![CI](https://github.com/literakl/mezinamiridici/workflows/CI/badge.svg?branch=master)

# Between us Drivers

This is a monorepo for mezinamiridici.cz

## Repository contents

* `/spa` is the single page Vue.js application that delivers the website experience
* `/infrastructure` is the NodeJS backend
* `nginx` is a configuration for Nginx server

## Database

Install the latest Mongodb and then import the data:

```
cd mongo
# install indexes and constrains
mongo bud < mongo_setup.js
# use your favorite command to unzip database dump
unzip demo_data.zip  
mongoimport --db=bud --collection=users --jsonArray users.json
mongoimport --db=bud --collection=items --jsonArray items.json
mongoimport --db=bud --collection=poll_votes --jsonArray poll_votes.json
mongoimport --db=bud --collection=comments --jsonArray comments.json
mongoimport --db=bud --collection=comment_votes --jsonArray comment_votes.json
```

## Configuration

### infrastructure/.env

Copy `.env.template` to `.env` and update as needed. 

### spa/.env

Copy `.env.template` to `.env` and update as needed. 

## Local run

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

To log in, use the credentials defined in `infrastructure/test/prepareUsers.js`.

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
