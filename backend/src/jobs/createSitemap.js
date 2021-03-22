const { toXML } = require('jstoxml');
const fs = require('fs');
const { jobLogger } = require('../utils/logging');
const mongo = require('../utils/mongo.js');

require('../utils/path_env');

const { WEB_URL, SITEMAP_PATH } = process.env;

// TODO split to multiple files when the sitemap is about to reach the limit
// TODO max 50,000 URLs and must not exceed 50MB uncompressed
async function createSitemap() {
  const links = await fetchURLs();
  const sitemap = toXML({
    _name: 'urlset',
    _attrs: {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
    },
    _content: links,
  }, {
    header: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
  });

  // TODO could it die with out of memory one day?
  // TODO I would favour not to use external library and print each item as XML manually
  fs.writeFile(`${SITEMAP_PATH}sitemap.xml`, sitemap, (err) => {
    if (err) {
      console.log(err);
    } else {
      jobLogger.info('Sitemap created.', { label: 'createSitemap' });
    }
  });
}

async function fetchURLs() {
  const items = await getItems();
  if (!items.length) {
    jobLogger.warn('No items received! Exiting.');
    return process.exit(1);
  }

  const urlList = [
    {
      url: [
        { loc: WEB_URL },
      ],
    },
  ];

  items.forEach((item) => {
    let slug;
    if (item.type === 'blog') {
      slug = `/p/${item.info.author.id}/b/`;
    } else if (item.type === 'poll') {
      slug = '/ankety/';
    } else if (item.type === 'page') {
      slug = '/o/';
    } else {
      return;
    }

    urlList.push({
      url: [
        { loc: `${WEB_URL}${slug}${item.info.slug}` },
        { lastMod: computeDate(item) },
      ],
    });
  });

  return urlList;
}

async function getItems() {
  jobLogger.info('Connecting to database', { label: 'createSitemap' });
  const dbClient = await mongo.connectToDatabase();

  let items;
  try {
    items = await dbClient.db()
      .collection('items')
      .find(
        {
          type: { $in: ['blog', 'page', 'poll'] },
          'info.published': true,
          // 'info.date': { $lte: new Date() }, TODO
        },
        {
          projection: {
            _id: 0,
            type: 1,
            'info.slug': 1,
            'info.date': 1,
            'info.author.id': 1,
            'comments.last': 1,
          },
        },
      )
      .toArray();
    return items;
  } catch (err) {
    jobLogger.error(err);
    return [];
  } finally {
    dbClient.close();
  }
}

function computeDate(item) {
  if (item.comments.last) {
    return item.comments.last.toISOString();
  } else {
    return item.info.date.toISOString();
  }
}

exports.createSitemap = createSitemap;
