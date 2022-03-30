// ==UserScript==
// @name        Skyweaver opponent card draw turn memorizer
// @namespace   https://github.com/KirkSuD
// @version     2022.03.26.09
// @description This script remembers which turn the opponent drew the cards by replacing/patching JS.
// @match       https://play.skyweaver.net/game/*
// @author      KirkSuD
// @grant       GM.xmlHttpRequest
// @run-at      document-start
// ==/UserScript==

/*
# Skyweaver opponent card draw turn memorizer userscript

This script remembers which turn the opponent drew the cards by replacing/patching JS.  
This script is still in **Alpha** stage, and only supports **Firefox**.  
A browser extension which supports **Chrome** is done, stay tuned for the release.

[//]: # (![Screenshot](https://i.imgur.com/xg6Gq0D.png))
![Screenshot](https://i.imgur.com/Y48UsBB.png)

## Features

- Remember which turn the opponent drew the cards  
- Mark "gift cards" with an underline (cards not from CardSelection/Deck/Hand)  
- Draggable beautiful UI box  
- Save state in localStorage, so you can resume after refreshing the page  
- More features may or may not come in the future. Donate to motivate me!

## Restrictions

Only works on **Firefox** because not able to intercept body script on Chromium.  
Tested on GreaseMonkey & TamperMonkey.  
May not work on newer version of Skyweaver.  
When they update the code, rewriting code might be necessary
    because this script works by patching their code.

## Troubleshooting

To view the output of this script, search "Skyweaver card turn" in the developer tool's console.  
To help debugging, when you find something wrong,  
    open browser developer tool by pressing F12 right after the game,
    type "JSON.stringify(window.skyweaverWorkerProxyStoreEvents)",  
    then right click the output json message,
    click "copy object", save it as a text file,
    which contains all game events, useful for debugging.

## Disclaimer

This is software with absolutely no warranty.  
    Please disable this userscript and reload web page if you find something wrong.

## Changelog

### 2022.03.24.09

First version.
This would patch https://play.skyweaver.net/game/fbc69ea5693e28c1a859bc8f7bdaa9eeb88d958e/main-fea492886614074130ff.js

### 2022.03.25.16

Hot fix.
This would patch https://play.skyweaver.net/game/6e90311d3ead8634147fb04d62ca9a7c3c671ab1/main-0855b4c75acf85cb7f03.js  
Newer version may come in the form of browser extension in order to support Chrome.

### 2022.03.26.05

Regex matching "https://play.skyweaver.net/game/* /main-*.js" to patch  
Mark "gift cards" with an underline  
Draggable beautiful UI box  
Save & load state in localStorage  
Browser extension which supports Firefox & Chromium is done! Stay tuned.

## Donation

Winning using this userscript? Consider buying me a coffee!  
My crypto addresses:
```
BTC   bc1qttretrlxjfv2363zdg7xvthyvrstsru0mhangk  
ETH   0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
BNB   bnb1pqzkpxl5s5wc3s7h2hga5hq8sn98sz4a0xefec  
LUNA  terra1upxh8ufp3carg8z8nc39sdrsrn02cde8hxxlz9  
SOL   2V9Ux48XttpH3r4ZTg3rxRpd5fmLiYz2EAq2eCSNifCY  
DOT   14j8gPesPyxmw4eC1rBpUqgydT3xw7KJSo2dJ6VuigG9J4E9  
AVAX  0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
DOGE  DA19CxjfTkURNVxs5fNeZGNdsUPsStax5E  
MATIC 0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
LTC   ltc1qlgqh5aqemjazsfnq7zxayg6y75aqv7twl2r56d  
ATOM  cosmos1gaqjnqrz9aae2w03dw3zr3xr8un2tnpnv075rf  
FTT   0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
THETA 0xa3415F2e117A256c3371B7ee4a6340862A1294E9  
GRT   0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
CAKE  0x760a6c97eAcABFE46D6c602a371f42099d6a8576  
DASH  XgrxBD5KWjnYaScpNd6u4fGxiYfc9u2uBN  
DGB   dgb1q65h5v9990mrx2eutyu4xud23qlty6e5u66xzv9  
XNO   nano_1m5kn3h34gibzoz54g9yie5je5c6psiofiwr4tcx3um8up3abaz31z33tqo4  
TT    0x08AF0f949a8Af3027177C8b42B91d85f951a487B  
LBC   bZqCwFPuGDaQfH5W1QYy19Fs4uGF83UvgC
```
*/

console.log("Skyweaver card turn: Skyweaver opponent Skyweaver card turn start.");

function addScript(text) {
    const newScript = document.createElement('script');
    newScript.textContent = text;
    document.getElementsByTagName('head')[0].appendChild(newScript);
}

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
function startCardTurnCounter(originalJS) {
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
    const newJS = originalJS.slice(0, insertPoint) + insertCode + originalJS.slice(insertPoint);
    addScript(newJS);
    console.log("Skyweaver card turn: patched script.");
}

window.addEventListener('beforescriptexecute', function(e) {
    const src = e.target.src;
    console.log("Skyweaver card turn: detect script:", src);
    // if (src === "https://play.skyweaver.net/game/fbc69ea5693e28c1a859bc8f7bdaa9eeb88d958e/main-fea492886614074130ff.js") {
    // if (src === "https://play.skyweaver.net/game/6e90311d3ead8634147fb04d62ca9a7c3c671ab1/main-0855b4c75acf85cb7f03.js") {
    if (src.match(/^https:\/\/play\.skyweaver\.net\/game\/([a-f0-9]){40}\/main-([a-f0-9]){20}.js$/g)) {
        console.log("Skyweaver card turn: patching script.");
        e.preventDefault();
        e.stopPropagation();
        GM.xmlHttpRequest({
            method: "GET",
            url: e.target.src,
            onload: function(response) {
                startCardTurnCounter(response.responseText);
            }
        });
    }
});
