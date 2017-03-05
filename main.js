(function() {
    let btn = document.getElementById("player");
    let player = document.createElement("audio");

    let feedUrls = [
        "https://toolsday.libsyn.com/rss", //Toolsday
        "https://answermethis.libsyn.com/rss", //Answer Me This
        "https://simplecast.com/podcasts/282/rss", //The Bike Shed
    ];

    let track = {
        title: "THIS IS A TITLE",
        artist: "THIS IS THE ARTIST",
        album: "THIS IS AN ALBUM",
        artwork: false
    }

    fetch(feedUrls[2])
        .then(response => response.text())
        .then(data => {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(data, "text/xml");

            const channel = xmlDoc.getElementsByTagName("channel")[0];
            const episode = channel.getElementsByTagName("item")[0];
            
            const url = episode.getElementsByTagName("enclosure")[0].getAttribute("url");

            track.title = episode.getElementsByTagName("title")[0].textContent;
            track.artist = channel.getElementsByTagNameNS("http://www.itunes.com/dtds/podcast-1.0.dtd", "author")[0].textContent;
            track.album = channel.getElementsByTagName("title")[0].textContent;
            track.artwork = [{
                src: channel.getElementsByTagName("image")[0].getElementsByTagName("url")[0].textContent,
                sizes: "2048x2048",
                type: "image/jpg"
            }];

            console.log(track);

            player.src = url;
        });

    btn.addEventListener("click", e => {
        player.play()
            .then(() => {
                if ('mediaSession' in navigator) {
                    alert("OLE!");
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: track.title,
                        artist: track.artist,
                        album: track.album,
                        artwork: track.artwork
                    });
                }
            });
    });

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', function() {});
        navigator.mediaSession.setActionHandler('pause', function() {});
        navigator.mediaSession.setActionHandler('seekbackward', function() {});
        navigator.mediaSession.setActionHandler('seekforward', function() {});
        navigator.mediaSession.setActionHandler('previoustrack', function() {});
        navigator.mediaSession.setActionHandler('nexttrack', function() {});
    }
})();