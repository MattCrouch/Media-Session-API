var Playlist = function(list) {
    let subscribers = [];
    let items = [];
    let activeIndex = 0;

    list.addEventListener("click", _handleClick);

    function getPlaylist() {
        return items;
    }

    function getActiveItem() {
        return items[activeIndex];
    }

    function _setActiveIndex(index) {
        getActiveItem().playing = false;
        activeIndex = index;
        
        _notifySubscribers("activeItemChanged", { activeItem: getActiveItem() });
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

        items.forEach(function(item, index) {
            list.appendChild(_createPlaylistItem(item, index));
        }, this);
    }

    function _createPlaylistItem(item, index) {
        let li = document.createElement("li");
        li.tabIndex = 0;
        li.setAttribute("data-id", index);

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
            status.innerHTML = "<img src='static/assets/play.png' alt='' />";
        }

        description.appendChild(title);
        description.appendChild(album);

        info.appendChild(artwork);
        info.appendChild(description);
        
        li.appendChild(info);
        li.appendChild(status);
        
        return li;
    }

    function _play() {
        getActiveItem().playing = true;
        _notifySubscribers("play");
    }

    function _pause() {
        getActiveItem().playing = false;
        _notifySubscribers("pause");
    }

    function prev() {
        let newIndex = activeIndex - 1;
        if(newIndex < 0) {
            newIndex = items.length - 1;
        }

        _setActiveIndex(newIndex);
    }

    function next() {
        let newIndex = activeIndex + 1;
        if(newIndex > items.length - 1) {
            activeIndex = 0;
        }

        _setActiveIndex(newIndex);
    }

    function _handleClick(e) {
        if(e.target.nodeName == "UL") {
            return;
        }

        let index = e.target.getAttribute("data-id");

        if(index === activeIndex) {
            //Toggle play/pause
            if(!getActiveItem().playing) {
                _play();
            } else {
                _pause();
            }
        } else {
            //Switch to target
            _setActiveIndex(index);
        }
    }

    function subscribe(subscriber) {
        subscribers.push(subscriber);
    }

    function notify(action, data) {
        //TODO: Avoid complete _renderPlaylist() call and update item in situ
        switch(action) {
            case "play":
                getActiveItem().playing = true;
                _renderPlaylist();
                break;
            case "pause":
                getActiveItem().playing = false;
                _renderPlaylist();
                break;
            case "next":
                next();
                _renderPlaylist();                
                break;
            case "prev":
                prev();
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