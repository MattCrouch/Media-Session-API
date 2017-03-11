var fs = require('fs');
var https = require('https');
var path = require('path');
var xml2js = require('xml2js-es6-promise');
var fetch = require('node-fetch');
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

app.use('/static', express.static(`${__dirname}/static`));

app.get('/', (request, response) => {
    response.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get('/podcasts', (request, response) => {
    response.setHeader('Content-Type', 'application/json');

    try {
        //Check if file exists, and is less than 30 minutes old
        let stats = fs.statSync(path.normalize(__dirname + '/static/cache.json'));
        let limit = new Date();
        limit.setMinutes(limit.getMinutes() - 30);

        if(stats.mtime >= limit) {
            //Send over cached version
            response.sendFile(path.normalize(__dirname + '/static/cache.json'));
            return;
        }
    } catch(e) {}

    //Generate a fresh one
    console.log("Generating a new feed...");

    let feedUrls = [
        "https://toolsday.libsyn.com/rss", //Toolsday
        "https://simplecast.com/podcasts/282/rss", //The Bike Shed
        "https://answermethis.libsyn.com/rss", //Answer Me This
        // "https://rss.acast.com/themodernmann", //The Modern Mann
        // "https://phptownhall.com/itunes.rss", //PHP Town Hall
        // "https://shoptalkshow.com/feed/podcast/", //ShopTalk,
        "https://audioboom.com/channels/2399216.rss", //No Such Thing As A Fish
    ];

    let fetchUrls = [];

    //Fetch all the feeds!
    feedUrls.forEach(function(url) {
        fetchUrls.push(fetch(url));
    }, this);

    Promise.all(fetchUrls)
        .then(feeds => {
            let textPromises = [];

            feeds.forEach(feed => {
                textPromises.push(feed.text());
            });

            return Promise.all(textPromises);
        }).then(textFeeds => {
            let xmlPromises = [];

            textFeeds.forEach(textFeed => {
                xmlPromises.push(xml2js(textFeed));
            });

            return Promise.all(xmlPromises);
        }).then(feeds => {
            let feedResponse = [];

            feeds.forEach(feed => {
                let channel = feed.rss.channel[0];
                let items = channel.item;

                //Only get max the 3 most recent
                let maxLength = 3;
                if(items.length < 3) {
                    maxLength = items.length;
                }

                for (let i = 0; i < maxLength; i++) {
                    let item = items[i];
                    let episode = {};

                    episode.title = item.title[0];
                    episode.artist = channel["itunes:author"][0];
                    episode.album = channel.title[0];
                    episode.url = item.enclosure[0]["$"].url;
                    episode.pubDate = item.pubDate[0];

                    if(channel.image) {
                        episode.artwork = channel.image[0].url[0];
                    } else if(channel["itunes:image"]) {
                        episode.artwork = channel["itunes:image"][0]["$"].href;
                    }
                    
                    feedResponse.push(episode);
                }
            });

            //Cache file
            fs.writeFile('./static/cache.json', JSON.stringify(feedResponse));

            //Send as JSON
            response.send(JSON.stringify(feedResponse));
        });
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443);
console.log(`server started on port 8443`);