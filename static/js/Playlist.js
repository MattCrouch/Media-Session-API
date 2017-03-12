var Playlist = function(list) {
    let subscribers = [];
    let items = [];
    let activeIndex = 0;

    list.addEventListener("click", _handleClick);

    function getPlaylist() {
        return items;
    }

    function _getItem(index) {
        return items[index];
    }

    function getActiveItem() {
        return _getItem(activeIndex);
    }

    function _setActiveIndex(index) {
        getActiveItem().playing = false;
        _updateItem(activeIndex);

        activeIndex = index;

        _updateItem(activeIndex);
        
        _notifySubscribers("activeItemChanged", { activeItem: getActiveItem() });
    }

    function _getItemEntry(index) {
        return list.querySelector(`li[data-id="${index}"]`);
    }

    function addToPlaylist(item) {
        items.push(item);

        _sortPlaylist();
        _renderPlaylist();
    }

    function _sortPlaylist() {
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

    function _updateItem(index) {
        let item = _getItem(index);
        let li = _getItemEntry(index);
        let status = li.querySelector(".status");

        if(item.playing) {
            status.innerHTML = "<img src='static/assets/play.png' alt='' />";
        } else {
            status.innerHTML = "";
        }
    }

    function _play() {
        getActiveItem().playing = true;
        _updateItem(activeIndex);
        _notifySubscribers("play");
    }

    function _pause() {
        getActiveItem().playing = false;
        _updateItem(activeIndex);
        _notifySubscribers("pause");
    }

    function prev() {
        getActiveItem().playing = false;

        let newIndex = activeIndex - 1;
        if(newIndex < 0) {
            newIndex = items.length - 1;
        }

        _setActiveIndex(newIndex);
    }

    function next() {
        getActiveItem().playing = false;

        let newIndex = activeIndex + 1;
        if(newIndex > items.length - 1) {
            newIndex = 0;
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
                _updateItem(activeIndex);
                break;
            case "pause":
                getActiveItem().playing = false;
                _updateItem(activeIndex);
                break;
            case "next":
                next();
                break;
            case "prev":
                prev();
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
        add: addToPlaylist
    }
};