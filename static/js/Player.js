var Player = function(player) {
    let subscribers = [];
    let audioElement = document.createElement("audio");
    let activeItem;
    let buffering = false;

    const SEEK_AMOUNT = 30;

    let artwork = document.querySelector("img.artwork");
    let description = document.querySelector(".description");
    let title = description.querySelector(".description .title");
    let album = description.querySelector(".description .album");
    let progress = document.querySelector(".now-playing progress");
    let status = document.querySelector(".now-playing .status");

    player.addEventListener("click", _togglePlayer);
    player.addEventListener("keydown", _handleKeyDown);    
    audioElement.addEventListener("playing", _audioPlay);
    audioElement.addEventListener("pause", _audioPause);
    audioElement.addEventListener("waiting", _audioWaiting);
    audioElement.addEventListener("ended", _next);
    audioElement.addEventListener("loadedmetadata", _setProgress);
    audioElement.addEventListener("timeupdate", _updateProgress);

    _setUpMediaSessionListeners();

    function _setUpMediaSessionListeners() {
        if('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', play);
            navigator.mediaSession.setActionHandler('pause', pause);
            navigator.mediaSession.setActionHandler('seekbackward', _seekBackward);
            navigator.mediaSession.setActionHandler('seekforward', _seekForward);
            navigator.mediaSession.setActionHandler('previoustrack', _prev);
            navigator.mediaSession.setActionHandler('nexttrack', _next);
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
        progress.value = 0;
        progress.max = 0; //Until metadata appears

        player.setAttribute("aria-label", `Playing ${item.title} from ${item.album}`);

        status.classList.remove("hidden");

        if(item.url) {
            audioElement.src = item.url;
        } else {
            audioElement.src = "";
        }

        _updateState();
    }

    function _togglePlayer() {
        if(audioElement.paused) {
            play();
        } else {
            pause();
        }
    }

    function _handleKeyDown(e) {
        if(e.keyCode == 13) {
            //Hit enter
            _togglePlayer();
        }
    }

    function _audioPlay() {
        activeItem.playing = true;
        buffering = false;

        _updateState();

        _notifySubscribers("play");
    }

    function _audioPause() {
        activeItem.playing = false;

        _updateState();

        _notifySubscribers("pause");
    }

    function _audioWaiting() {
        activeItem.playing = false;

        buffering = true;

        _updateState();

        _notifySubscribers("waiting");
    }

    function _setProgress(e) {
        progress.max = audioElement.duration;
    }

    function _updateProgress(e) {
        progress.value = audioElement.currentTime;
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

    function _seekBackward() {
        audioElement.currentTime = Math.max(audioElement.currentTime - SEEK_AMOUNT, 0);
    }

    function _seekForward() {
        audioElement.currentTime = Math.min(audioElement.currentTime + SEEK_AMOUNT, audioElement.duration);
    }

    function _next() {
        pause();
        _notifySubscribers("next");        
    }

    function _prev() {
        pause();
        _notifySubscribers("prev");        
    }

    function _updateState() {
        status.textContent = "";

        if(audioElement.paused) {
            status.classList.remove("loading");
            status.innerHTML = "<img src='static/assets/play.png' alt='' />";
        } else if(buffering) {
            status.classList.add("loading");
            status.innerHTML = "<img src='static/assets/loading.png' alt='' />";
        } else {
            status.classList.remove("loading");
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