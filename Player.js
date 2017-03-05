var Player = function(player) {
    let audioElement = document.createElement("audio");
    let activeItem;

    function getActiveItem() {
        return activeItem;
    }

    function setActiveItem(item) {
        activeItem = item;

        //Update view
    }

    return {
        getActiveItem: getActiveItem,
        setActiveItem: setActiveItem
    }
};