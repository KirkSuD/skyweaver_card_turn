(function() {
'use strict';

try {

console.log("Skyweaver card turn:", "start");

function cardTurnSubscriber(v) {
    let turn = 0, hand = [], handFromLocation=[],
        target = null, cardTurnDisplayText = null, noerror=true;
    // function getGameId() {
    //     const p = location.pathname;
    //     if (p.match(/^\/game\/([a-f0-9]){40}\/$/g)) {
    //         return location.pathname.slice(6, -1);
    //     }
    //     else {
    //         return null;
    //     }
    // }
    // const gameId = getGameId();
    const localStorageKey = "skyweaver_card_turn_addon_saved_hand";
    let savedHand;
    try {
        savedHand = JSON.parse(localStorage.getItem(localStorageKey));
    } catch (error) {
        savedHand = null;
    }
    if (savedHand) { //gameId && savedHand && gameId == savedHand.gameId) {
        console.log("Skyweaver card turn:", "load state from localStorage:", savedHand);
        ({turn, hand, handFromLocation} = savedHand);
    }
    return function(ev) {
        function draggable(elem) {
            let x, y;
            elem.onmousedown = function(e) {
                // console.log("Skyweaver card turn:", "mouse down");
                e = e || window.event;
                e.preventDefault();
                [x, y] = [e.clientX, e.clientY];
                // console.log("Skyweaver card turn:", "coord:", x, y, elem.offsetLeft, elem.offsetTop);
                document.onmousemove = function(e) {
                    e = e || window.event;
                    e.preventDefault();
                    let [dx, dy] = [e.clientX - x, e.clientY - y];
                    [x, y] = [e.clientX, e.clientY];
                    // console.log("Skyweaver card turn:", "mouse move", x, y, dx, dy);
                    // console.log("Skyweaver card turn:", "coord:", x, y, elem.offsetLeft, elem.offsetTop);
                    elem.style.left = (elem.offsetLeft + dx) + "px";
                    elem.style.top = (elem.offsetTop + dy) + "px";
                };
                document.onmouseup = function() {
                    // console.log("Skyweaver card turn:", "mouse up");
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            };
        }
        if (!noerror) {
            return;
        }
        try {
            const evt = ev.type, payload = ev.payload;
            if (target == null) {
                window.skyweaverWorkerProxyStoreEvents = [];
                target = 1-v.player;
                console.log("Skyweaver card turn:", "opponent:", target);
            }
            window.skyweaverWorkerProxyStoreEvents.push([turn, ev]);
            // JSON.stringify(window.skyweaverWorkerProxyStoreEvents) then copy object to debug
            if (evt == "GameEvent" && payload.event.type == "EnterPlayerAction" &&
                ((payload.event.payload ?? [])[1] ?? {type: null}).type == "Setup") {
                // new game, reset state
                console.log("Skyweaver card turn:", "new game");
                turn = 0, hand = [], handFromLocation=[];
            }
            if (evt == "GameEvent" && payload.event.type == "EnterPhase") {
                const eventPayload = payload.event.payload;
                if (eventPayload && eventPayload.type == "StartTurn" && eventPayload.payload == target) {
                    console.log("Skyweaver card turn:", "start turn", turn);
                    turn++;
                }
            }
            if (evt != "MoveCard") {
                return;
            }
            const from_player = payload.from.player,
                from_location = (payload.from.location ?? [{name: null}])[0].name,
                from_location_idx = (payload.from.location ?? [{}, null])[1],
                to_player = payload.to.player,
                to_location = (payload.to.location ?? [{name: null}])[0].name,
                to_location_idx = (payload.to.location ?? [{}, null])[1],
                from_target_hand = from_player == target && from_location == "Hand",
                to_target_hand = to_player == target && to_location == "Hand";
            if (from_target_hand && !to_target_hand) { // play card
                console.log("Skyweaver card turn:", "play", from_player, from_location, from_location_idx,
                    "->", to_player, to_location, to_location_idx);
                hand.splice(from_location_idx, 1);
                handFromLocation.splice(from_location_idx, 1);
            }
            else if (!from_target_hand && to_target_hand) { // draw / receive(?) card
                console.log("Skyweaver card turn:", "draw", from_player, from_location, from_location_idx,
                    "->", to_player, to_location, to_location_idx);
                hand.push(turn);
                handFromLocation.push(from_location);
            }
            localStorage.setItem(localStorageKey, JSON.stringify({
                turn, hand, handFromLocation
            }));

            if (cardTurnDisplayText == null) {
                console.log("Skyweaver card turn: create display text")
                cardTurnDisplayText = document.createElement("p");
                cardTurnDisplayText.id = "cardTurnDisplayText";
                cardTurnDisplayText.innerText = "Skyweaver card turn";
                document.getElementsByTagName("body")[0].appendChild(cardTurnDisplayText);
                draggable(cardTurnDisplayText);

                const newStyle = document.createElement("style");
                newStyle.innerHTML = `
                    #cardTurnDisplayText {
                        position: absolute;
                        /* right: 8px; */
                        left: 180px;
                        top: 10%;
                        width: 204px;
                        height: 50px;
                        color: white;
                        margin: 0;  /* margin != 0 would cause drag problem */
                        line-height: 50px;
                        text-align: center;
                        background-color: rgba(0, 0, 0, 0.5);  /* 0.3 */
                        /* border: solid rgba(255, 255, 255, 0.3); */
                        border: 2px solid rgba(146, 104, 230, 0.8);
                        border-bottom-left-radius: 12px;
                        border-top-right-radius: 12px;
                    }
                    #cardTurnDisplayText:hover {
                        filter: brightness(130%);
                    }
                `;
                document.getElementsByTagName("head")[0].appendChild(newStyle);
            }
            // cardTurnDisplayText.innerText = hand.join(" ");
            let innerH = "";
            for (let i=0; i<hand.length; ++i) {
                const isGift = !['CardSelection', 'Deck', 'Hand'].includes(handFromLocation[i]);
                if (isGift) {
                    innerH += `<span style="text-decoration:underline">${hand[i]}</span> `;
                }
                else {
                    innerH += `<span>${hand[i]}</span> `;
                }
            }
            cardTurnDisplayText.innerHTML = innerH;
        }
        catch (error) {
            console.log("Skyweaver card turn:", "cardTurnSubscriber error:", error);
            alert(
                "Skyweaver card turn extension: error occurred when processing event!" +
                "Disable extension and notify developer if this happened multiple times." +
                "Error detail: " + error
            );
            noerror = false;
        }
    }
}
function patchScript(originalJS) {
    const insertPoint = originalJS.indexOf("function cardEntityOwner(e){return");
    const insertCode = `
        try {
            v.subscribeToCardEvents((${cardTurnSubscriber})(v));
        }
        catch (error) {
            console.log("Skyweaver card turn:", "subscribeToCardEvents error:", error);
            alert(
                "Skyweaver card turn extension: error occurred when subscribing event!" +
                "Disable extension and notify developer if this happened multiple times." +
                "Error detail: " + error
            );
        }
        console.log("Skyweaver card turn:", "subscribeToCardEvents", "finish");
    `;
    return originalJS.slice(0, insertPoint) + insertCode + originalJS.slice(insertPoint);
}

const isFirefox = typeof browser != "undefined";
const thebrowser = isFirefox ? browser : chrome;
console.log("Skyweaver card turn:", "isFirefox:", isFirefox);
console.log("Skyweaver card turn:", "browser:", thebrowser);
thebrowser.webRequest.onBeforeRequest.addListener(
    function(details) {
        console.log("Skyweaver card turn:", "onBeforeRequest:", details.url);
        fetch(details.url).then(response => {
            return response.text();
        }).then(text => {
            text = patchScript(text);
            // text = "alert('success!');"
            function sendMessage() {
                console.log("Skyweaver card turn:", "sendMessage");
                thebrowser.tabs.sendMessage(targetTabId, text);
            }
            function tabUpdateListener(tabId, changeInfo, tab) {
                if (tabId == targetTabId && tab.status == "complete") {
                    sendMessage()
                }
                thebrowser.tabs.onUpdated.removeListener(tabUpdateListener);
            }
            let targetTabId;
            thebrowser.tabs.query({active: true}, ([tab]) => {
                targetTabId = tab.id;
                if (tab.status != "complete") {
                    console.log("Skyweaver card turn:", "content script still loading");
                    thebrowser.tabs.onUpdated.addListener(tabUpdateListener);
                }
                else {
                    sendMessage();
                }
            });
        })
        return {cancel: true};
    },
    {urls: ["https://play.skyweaver.net/game/*/main-*.js"], types: ["script"]},
    ["blocking"]
);
console.log("Skyweaver card turn:", "finish");

}
catch (error) {
    console.log("Skyweaver card turn:", "error:", error);
}

})();
