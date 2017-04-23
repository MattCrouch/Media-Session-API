(function() {
    //Initialise player and playlist objects
    let playlist = new Playlist(document.getElementById("playlist"));
    let player = new Player(document.querySelector(".now-playing"));

    //Register observers to send messages between components
    playlist.subscribe(player);
    player.subscribe(playlist);

    //Request new podcasts list
    let getPodcasts = new XMLHttpRequest();
    getPodcasts.open("GET", "/podcasts");
    getPodcasts.addEventListener("load", function() {
        //Parse the JSON and create new PlaylistItem objects for use in Playlist
        let podcasts = JSON.parse(this.responseText);
        podcasts.forEach(function(item) {
            let playlistItem = new PlaylistItem(item);
            playlist.add(playlistItem);
        }, this);

        //Add the first item in the playlist to the Player component
        player.setActiveItem(playlist.getActiveItem());
    });
    
    //Send the request
    getPodcasts.send();

    // Register the service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./serviceworker.js')
            .then(function() { console.log('Service Worker Registered'); });
    }
})();