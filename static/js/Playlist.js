var Playlist = function(list) {
    let subscribers = [];
    let items = [];
    let activeIndex = 0;

    //Apply event listeners to the component
    list.addEventListener("click", _handleClick);
    list.addEventListener("keydown", _handleKeyDown);

    function getPlaylist() {
        return items;
    }

    //Return the item with a specific index
    function _getItem(index) {
        return items[index];
    }

    //Return the currently playing item 
    function getActiveItem() {
        return _getItem(activeIndex);
    }

    //Set the currently active item in the playlist
    function _setActiveIndex(index) {
        //Pause the current item
        getActiveItem().playing = false;
        
        //Update the view with the paused item
        _updateItem(activeIndex);

        //Switch the active item
        activeIndex = index;

        //Update the view with the newly active item now playing
        _updateItem(activeIndex);
        
        //Tell the Player the active item has changed
        _notifySubscribers("activeItemChanged", { activeItem: getActiveItem() });
    }

    //Get the actual list item that represents a PlaylistItem
    function _getItemEntry(index) {
        return list.querySelector(`li[data-id="${index}"]`);
    }
    
    //Add a PlaylistItem to the Playlist
    function addToPlaylist(item) {
        items.push(item);

        //Make sure all PlaylistItems display in order
        _sortPlaylist();
        _renderPlaylist();
    }

    //Sort the PlaylistItems based on their publication date
    function _sortPlaylist() {
        //Basic sorting function to sort on pubDate
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

    //Render the entire list for the component
    function _renderPlaylist() {
        //Clear any existing contents in the list
        list.innerHTML = "";

        //Loop through each PlaylistItem and add them to the DOM
        items.forEach(function(item, index) {
            list.appendChild(_createPlaylistItem(item, index));
        }, this);
    }

    //Generate the markup for a new item in the playlist
    function _createPlaylistItem(item, index) {
        let li = document.createElement("li");
        //Link up list item to entry in the internal playlist
        li.setAttribute("data-id", index);
        //Make the entry more accessible to assistive technologies
        li.tabIndex = 0;
        li.setAttribute("aria-label", `${item.title} from ${item.album}`);

        //Group all descriptive data together
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

        //Only show a status of some kind if it's the one being played
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

    //Update the item in the list based on its state
    function _updateItem(index) {
        //Get the PlaylistItem referred to by index
        let item = _getItem(index);
        //Get the list item from within the component that we need to update
        let li = _getItemEntry(index);
        let status = li.querySelector(".status");

        if(item.playing) {
            status.innerHTML = "<img src='static/assets/play.png' alt='' />";
        } else {
            status.innerHTML = "";
        }
    }

    //Play the audio if necessary
    function _play() {
        getActiveItem().playing = true;

        //Update the view with new playing status
        _updateItem(activeIndex);

        //Tell the Player about the state of the active playlist item
        _notifySubscribers("play");
    }

    //Pause the audio if necessary
    function _pause() {
        getActiveItem().playing = false;
        _updateItem(activeIndex);

        //Tell the Player about the state of the active playlist item
        _notifySubscribers("pause");
    }

    //Find the index of the previous item
    function _getPrevIndex(index) {
        index = parseInt(index, 10);

        //If we're at the start, loop back to the end
        let newIndex = index - 1;
        if(newIndex < 0) {
            newIndex = items.length - 1;
        }
        return newIndex;
    }

    //Find the index of the next item
    function _getNextIndex(index) {
        index = parseInt(index, 10);

        //If we're at the end, loop back to the start
        let newIndex = index + 1;
        if(newIndex > items.length - 1) {
            newIndex = 0;
        }
        return newIndex;
    }

    //Instruct the player to move to the previous item
    function prev() {
        getActiveItem().playing = false;

        //Find the index of the previous item to play
        let newIndex = _getPrevIndex(activeIndex);

        //Set as active
        _setActiveIndex(newIndex);
    }

    //Instruct the player to move to the next item
    function next() {
        getActiveItem().playing = false;
        
        //Find the index of the next item to play
        let newIndex = _getNextIndex(activeIndex);

        //Set as active
        _setActiveIndex(newIndex);
    }

    //Check clicks on playlist as a whole to avoid adding too many listeners
    function _handleClick(e) {
        if(e.target.nodeName == "UL") {
            return;
        }

        let index = e.target.getAttribute("data-id");

        _selectItem(index);
    }

    //Calculate action for selection based on the current state
    function _selectItem(index) {
        //Toggle play state if that item is already active
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

    //Act on specific key presses when focused on the component
    function _handleKeyDown(e) {
        //Get the item being focused on's ID
        let focusedItemId = document.activeElement.getAttribute("data-id");

        const mapping = {
            UP: 38,
            DOWN: 40,
            ENTER: 13
        };

        if(Object.values(mapping).indexOf(e.keyCode) !== -1) {
            //In mapping, disable default behaviour
            e.preventDefault();
        }

        if(e.keyCode == mapping.UP) {
            //Focus previous element
            _getItemEntry(_getPrevIndex(focusedItemId)).focus();            
        } else if(e.keyCode == mapping.DOWN) {
            //Focus next element
            _getItemEntry(_getNextIndex(focusedItemId)).focus();
        } else if(e.keyCode == mapping.ENTER) {
            //Play item
            _selectItem(focusedItemId);
        }
    }

    //Allow any other components to listen for changes within this component
    function subscribe(subscriber) {
        subscribers.push(subscriber);
    }

    //Process any incoming messages from other components
    function notify(action, data) {
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

    //Tell any other components about what's happening in the Playlist
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