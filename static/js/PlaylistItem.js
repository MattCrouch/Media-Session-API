var PlaylistItem = function(item) {
    //Default values
    var track = {
        title: "TITLE",
        artist: "ARTIST",
        album: "ALBUM",
        artwork: [
            { src: "assets/now-playing-placeholder.png",  sizes: "1000x1000", type: "image/png" }
        ],
        url: undefined,
        pubDate: undefined,
        playing: false
    };

    track.title = item.title;
    track.artist = item.artist;
    track.album = item.album;
    track.url = item.url;
    track.pubDate = new Date(item.pubDate);
    
    track.artwork = [{
        src: item.artwork,
        sizes: "2048x2048",
        type: "image/jpg"
    }];
    
    return track;
}