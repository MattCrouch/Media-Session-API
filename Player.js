var Player = function(player) {
    let subscribers = [];
    let audioElement = document.createElement("audio");
    let activeItem;

    let artwork = document.querySelector("img.artwork");
    let description = document.querySelector(".description");
    let title = description.querySelector(".description .title");
    let album = description.querySelector(".description .album");
    let status = document.querySelector(".status");

    player.addEventListener("click", _togglePlayer);

    _setUpMediaSessionListeners();

    function _setUpMediaSessionListeners() {
        if('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', play);
            navigator.mediaSession.setActionHandler('pause', pause);
            navigator.mediaSession.setActionHandler('seekbackward', function() {});
            navigator.mediaSession.setActionHandler('seekforward', function() {});
            navigator.mediaSession.setActionHandler('previoustrack', prev);
            navigator.mediaSession.setActionHandler('nexttrack', next);
        }
    }

    function getActiveItem() {
        return activeItem;
    }

    function setActiveItem(item) {
        activeItem = item;

        artwork.src = item.artwork[0].src;

        description.classList.remove("hidden");
        title.textContent = item.title;
        album.textContent = item.album;

        status.classList.remove("hidden");

        audioElement.src = item.url;

        _updateState();
    }

    function _togglePlayer() {
        if(audioElement.paused) {
            play();
        } else {
            pause();
        }
    }

    function play() {
        if(!audioElement.paused) {
            return;
        }

        audioElement.play()
            .then(() => {
                _applyMetadata();
            });

        activeItem.playing = true;

        _updateState();

        _notifySubscribers("play");
    }

    function pause() {
        if(audioElement.paused) {
            return;
        }

        audioElement.pause();
        activeItem.playing = false;

        _updateState();

        _notifySubscribers("pause");
    }

    function next() {
        pause();
        _notifySubscribers("next");        
    }

    function prev() {
        pause();
        _notifySubscribers("prev");        
    }

    function _updateState() {
        status.textContent = "";

        if(audioElement.paused) {
            status.innerHTML = "<img src='assets/play.png' alt='' />";
        } else {
            status.innerHTML = "<img src='assets/pause.png' alt='' />";            
        }
    }

    function _applyMetadata() {
        if('mediaSession' in navigator && activeItem) {
            navigator.mediaSession.metadata = new MediaMetadata(activeItem);
        }
    }

    function subscribe(subscriber) {
        subscribers.push(subscriber);
    }

    function notify(action, data) {
        switch(action) {
            case "activeItemChanged":
                setActiveItem(data.activeItem);
                play();
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
        getActiveItem: getActiveItem,
        setActiveItem: setActiveItem,
        play: play,
        pause: pause
    }
};