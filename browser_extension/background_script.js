(function() {
'use strict';

try {

console.log("Skyweaver card turn:", "start");

const isFirefox = typeof browser != "undefined";
const thebrowser = isFirefox ? browser : chrome;
console.log("Skyweaver card turn:", "isFirefox:", isFirefox);
// console.log("Skyweaver card turn:", "browser:", thebrowser);

if (!isFirefox) {
    // on firefox, every request, even the XHR request from extension, would trigger onBeforeRequest
    thebrowser.webRequest.onBeforeRequest.addListener(
        function(details) {
            console.log("Skyweaver card turn:", "onBeforeRequest: block URL:", details.url);
            return {cancel: true};
        },
        {urls: ["https://play.skyweaver.net/game/*/main-*.js"], types: ["script"]},
        ["blocking"]
    );
}
console.log("Skyweaver card turn:", "finish");

}
catch (error) {
    console.log("Skyweaver card turn:", "error:", error);
}

})();
