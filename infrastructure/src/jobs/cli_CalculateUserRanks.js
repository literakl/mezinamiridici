const scheduler = require('./calculateUserRanks');

scheduler.schedule().then(() => console.log('finished'));
