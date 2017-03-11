var PlaylistItem = function(item) {
    //Default values
    var track = {
        title: undefined,
        artist: undefined,
        album: undefined,
        artwork: [
            { src: "static/assets/default-icon.png",  sizes: "1000x1000", type: "image/png" }
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
        src: item.artwork
    }];
    
    return track;
}