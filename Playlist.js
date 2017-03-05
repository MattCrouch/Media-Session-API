var Playlist = function(list) {
    let items = [];

    function getPlaylist() {
        return items;
    }

    function addToPlaylist(item) {
        items.push(item);

        _renderPlaylist();
    }

    function removeFromPlaylist(item) {
        //TODO: Removal
    }

    function _renderPlaylist() {
        list.innerHTML = "";

        items.forEach(function(item) {
            list.appendChild(_createPlaylistItem(item));
        }, this);
    }

    function _createPlaylistItem(item) {
        let li = document.createElement("li");
        li.tabIndex = 0;

        let info = document.createElement("div");
        info.className = "info";

        let artwork = document.createElement("img");
        artwork.className = "artwork";
        artwork.src = item.artwork[0].src;
        artwork.alt = item.album;

        let description = document.createElement("div");
        description.className = "description";

        let title = document.createElement("span");
        title.className = "title";
        title.textContent = item.title;

        let album = document.createElement("span");
        album.className = "album";
        album.textContent = item.album;

        let status = document.createElement("div");
        status.className = "status";

        description.appendChild(title);
        description.appendChild(album);

        info.appendChild(artwork);
        info.appendChild(description);
        
        li.appendChild(info);
        li.appendChild(status);
        
        return li;
    }

    return {
        getPlaylist: getPlaylist,
        add: addToPlaylist,
        remove: removeFromPlaylist
    }
};