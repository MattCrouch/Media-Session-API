(function() {
    let playlist = new Playlist(document.getElementById("playlist"));
    let player = new Player(document.querySelector(".now-playing"));

    playlist.subscribe(player);
    player.subscribe(playlist);

    fetch("/podcasts")
        .then(resp => resp.json())
        .then(resp => {
            resp.forEach(function(item) {
                let playlistItem = new PlaylistItem(item);
                playlist.add(playlistItem);
            }, this);

            player.setActiveItem(playlist.getActiveItem());
        });
})();