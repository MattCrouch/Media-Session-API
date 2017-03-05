(function() {
    let playlist = new Playlist(document.getElementById("playlist"));
    let player = new Player(document.getElementById("player"));

    let feedUrls = [
        "https://toolsday.libsyn.com/rss", //Toolsday
        "https://answermethis.libsyn.com/rss", //Answer Me This
        "https://simplecast.com/podcasts/282/rss", //The Bike Shed
    ];

    let fetchUrls = [];

    //Fetch all the feeds!
    feedUrls.forEach(function(url) {
        fetchUrls.push(fetch(url));
    }, this);

    Promise.all(fetchUrls)
        .then(feeds => {
            let parser = new DOMParser();

            feeds.forEach(function(feed) {
                //Get text body of response
                feed.text().then(feedText => {
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
        });

    // btn.addEventListener("click", e => {
    //     player.play()
    //         .then(() => {
    //             if ('mediaSession' in navigator) {
    //                 alert("OLE!");
    //                 navigator.mediaSession.metadata = new MediaMetadata({
    //                     title: track.title,
    //                     artist: track.artist,
    //                     album: track.album,
    //                     artwork: track.artwork
    //                 });
    //             }
    //         });
    // });

    // if ('mediaSession' in navigator) {
    //     navigator.mediaSession.setActionHandler('play', function() {});
    //     navigator.mediaSession.setActionHandler('pause', function() {});
    //     navigator.mediaSession.setActionHandler('seekbackward', function() {});
    //     navigator.mediaSession.setActionHandler('seekforward', function() {});
    //     navigator.mediaSession.setActionHandler('previoustrack', function() {});
    //     navigator.mediaSession.setActionHandler('nexttrack', function() {});
    // }
})();