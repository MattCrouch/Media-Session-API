(function() {
    let playlist = new Playlist(document.getElementById("playlist"));
    let player = new Player(document.querySelector(".now-playing"));

    playlist.subscribe(player);
    player.subscribe(playlist);

    let feedUrls = [
        "https://toolsday.libsyn.com/rss", //Toolsday
        "https://simplecast.com/podcasts/282/rss", //The Bike Shed
        "https://answermethis.libsyn.com/rss", //Answer Me This
        // "https://rss.acast.com/themodernmann", //The Modern Mann
        // "https://phptownhall.com/itunes.rss", //PHP Town Hall

    ];

    let fetchUrls = [];

    //Fetch all the feeds!
    feedUrls.forEach(function(url) {
        fetchUrls.push(fetch(url));
    }, this);

    Promise.all(fetchUrls)
        .then(feeds => {
            let parser = new DOMParser();
            let textPromises = [];

            feeds.forEach(function(feed) {
                //Get text body of response
                let text = feed.text();

                textPromises.push(text);

                text.then(feedText => {
                    //Parse feed
                    let xmlDoc = parser.parseFromString(feedText, "text/xml");
                    const channel = xmlDoc.getElementsByTagName("channel")[0];
                    const items = channel.getElementsByTagName("item");

                    //Only get max the 5 most recent
                    let maxLength = 5;
                    if(items.length < 5) {
                        maxLength = items.length;
                    }

                    for (let i = 0; i < maxLength; i++) {
                        let item = items[i];
                        let playlistItem = new PlaylistItem(channel, item);
                        playlist.add(playlistItem);
                    }
                });
            }, this);

            Promise.all(textPromises).then(filfilled => {
                player.setActiveItem(playlist.getActiveItem());
            });
        });
})();