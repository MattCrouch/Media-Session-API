var Player = function(player) {
    let subscribers = [];
    let audioElement = document.createElement("audio");
    let activeItem;
    let buffering = false;

    const SEEK_AMOUNT = 30;

    //Cache DOM to avoid having to keep requesting them
    let artwork = document.querySelector("img.artwork");
    let description = document.querySelector(".description");
    let title = description.querySelector(".description .title");
    let album = description.querySelector(".description .album");
    let progress = document.querySelector(".now-playing progress");
    let status = document.querySelector(".now-playing .status");

    //Apply event listeners for component and audio element itself
    player.addEventListener("click", _togglePlayer);
    player.addEventListener("keydown", _handleKeyDown);    
    audioElement.addEventListener("playing", _audioPlay);
    audioElement.addEventListener("pause", _audioPause);
    audioElement.addEventListener("waiting", _audioWaiting);
    audioElement.addEventListener("ended", _next);
    audioElement.addEventListener("loadedmetadata", _setProgress);
    audioElement.addEventListener("timeupdate", _updateProgress);

    //Apply action handlers for Media Session API
    _setUpMediaSessionListeners();
    
    function _setUpMediaSessionListeners() {
        //Check if Media Session API is supported
        if('mediaSession' in navigator) {
            //Apply appropriate action handlers
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
        //Store reference to item
        activeItem = item;

        //Apply data from PlaylistItem to component
        artwork.src = item.artwork[0].src;
        description.classList.remove("hidden");
        title.textContent = item.title;
        album.textContent = item.album;

        if(item.url) {
            audioElement.src = item.url;
        } else {
            audioElement.src = "";
        }

        //Reset the scrubber
        progress.value = 0;
        progress.max = 0; //Until metadata appears

        //Add a more useful label to player for assistive technologies
        player.setAttribute("aria-label", `Playing ${item.title} from ${item.album}`);

        status.classList.remove("hidden");

        //Refresh the view to reflect the state inside this component
        _updateState();
    }

    //Toggle between pausing and playing the audio
    function _togglePlayer() {
        if(audioElement.paused) {
            play();
        } else {
            pause();
        }
    }

    //Detect any keyboard input on the component
    function _handleKeyDown(e) {
        if(e.keyCode == 13) {
            //Hit enter
            _togglePlayer();
        }
    }

    //What to do when the audio should start playing
    function _audioPlay() {
        activeItem.playing = true;
        buffering = false;

        //Update the view with the current state
        _updateState();

        //Tell the Playlist about the state of the player
        _notifySubscribers("play");
    }

    //What to do when the audio should stop playing    
    function _audioPause() {
        activeItem.playing = false;

        //Update the view with the current state
        _updateState();

        //Tell the Playlist about the state of the player
        _notifySubscribers("pause");
    }

    //What to do while the audio is buffering
    function _audioWaiting() {
        activeItem.playing = false;
        buffering = true;

        //Update the view with the current state
        _updateState();

        //Tell the Playlist about the state of the player
        _notifySubscribers("waiting");
    }

    //Update the scrubber with the total length of the audio
    function _setProgress(e) {
        progress.max = audioElement.duration;
    }

    //Update the scrubber with the total progress of the audio
    function _updateProgress(e) {
        progress.value = audioElement.currentTime;
    }

    //Play the audio if necessary
    function play() {
        if(!audioElement.paused) {
            return;
        }

        //Let audio element listeners handle further updates
        let playAudioElement = audioElement.play();

        //Only Chrome returns a Promise. Use that if available.
        if(playAudioElement !== undefined) {
            playAudioElement.then(() => {
                //Update Media Sesssion API with data on track
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

    //Pause the audio if necessary
    function pause() {
        if(audioElement.paused) {
            return;
        }

        //Let audio element listeners handle further updates
        audioElement.pause();
    }

    //Jump back 30s
    function _seekBackward() {
        audioElement.currentTime = Math.max(audioElement.currentTime - SEEK_AMOUNT, 0);
    }

    //Jump ahead 30s
    function _seekForward() {
        audioElement.currentTime = Math.min(audioElement.currentTime + SEEK_AMOUNT, audioElement.duration);
    }

    //Instruct the playlist to move to the next item
    function _next() {
        pause();

        //Tell the Playlist about the state of the player
        _notifySubscribers("next");        
    }

    //Instruct the playlist to move to the previous item
    function _prev() {
        pause();

        //Tell the Playlist about the state of the player
        _notifySubscribers("prev");        
    }

    //Update the page to reflect the state of the player
    function _updateState() {
        //Clear any existing status
        status.textContent = "";

        //Adjust the status based on paused/buffering status of the audio element
        if(audioElement.paused) {
            status.classList.remove("loading");
            status.innerHTML = "<img src='static/assets/play.png' alt='' />";
        } else if(buffering) {
            //Add loading class to make our spinner spin
            status.classList.add("loading");
            status.innerHTML = "<img src='static/assets/loading.png' alt='' />";
        } else {
            status.classList.remove("loading");
            status.innerHTML = "<img src='static/assets/pause.png' alt='' />";            
        }
    }

    //Update the Media Session API with information about the current PlaylistItem
    function _applyMetadata() {
        if('mediaSession' in navigator && activeItem) {
            navigator.mediaSession.metadata = new MediaMetadata(activeItem);
        }
    }

    //Allow any other components to listen for changes within this component
    function subscribe(subscriber) {
        subscribers.push(subscriber);
    }

    //Process any incoming messages from other components
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

    //Tell any other components about what's happening in the Player
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