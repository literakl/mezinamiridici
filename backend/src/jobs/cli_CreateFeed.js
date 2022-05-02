const { createFeed } = require('./createFeed');

createFeed().then(() => console.log('Finished creating feed.'));
