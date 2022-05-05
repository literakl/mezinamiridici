const { Feed } = require('feed');
const fs = require('fs');
const path = require('path');

const { configureLoggers } = require('../utils/logging');
const mongo = require('../utils/mongo.js');
require('../utils/path_env');

const { WEB_URL, SITEMAP_PATH, FEED_SIZE } = process.env;

const jobLogger = configureLoggers('createFeed.js', true, 'createFeed');

function getURL(item) {
  if (item.type === 'article') {
    return `${WEB_URL}/clanky/${item.info.slug}`;
  } else if (item.type === 'poll') {
    return `${WEB_URL}/ankety/${item.info.slug}`;
  } else {
    throw new Error(`Unsupported item ${item._id}`);
  }
}

async function getItems() {
  jobLogger.info('Connecting to database');
  const dbClient = await mongo.connectToDatabase();

  let items;
  try {
    items = await dbClient.db()
      .collection('items')
      .find(
        {
          type: { $in: ['article', 'poll'] },
          'info.state': 'published',
        },
        {
          projection: {
            type: 1,
            info: 1,
          },
        },
      )
      .sort({ 'info.date': -1 })
      .limit(Number(FEED_SIZE || 10))
      .toArray();
    return items;
  } catch (err) {
    jobLogger.error(err);
    return [];
  } finally {
    dbClient.close();
  }
}

async function createFeed() {
  const feed = new Feed({
    title: "Mezi námi řidiči",
    description: "Prevence dopravních nehod skrze výměnu názorů a vzdělávání",
    id: WEB_URL,
    link: WEB_URL,
    language: "cs",
    image: `${WEB_URL}/images/fav/512.png`,
    favicon: `${WEB_URL}/favicon.ico`,
    copyright: "All rights reserved 2022, Lelisoft s.r.o.",
    // feedLinks: {
    //   atom: `${WEB_URL}/atom.xml`,
    // },
    author: {
      name: "Leoš Literák",
      email: "leos@lelisoft.com",
      link: "https://twitter.com/literakl"
    }
  });
  feed.addCategory("Automobily");
  feed.addCategory("Řízení");
  feed.addCategory("Vzdělávání");

  const items = await getItems();
  items.forEach(item => {
    const url = getURL(item);
    feed.addItem({
      title: item.info.caption,
      id: url,
      link: url,
      // description: item.description,
      author: [
        {
          name: item.info.author.nickname,
          link: `${WEB_URL}/p/${item.info.author.id}`,
        },
      ],
      date: item.info.date,
      image: `${WEB_URL}/${item.info.picture}`,
    });
  });

  fs.writeFile(`${path.join(__dirname, SITEMAP_PATH)}/feed.rss`, feed.rss2(), (err) => {
    if (err) {
      jobLogger.error('Feed error');
      jobLogger.error(err);
    } else {
      jobLogger.info('Feed created.');
    }
  });
}

exports.createFeed = createFeed;
