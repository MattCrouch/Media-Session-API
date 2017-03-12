(function() {
    let playlist = new Playlist(document.getElementById("playlist"));
    let player = new Player(document.querySelector(".now-playing"));

    playlist.subscribe(player);
    player.subscribe(playlist);

    let getPodcasts = new XMLHttpRequest();
    getPodcasts.open("GET", "/podcasts");
    getPodcasts.addEventListener("load", function() {
        let podcasts = JSON.parse(this.responseText);
        podcasts.forEach(function(item) {
            let playlistItem = new PlaylistItem(item);
            playlist.add(playlistItem);
        }, this);

        player.setActiveItem(playlist.getActiveItem());
    });

    getPodcasts.send();
})();