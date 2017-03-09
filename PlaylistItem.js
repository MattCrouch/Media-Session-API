var PlaylistItem = function(channelInfo, itemInfo) {
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

    track.title = itemInfo.getElementsByTagName("title")[0].textContent;
    track.artist = channelInfo.getElementsByTagNameNS("http://www.itunes.com/dtds/podcast-1.0.dtd", "author")[0].textContent;
    track.album = channelInfo.getElementsByTagName("title")[0].textContent;
    
    if(channelInfo.getElementsByTagNameNS(null, "image").length > 0) {
        track.artwork = [{
            src: channelInfo.getElementsByTagNameNS(null, "image")[0].getElementsByTagName("url")[0].textContent,
            sizes: "2048x2048",
            type: "image/jpg"
        }];
    } else if (channelInfo.getElementsByTagNameNS("http://www.itunes.com/dtds/podcast-1.0.dtd", "image").length > 0) {
        track.artwork = [{
            src: channelInfo.getElementsByTagNameNS("http://www.itunes.com/dtds/podcast-1.0.dtd", "image")[0].getAttribute("href"),
            sizes: "2048x2048",
            type: "image/jpg"
        }];
    }

    track.url = itemInfo.getElementsByTagName("enclosure")[0].getAttribute("url");
    track.pubDate = new Date(itemInfo.getElementsByTagName("pubDate")[0].textContent);

    return track;
}