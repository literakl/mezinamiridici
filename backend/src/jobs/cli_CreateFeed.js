const sitemap = require('./createFeed');

sitemap.createFeed().then(() => console.log('Finished creating feed.'));
