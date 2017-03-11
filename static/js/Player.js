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
    audioElement.addEventListener("play", _audioPlay);
    audioElement.addEventListener("pause", _audioPause);

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

    function _audioPlay() {
        activeItem.playing = true;

        _updateState();

        _notifySubscribers("play");
    }

    function _audioPause() {
        activeItem.playing = false;

        _updateState();

        _notifySubscribers("pause");
    }

    function play() {
        if(!audioElement.paused) {
            return;
        }

        //Returns a promise in Chrome only
        let playAudioElement = audioElement.play();

        if(playAudioElement !== undefined) {
            playAudioElement.then(() => {
                _applyMetadata();
            })
            .catch(err => {
                console.log(err);
            });
        } else {
            //We can only assume everything's gone well so far
            _applyMetadata();
        }
    }

    function pause() {
        if(audioElement.paused) {
            return;
        }

        audioElement.pause();
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
            status.innerHTML = "<img src='static/assets/play.png' alt='' />";
        } else {
            status.innerHTML = "<img src='static/assets/pause.png' alt='' />";            
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
                break;
            case "play":
                play();
                break;
            case "pause":
                pause();
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
        getActiveItem: getActiveItem,
        setActiveItem: setActiveItem,
        play: play,
        pause: pause
    }
};