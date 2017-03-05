var PlaylistItem = function(channelInfo, itemInfo) {
    //Default values
    var track = {
        title: "TITLE",
        artist: "ARTIST",
        album: "ALBUM",
        artwork: [
            { src: "assets/now-playing-placeholder.png",  sizes: "1000x1000", type: "image/png" }
        ],
        url: undefined
    };

    track.title = itemInfo.getElementsByTagName("title")[0].textContent;
    track.artist = channelInfo.getElementsByTagNameNS("http://www.itunes.com/dtds/podcast-1.0.dtd", "author")[0].textContent;
    track.album = channelInfo.getElementsByTagName("title")[0].textContent;
    track.artwork = [{
        src: channelInfo.getElementsByTagName("image")[0].getElementsByTagName("url")[0].textContent,
        sizes: "2048x2048",
        type: "image/jpg"
    }];
    track.url = itemInfo.getElementsByTagName("enclosure")[0].getAttribute("url");

    return track;
}