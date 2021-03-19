const { toXML } = require('jstoxml');
const fs = require('fs');
const { jobLogger } = require('../utils/logging');
const mongo = require('../utils/mongo.js');

async function createSitemap() {
    const links = await makeUrls();

    const xmlOptions = {
        header: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    };
  
    let sitemap = toXML({
        _name: 'urlset',
        _attrs: {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
            "xmlns:xhtml": "http://www.w3.org/1999/xhtml"
        },
        _content: links
    }, xmlOptions);
  
    fs.writeFile(`${process.env.SITEMAP_PATH}sitemap.xml`, sitemap, err => {
        if (err) return console.log(err);
        jobLogger.info("Sitemap created.", { label: "createSitemap" });
    });
}

async function makeUrls() {
    const items = await getItems();

    if (!items.length) {
        console.log("No items received! Exiting.");
        return process.exit(0);
    }

    const lastModifiedDate = getLastModified(items);

    const urlList = [
        {
            url: [
                { loc: "https://beta.mezinamiridici.cz/" },
                { priority: 1 },
                { lastMod: lastModifiedDate.toISOString() },
            ]
        },
        {
            url: [
                { loc: "https://beta.mezinamiridici.cz/prihlaseni" },
                { priority: 0.5 },
            ]
        },
        {
            url: [
                { loc: "https://beta.mezinamiridici.cz/o/napoveda" },
                { priority: 0.7 },
            ]
        },
        {
            url: [
                { loc: "https://beta.mezinamiridici.cz/o/mise" },
                { priority: 0.6 },
            ]
        },
        {
            url: [
                { loc: "https://beta.mezinamiridici.cz/o/kontakt" },
                { priority: 0.7 },
            ]
        },
        {
            url: [
                { loc: "https://beta.mezinamiridici.cz/o/reklama" },
                { priority: 0.6 }
            ]
        }
    ];

    for (item of items) {
        let slug;
        if (item.type === "poll") {
            slug = "/ankety/";
        } else if (item.type === "blog" || item.type === "page") {
            slug = `/p/${item.info.author.id}/b/`
        } else {
            continue;
        }

        urlList.push({
            url: [
                { loc: `https://beta.mezinamiridici.cz${slug}${item.info.slug}` },
                { priority: 1 },
                { lastMod: item.info.date.toISOString() },
            ]
        });
    };

    return urlList;
}

async function getItems() {

    jobLogger.info('Connecting to database', { label: 'createSitemap' });
    const dbClient = await mongo.connectToDatabase();

    let items;
    try {
        items = await dbClient.db()
                        .collection("items")
                        .find(
                            { "info.published": true }, 
                            { projection: { _id: 0, "info.slug": 1, "info.date": 1, type: 1, "info.author.id": 1 }}
                        ).toArray();
    } catch (err) {
        console.error(err);
    } 

    dbClient.close();
    return items;
}

// Get the last time a new post is added
function getLastModified(items) {
    let lastModified = null;

    for (let i = 0; i < items.length; i++) {
        if (items[i].info.date > lastModified) {
            lastModified = items[i].info.date;
        }
    }

    return lastModified;
}

exports.createSitemap = createSitemap;
