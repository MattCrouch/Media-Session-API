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

    //Assign values based on the content from the server
    track.title = item.title;
    track.artist = item.artist;
    track.album = item.album;
    track.url = item.url;
    track.pubDate = new Date(item.pubDate);

    //Make sure artwork is in the format expected by the Media Session API
    track.artwork = [{
        src: item.artwork
    }];
    
    return track;
}