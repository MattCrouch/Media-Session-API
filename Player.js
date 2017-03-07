var Player = function(player) {
    let audioElement = document.createElement("audio");
    let activeItem;

    let artwork = document.querySelector("img.artwork");
    let description = document.querySelector(".description");
    let title = description.querySelector(".description .title");
    let album = description.querySelector(".description .album");
    let status = document.querySelector(".status");

    player.addEventListener("click", _togglePlayer);

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

        audioElement.play();

        _updateState();
    }

    function pause() {
        if(audioElement.paused) {
            return;
        }

        audioElement.pause();

        _updateState();
    }

    function _updateState() {
        status.textContent = "";

        if(audioElement.paused) {
            status.innerHTML = "<img src='assets/play.png' alt='' />";
        } else {
            status.innerHTML = "<img src='assets/pause.png' alt='' />";            
        }
    }

    return {
        getActiveItem: getActiveItem,
        setActiveItem: setActiveItem,
        play: play,
        pause: pause
    }
};