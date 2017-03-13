const fs = require('fs');
const https = require('https');
const path = require('path');
const xml2js = require('xml2js-es6-promise');
const fetch = require('node-fetch');
const ip = require('ip');

//Fetch and store the certificates for HTTPS
const privateKey  = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

//Set up the Express server
const express = require('express');
const app = express();
const port = 8443;

//Serve any files in '/static' directly
app.use('/static', express.static(`${__dirname}/static`, { maxAge: 31557600000 })); //Cache for a year

//Serve index.html when requesting the root path
app.get('/', (request, response) => {
    response.sendFile(path.resolve(__dirname, 'index.html'));
});

//Serve the podcast JSON when requested form /podcasts
app.get('/podcasts', (request, response) => {
    //Set up headers to appropriately cache response on client and to read it as JSON
    response.setHeader('Cache-Control', 'public, maxAge=1800');
    response.setHeader('Content-Type', 'application/json');

    //Serve a cached version if possible
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

    //Define which RSS feeds to pull
    let feedUrls = [
        "https://toolsday.libsyn.com/rss", //Toolsday
        "https://simplecast.com/podcasts/282/rss", //The Bike Shed
        "https://answermethis.libsyn.com/rss", //Answer Me This
        "https://audioboom.com/channels/2399216.rss", //No Such Thing As A Fish
        // "https://rss.acast.com/themodernmann", //The Modern Mann
        // "https://phptownhall.com/itunes.rss", //PHP Town Hall
        // "https://shoptalkshow.com/feed/podcast/", //ShopTalk
    ];

    //Add fetch requests to array to only act when all are successful
    let fetchUrls = [];

    feedUrls.forEach(function(url) {
        fetchUrls.push(fetch(url));
    }, this);

    //When all feeds have been received
    Promise.all(fetchUrls)
        .then(feeds => {
            //Convert the XML to text
            let textPromises = [];

            feeds.forEach(feed => {
                textPromises.push(feed.text());
            });

            return Promise.all(textPromises);
        }).then(textFeeds => {
            //Use xml2js to conver them to objects
            let xmlPromises = [];

            textFeeds.forEach(textFeed => {
                xmlPromises.push(xml2js(textFeed));
            });

            return Promise.all(xmlPromises);
        }).then(feeds => {
            //Check each feed for content
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
                    //Add each episode into a feed response array to send over
                    let item = items[i];
                    let episode = {};

                    episode.title = item.title[0];

                    //Prioritise the author of the episode if available
                    if(item["itunes:author"]) {
                        episode.artist = item["itunes:author"][0];                        
                    } else if(channel["itunes:author"]) {
                        //Fall back to author of the podcast
                        episode.artist = channel["itunes:author"][0];
                    }
                    
                    episode.album = channel.title[0];
                    episode.url = item.enclosure[0]["$"].url;
                    episode.pubDate = item.pubDate[0];

                    //Prioritise fetching the artwork for the episode if available
                    if(item["itunes:image"] && item["itunes:image"][0]["$"]) {
                        episode.artwork = item["itunes:image"][0]["$"].href;
                    } else if(channel.image) {
                        //Fall back to artwork for the podcast as a whole
                        episode.artwork = channel.image[0].url[0];
                    } else if(channel["itunes:image"]) {
                        //Some feeds will only populate the iTunes field for this, so grab that if possible
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

//Fire up the HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);
console.log(`server started at https://${ip.address()}:${port}`);