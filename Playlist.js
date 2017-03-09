var Playlist = function(list) {
    let subscribers = [];
    let items = [];
    let activeIndex = 0;

    function getPlaylist() {
        return items;
    }

    function getActiveItem() {
        return items[activeIndex];
    }

    function addToPlaylist(item) {
        items.push(item);

        _sortPlaylist();
        _renderPlaylist();
    }

    function removeFromPlaylist(item) {
        //TODO: Removal
    }

    function _sortPlaylist() {
        //TODO: Only do at the end? Wasteful otherwise.
        function byDateDesc(a, b) {
            if(a.pubDate < b.pubDate) {
                return 1;
            } else if(a.pubDate > b.pubDate) {
                return -1;
            }
            return 0;
        }

        items.sort(byDateDesc);
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

        if(item.playing) {
            status.innerHTML = "<img src='assets/play.png' alt='' />";
        }

        description.appendChild(title);
        description.appendChild(album);

        info.appendChild(artwork);
        info.appendChild(description);
        
        li.appendChild(info);
        li.appendChild(status);
        
        return li;
    }

    function prev() {
        if(activeIndex - 1 < 0) {
            activeIndex = items.length - 1;
        } else {
            activeIndex--;
        }

        console.log(activeIndex);
    }

    function next() {
        if(activeIndex + 1 > items.length - 1) {
            activeIndex = 0;
        } else {
            activeIndex++;
        }

        console.log(activeIndex);
    }

    function subscribe(subscriber) {
        subscribers.push(subscriber);
    }

    function notify(action, data) {
        //TODO: Avoid complete _renderPlaylist() call and update item in situ
        switch(action) {
            case "play":
                _renderPlaylist();
                break;
            case "pause":
                _renderPlaylist();
                break;
            case "next":
                next();
                _notifySubscribers("activeItemChanged", { activeItem: getActiveItem() });
                _renderPlaylist();                
                break;
            case "prev":
                prev();
                _notifySubscribers("activeItemChanged", { activeItem: getActiveItem() });                
                _renderPlaylist();                
                break;
        }
    }

    function _notifySubscribers(action, data) {
        subscribers.forEach(subscriber => {
            subscriber.notify(action, data);
        });
    }

    return {
        subscribe: subscribe,
        notify: notify,
        getPlaylist: getPlaylist,
        getActiveItem: getActiveItem,
        add: addToPlaylist,
        remove: removeFromPlaylist,
    }
};